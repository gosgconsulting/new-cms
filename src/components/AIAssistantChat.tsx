import React, { useState, useRef, useEffect } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { cn } from "@/lib/utils";
import api from "../../sparti-cms/utils/api";
import { useAuth } from "../../sparti-cms/components/auth/AuthProvider";

interface PageContext {
  slug: string;
  pageName: string;
  pageId?: number;
  tenantId: string;
  layout?: {
    components: any[];
  };
}

interface AIAssistantChatProps {
  className?: string;
  pageContext?: {
    slug: string;
    pageName: string;
    tenantId?: string;
  } | null;
  currentComponents?: any[];
  onUpdateComponents?: (components: any[]) => void;
  onOpenJSONEditor?: () => void;
  selectedComponentJSON?: any; // Component JSON selected from left panel
  onComponentSelected?: (component: any) => void; // Callback when component is selected
}

interface SelectedComponent {
  id: string;
  tagName: string;
  selector: string;
  filePath?: string;
  lineNumber?: number;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps & { onProposedComponents?: (components: any[]) => void; onActionStatus?: (status: string) => void }> = ({ 
  className, 
  pageContext, 
  currentComponents, 
  onUpdateComponents, 
  onOpenJSONEditor, 
  selectedComponentJSON, 
  onComponentSelected,
  onProposedComponents,
  onActionStatus
}) => {
  const { currentTenantId } = useAuth();
  // Always open - no collapse functionality
  const [messages, setMessages] = useState<Array<{ id: string; content: string; role: 'user' | 'assistant' }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContextData, setPageContextData] = useState<PageContext | null>(null);
  const [loadingPageContext, setLoadingPageContext] = useState(false);
  const [isSelectorActive, setIsSelectorActive] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const [focusedComponentJSON, setFocusedComponentJSON] = useState<any>(null);
  const [componentHierarchy, setComponentHierarchy] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copyWorkflowActive, setCopyWorkflowActive] = useState(false);
  const [copyStep, setCopyStep] = useState<'idle' | 'asking' | 'received'>('idle');
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  // Track last auto-generation to avoid repeats on re-renders
  const lastAutoGenRef = useRef<{ type: 'page' | 'section'; key?: string } | null>(null);
  // NEW: cancellation and abort controller refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const cancelRequestedRef = useRef(false);

  // Remove JSON code blocks from assistant messages (keep friendly status line)
  const sanitizeAssistantMessage = (msg: string) => {
    if (/```[\s\S]*```/m.test(msg)) {
      return 'Draft prepared. Review it in the Output tab.';
    }
    return msg;
  };

  // Clear all messages and reset chat
  const clearAllMessages = () => {
    // Cancel any in-flight or queued work
    cancelRequestedRef.current = true;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {}
    }
    setIsBatchGenerating(false);
    setIsLoading(false);
    setMessages([]);
    setError(null);
    setFocusedComponentJSON(null);
    setComponentHierarchy([]);
    // Reset last auto-gen so it won't immediately re-trigger unless user reselects
    lastAutoGenRef.current = null;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load page context when pageContext prop changes
  useEffect(() => {
    const loadPageContext = async () => {
      if (!pageContext) {
        setPageContextData(null);
        return;
      }

      // Use tenantId from pageContext if provided, otherwise fall back to currentTenantId
      const effectiveTenantId = pageContext.tenantId || currentTenantId;
      if (!effectiveTenantId) {
        console.warn('[testing] No tenant ID available for page context');
        setPageContextData(null);
        return;
      }

      try {
        setLoadingPageContext(true);
        // Fetch page context from API (using query parameter for slug to handle slashes)
        const encodedSlug = encodeURIComponent(pageContext.slug);
        const response = await api.get(`/api/ai-assistant/page-context?slug=${encodedSlug}&tenantId=${effectiveTenantId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.pageContext) {
            setPageContextData(data.pageContext);
          } else {
            console.warn('[testing] Failed to load page context:', data.error);
            setPageContextData(null);
          }
        } else {
          // Try to get error message from response
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const errorText = await response.text().catch(() => '');
            if (errorText.includes('<!DOCTYPE')) {
              errorMessage = 'Page not found or authentication error';
            }
          }
          console.error('[testing] Failed to load page context:', response.status, errorMessage);
          setPageContextData(null);
        }
      } catch (error: any) {
        console.error('[testing] Error loading page context:', error);
        setPageContextData(null);
      } finally {
        setLoadingPageContext(false);
      }
    };

    loadPageContext();
  }, [pageContext?.slug, pageContext?.pageName, pageContext?.tenantId, currentTenantId]);

  // Handle component selection from left panel
  useEffect(() => {
    if (!selectedComponentJSON) return;

    // If Sections (page-level) is clicked: set a page-level focus label, no auto-send
    if ((selectedComponentJSON as any).__scope === 'page') {
      const pageName = pageContext?.pageName || pageContextData?.pageName || 'Page';
      setFocusedComponentJSON({ type: pageName });
      setComponentHierarchy([pageName]);
      if (onComponentSelected) onComponentSelected(selectedComponentJSON);
      return;
    }

    // A specific section was clicked: set focus only (no auto-send)
    setFocusedComponentJSON(selectedComponentJSON);

    const buildHierarchyPath = (component: any) => {
      const path: string[] = [];
      if (component.parentType || component.parent) {
        const parentName = component.parentType || component.parent?.type || component.parent?.name || 'Parent Component';
        path.push(parentName);
      } else if (component.parentId && currentComponents) {
        const parentComponent = currentComponents.find(c => c.id === component.parentId);
        if (parentComponent) {
          path.push(parentComponent.type || parentComponent.name || 'Parent Component');
        }
      } else if (component.path) {
        const parts = component.path.split('/').filter(Boolean);
        path.push(...parts);
      } else if (component.selector) {
        const selectorParts = component.selector.split(' ').filter((p: string) => !p.startsWith('.') && !p.startsWith('#'));
        if (selectorParts.length > 1) {
          path.push(...selectorParts.slice(0, -1).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)));
        }
      }
      const currentName = component.type || component.name || component.key || component.tagName || 'Component';
      path.push(currentName);
      return path;
    };

    const hierarchy = buildHierarchyPath(selectedComponentJSON);
    setComponentHierarchy(hierarchy);
    if (onComponentSelected) onComponentSelected(selectedComponentJSON);
  }, [selectedComponentJSON, onComponentSelected, currentComponents, pageContext?.pageName, pageContextData?.pageName]);

  // Clear focus when selection is cleared (e.g., clicking 'Sections')
  // Removed auto-clearing of focus so it persists until another selection is made

  // Component selector: Find iframe and inject selector script
  useEffect(() => {
    if (!isSelectorActive || !pageContext) return;

    // Find the iframe in the parent component
    const findIframe = () => {
      // Try multiple selectors to find the iframe
      const iframe = document.getElementById('visual-editor-iframe') as HTMLIFrameElement ||
                     document.querySelector('#visual-editor-iframe-container iframe') as HTMLIFrameElement ||
                     document.querySelector('[class*="flex-1 relative"] iframe') as HTMLIFrameElement;
      return iframe;
    };

    const iframe = findIframe();
    if (!iframe) {
      console.warn('[testing] Iframe not found for component selector');
      return;
    }

    iframeRef.current = iframe;

    const injectSelectorScript = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.warn('[testing] Cannot access iframe document');
          return;
        }

        // Remove existing selector if present
        const existingScript = iframeDoc.getElementById('component-selector-script');
        if (existingScript) {
          existingScript.remove();
        }

        // Create and inject selector script
        const script = iframeDoc.createElement('script');
        script.id = 'component-selector-script';
        script.textContent = `
          (function() {
            let hoveredElement = null;
            let hoverOverlay = null;
            let selectedElements = [];
            
            // Create overlay for hover indication
            function createOverlay() {
              if (hoverOverlay) return hoverOverlay;
              hoverOverlay = document.createElement('div');
              hoverOverlay.id = 'component-selector-overlay';
              hoverOverlay.style.cssText = 'position: fixed; pointer-events: none; z-index: 999999; border: 2px solid #9b87f5; background: rgba(155, 135, 245, 0.1); transition: all 0.1s;';
              document.body.appendChild(hoverOverlay);
              return hoverOverlay;
            }
            
            // Create label for component name
            function createLabel() {
              let label = document.getElementById('component-selector-label');
              if (!label) {
                label = document.createElement('div');
                label.id = 'component-selector-label';
                label.style.cssText = 'position: fixed; pointer-events: none; z-index: 1000000; background: #9b87f5; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: system-ui; font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
                document.body.appendChild(label);
              }
              return label;
            }
            
            // Get element info
            function getElementInfo(el) {
              if (!el) return null;
              
              const tagName = el.tagName.toLowerCase();
              let selector = tagName;
              
              // Try to get a better selector
              if (el.id) {
                selector = '#' + el.id;
              } else if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(' ').filter(c => c).slice(0, 2).join('.');
                if (classes) selector = tagName + '.' + classes;
              }
              
              // Try to get file path from data attributes or component info
              // Check for lovable-tagger attributes
              let filePath = el.getAttribute('data-lovable-component') ||
                           el.getAttribute('data-component-file') || 
                           el.getAttribute('data-file') ||
                           (el.closest('[data-lovable-component]')?.getAttribute('data-lovable-component')) ||
                           (el.closest('[data-component-file]')?.getAttribute('data-component-file'));
              
              let lineNumber;
              
              // Extract from data-lovable-component format: "ComponentName:filepath:line"
              if (filePath && filePath.includes(':')) {
                const parts = filePath.split(':');
                if (parts.length >= 3) {
                  filePath = parts.slice(1, -1).join(':'); // Get file path (middle parts)
                  lineNumber = parseInt(parts[parts.length - 1]); // Last part is line number
                }
              } else {
                lineNumber = el.getAttribute('data-line') ? 
                            parseInt(el.getAttribute('data-line')) : 
                            (el.closest('[data-line]')?.getAttribute('data-line') ? 
                             parseInt(el.closest('[data-line]').getAttribute('data-line')) : undefined);
              }
              
              return {
                tagName: tagName,
                selector: selector,
                filePath: filePath,
                lineNumber: lineNumber
              };
            }
            
            // Update overlay position
            function updateOverlay(el) {
              if (!el) {
                if (hoverOverlay) hoverOverlay.style.display = 'none';
                const label = document.getElementById('component-selector-label');
                if (label) label.style.display = 'none';
                return;
              }
              
              const rect = el.getBoundingClientRect();
              const overlay = createOverlay();
              const label = createLabel();
              
              overlay.style.display = 'block';
              overlay.style.left = (rect.left + window.scrollX) + 'px';
              overlay.style.top = (rect.top + window.scrollY) + 'px';
              overlay.style.width = rect.width + 'px';
              overlay.style.height = rect.height + 'px';
              
              const info = getElementInfo(el);
              if (info) {
                label.style.display = 'block';
                label.textContent = info.tagName + (info.filePath ? ' ' + info.filePath : '');
                label.style.left = (rect.left + window.scrollX) + 'px';
                label.style.top = (rect.top + window.scrollY - 24) + 'px';
              }
            }
            
            // Handle mouse move
            function handleMouseMove(e) {
              const target = e.target;
              if (target === hoveredElement) return;
              
              hoveredElement = target;
              updateOverlay(target);
            }
            
            // Handle click
            function handleClick(e) {
              e.preventDefault();
              e.stopPropagation();
              
              const target = e.target;
              const info = getElementInfo(target);
              
              if (info) {
                const componentId = 'comp-' + Date.now();
                const component = {
                  id: componentId,
                  tagName: info.tagName,
                  selector: info.selector,
                  filePath: info.filePath,
                  lineNumber: info.lineNumber
                };
                
                // Check if already selected
                const existing = selectedElements.find(c => 
                  c.selector === component.selector && 
                  c.tagName === component.tagName
                );
                
                if (!existing) {
                  selectedElements.push(component);
                  
                  // Send to parent
                  window.parent.postMessage({
                    type: 'COMPONENT_SELECTED',
                    component: component
                  }, '*');
                  
                  // Visual feedback
                  target.style.outline = '2px solid #9b87f5';
                  target.style.outlineOffset = '2px';
                  setTimeout(() => {
                    target.style.outline = '';
                    target.style.outlineOffset = '';
                  }, 300);
                }
              }
            }
            
            // Cleanup function
            function cleanup() {
              if (hoverOverlay) {
                hoverOverlay.remove();
                hoverOverlay = null;
              }
              const label = document.getElementById('component-selector-label');
              if (label) label.remove();
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('click', handleClick, true);
            }
            
            // Initialize
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('click', handleClick, true);
            
            // Listen for disable message
            window.addEventListener('message', (e) => {
              if (e.data && e.data.type === 'DISABLE_COMPONENT_SELECTOR') {
                cleanup();
              }
            });
            
            // Store cleanup function
            window.componentSelectorCleanup = cleanup;
          })();
        `;
        
        iframeDoc.head.appendChild(script);
        console.log('[testing] Component selector script injected');
      } catch (error) {
        console.error('[testing] Error injecting selector script:', error);
      }
    };

    // Wait for iframe to load
    if (iframe.contentDocument?.readyState === 'complete') {
      injectSelectorScript();
    } else {
      iframe.addEventListener('load', injectSelectorScript);
    }

    // Cleanup on unmount or when selector is disabled
    return () => {
      if (iframeRef.current) {
        try {
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            iframeRef.current.contentWindow?.postMessage({ type: 'DISABLE_COMPONENT_SELECTOR' }, '*');
            const script = iframeDoc.getElementById('component-selector-script');
            if (script) script.remove();
            const overlay = iframeDoc.getElementById('component-selector-overlay');
            if (overlay) overlay.remove();
            const label = iframeDoc.getElementById('component-selector-label');
            if (label) label.remove();
          }
        } catch (error) {
          console.error('[testing] Error cleaning up selector:', error);
        }
      }
    };
  }, [isSelectorActive, pageContext]);

  // Listen for component selection from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'COMPONENT_SELECTED') {
        const component = event.data.component as SelectedComponent;
        setSelectedComponents(prev => {
          // Check if already exists
          const exists = prev.find(c => 
            c.selector === component.selector && 
            c.tagName === component.tagName
          );
          if (exists) return prev;
          return [...prev, component];
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Toggle selector mode
  useEffect(() => {
    const handleToggle = (event: CustomEvent) => {
      setIsSelectorActive(event.detail.active);
    };

    window.addEventListener('toggle-component-selector', handleToggle as EventListener);
    return () => window.removeEventListener('toggle-component-selector', handleToggle as EventListener);
  }, []);

  // Helper function to submit a message programmatically
  const submitMessage = async (message: string) => {
    if (cancelRequestedRef.current) return;
    if (!message.trim() || isLoading) {
      return;
    }

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const,
    };

    setMessages((prev) => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    // Prepare a fresh abort controller for this request
    cancelRequestedRef.current = false;
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch {}
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Prepare conversation history (last 10 messages to avoid token limits)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the current user message to history
      conversationHistory.push({
        role: 'user',
        content: message
      });

      // Get active tools from textarea data attribute (if available)
      const messageInput = document.querySelector('textarea[data-selector-active]') as HTMLTextAreaElement;
      const activeToolsString = messageInput?.dataset.selectedTools || '';
      const activeTools = activeToolsString ? activeToolsString.split(',') : [];
      const selectedModel = messageInput?.dataset.selectedModel || 'claude-3-5-haiku-20241022';
      const mode = (messageInput?.dataset.mode as 'edit' | 'ask') || 'edit';

      // If in Edit mode: auto-draft outputs for focused section or all sections, then exit early
      if (mode === 'edit') {
        // If focused component represents a page-level placeholder, treat as ALL
        const isPageScopeOnly = focusedComponentJSON && Object.keys(focusedComponentJSON).length === 1 && focusedComponentJSON.type && !focusedComponentJSON.key;
        if (focusedComponentJSON && !isPageScopeOnly) {
          await handleGenerateSingleOutput(focusedComponentJSON, message);
        } else {
          await handleGenerateAllOutputs(message);
        }
        setIsLoading(false);
        return;
      }

      // Ask mode continues here: build selected components context, page context, and call AI
      let enhancedMessage = message;
      if (selectedComponents.length > 0) {
        const componentsInfo = selectedComponents.map(comp => {
          let info = `${comp.tagName} (${comp.selector})`;
          if (comp.filePath) {
            info += ` - ${comp.filePath}`;
            if (comp.lineNumber) info += `:${comp.lineNumber}`;
          }
          return info;
        }).join(', ');
        enhancedMessage = `[Selected Components: ${componentsInfo}]\n\n${message}`;
      }

      let finalPageContext = undefined;
      try {
        if (pageContextData) {
          finalPageContext = {
            slug: pageContextData.slug,
            tenantId: pageContextData.tenantId,
            layout: pageContextData.layout
          };
        }

        if (currentComponents && currentComponents.length > 0) {
          finalPageContext = {
            ...finalPageContext,
            layout: {
              components: currentComponents
            }
          } as any;
        }

        if (focusedComponentJSON) {
          if (!finalPageContext) {
            finalPageContext = {} as any;
          }
          finalPageContext.focusedComponent = focusedComponentJSON;
          try {
            const componentPath = componentHierarchy.length > 1 ? componentHierarchy.join(' > ') : (focusedComponentJSON.type || focusedComponentJSON.key || 'Component');
            enhancedMessage = `[Focused Component: ${componentPath}]\n\nComponent JSON:\n${JSON.stringify(focusedComponentJSON, null, 2)}\n\n---\n\nUser Question: ${enhancedMessage}`;
          } catch (jsonError) {
            console.warn('[testing] Error stringifying focused component, continuing without it:', jsonError);
          }
        }
      } catch (contextError) {
        console.warn('[testing] Error building page context, continuing without it:', contextError);
        finalPageContext = undefined;
      }

      // Ask mode: Call Claude API with page context
      const response = await api.post('/api/ai-assistant/chat', {
        message: enhancedMessage,
        conversationHistory: conversationHistory.slice(0, -1),
        pageContext: finalPageContext,
        activeTools: activeTools.length > 0 ? activeTools : undefined,
        selectedComponents: selectedComponents.length > 0 ? selectedComponents : undefined,
        model: selectedModel
      }, { signal });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Server returned HTML instead of JSON. This usually means the API endpoint was not found or authentication failed. Status: ${response.status}`);
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Expected JSON but received ${contentType}. Response: ${errorText.substring(0, 200)}`);
      }

      if (cancelRequestedRef.current) return;
      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          // Ask mode: show message directly in chat; Edit mode handled earlier
          content: data.message,
          role: 'assistant' as const,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Try to extract and apply JSON from the response if callbacks are provided (Ask may include examples)
        if (onProposedComponents || onUpdateComponents) {
          try {
            let jsonString: string | null = null;
            const jsonMatch = data.message.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              jsonString = jsonMatch[1];
            } else {
              const directJsonMatch = data.message.match(/\{[\s\S]*"components"[\s\S]*\}/);
              if (directJsonMatch) {
                jsonString = directJsonMatch[0];
              } else {
                const arrayMatch = data.message.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (arrayMatch) {
                  jsonString = arrayMatch[0];
                }
              }
            }

            if (jsonString) {
              const parsed = JSON.parse(jsonString);
              let componentsArray: any[] = [];
              if (Array.isArray(parsed)) {
                componentsArray = parsed;
              } else if (parsed.components && Array.isArray(parsed.components)) {
                componentsArray = parsed.components;
              } else if (parsed && typeof parsed === 'object' && parsed.key && parsed.type) {
                componentsArray = [parsed];
              }

              if (componentsArray.length > 0) {
                // If we're focused on a single component and only one proposal came back,
                // ensure it carries the same key/type so the page can match and render it.
                if (componentsArray.length === 1 && focusedComponentJSON?.key) {
                  componentsArray[0] = {
                    ...componentsArray[0],
                    key: focusedComponentJSON.key,
                    type: componentsArray[0].type || focusedComponentJSON.type
                  };
                } else if (focusedComponentJSON?.key) {
                  // If multiple proposals, try to assign key to the one matching type
                  const idx = componentsArray.findIndex(p => (p?.type || '').toLowerCase() === (focusedComponentJSON?.type || '').toLowerCase());
                  if (idx >= 0 && !componentsArray[idx].key) {
                    componentsArray[idx] = {
                      ...componentsArray[idx],
                      key: focusedComponentJSON.key,
                      type: componentsArray[idx].type || focusedComponentJSON.type
                    };
                  }
                }
                
                if (cancelRequestedRef.current) return;
                if (onProposedComponents) {
                  onProposedComponents(componentsArray);
                } else if (onUpdateComponents) {
                  onUpdateComponents(componentsArray);
                }
              }
            }
          } catch (error) {
            // JSON parsing failed, which is fine
          }
        }
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError' || cancelRequestedRef.current) {
        // Swallow abort errors silently
        return;
      }
      console.error('[testing] Editor Error:', error);
      setError(error.message || 'Failed to get AI response. Please try again.');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error.message || 'Failed to get AI response. Please check your API key configuration.'}`,
        role: 'assistant' as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      if (!cancelRequestedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Send a message to AI without appending the user payload to chat (used by Copywriting)
  const sendHiddenMessage = async (hiddenMessage: string, options?: { silent?: boolean; attachKey?: string; attachType?: string }) => {
    if (cancelRequestedRef.current) return;
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    // Fresh abort controller for this hidden request
    cancelRequestedRef.current = false;
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch {}
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    try {
      // Build a short history (assistant can reference previous Q/A)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      const selectedModel = 'claude-3-5-haiku-20241022';
      // Send to API, but do not append the user message to chat
      const response = await api.post('/api/ai-assistant/chat', {
        message: hiddenMessage,
        conversationHistory,
        pageContext: pageContext ? { slug: pageContext.slug, tenantId: pageContext.tenantId } : undefined,
        model: selectedModel
      }, { signal });
      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        const payload = ct.includes('application/json') ? await response.json().catch(() => ({})) : {};
        throw new Error(payload.error || `HTTP error! status: ${response.status}`);
      }
      if (cancelRequestedRef.current) return;
      const data = await response.json();
      if (data.success && data.message) {
        // Optionally suppress the assistant message to avoid spam during batch generation
        if (!options?.silent) {
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: sanitizeAssistantMessage(data.message),
            role: 'assistant' as const,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
 
        // Parse any proposed JSON; route to proposals callback (or fallback to applying)
        if (onProposedComponents || onUpdateComponents) {
          try {
            let jsonString: string | null = null;
            const jsonMatch = data.message.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              jsonString = jsonMatch[1];
            } else {
              const directJsonMatch = data.message.match(/\{[\s\S]*"components"[\s\S]*\}/);
              if (directJsonMatch) {
                jsonString = directJsonMatch[0];
              } else {
                const arrayMatch = data.message.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (arrayMatch) {
                  jsonString = arrayMatch[0];
                }
              }
            }
            if (jsonString) {
              const parsed = JSON.parse(jsonString);
              let componentsArray: any[] = [];
              if (Array.isArray(parsed)) {
                componentsArray = parsed;
              } else if (parsed.components && Array.isArray(parsed.components)) {
                componentsArray = parsed.components;
              } else if (parsed && typeof parsed === 'object' && parsed.key && parsed.type) {
                componentsArray = [parsed];
              }

              // Attach key/type so the editor can match drafts to the right section
              if (componentsArray.length > 0) {
                if (options?.attachKey) {
                  if (componentsArray.length === 1) {
                    componentsArray[0] = {
                      ...componentsArray[0],
                      key: options.attachKey,
                      type: componentsArray[0].type || options.attachType
                    };
                  } else {
                    const idx = componentsArray.findIndex(p => 
                      (p?.type || '').toLowerCase() === (options.attachType || '').toLowerCase()
                    );
                    if (idx >= 0) {
                      componentsArray[idx] = {
                        ...componentsArray[idx],
                        key: options.attachKey,
                        type: componentsArray[idx].type || options.attachType
                      };
                    } else {
                      // Fallback: assign to first if nothing matches
                      componentsArray[0] = {
                        ...componentsArray[0],
                        key: options.attachKey,
                        type: componentsArray[0].type || options.attachType
                      };
                    }
                  }
                } else if (focusedComponentJSON?.key) {
                  // Fallback to focused component (single-section edit)
                  if (componentsArray.length === 1) {
                    componentsArray[0] = {
                      ...componentsArray[0],
                      key: focusedComponentJSON.key,
                      type: componentsArray[0].type || focusedComponentJSON.type
                    };
                  } else {
                    const idx = componentsArray.findIndex(p => 
                      (p?.type || '').toLowerCase() === (focusedComponentJSON?.type || '').toLowerCase()
                    );
                    if (idx >= 0 && !componentsArray[idx].key) {
                      componentsArray[idx] = {
                        ...componentsArray[idx],
                        key: focusedComponentJSON.key,
                        type: componentsArray[idx].type || focusedComponentJSON.type
                      };
                    }
                  }
                }
              }

              if (componentsArray.length > 0) {
                if (cancelRequestedRef.current) return;
                if (onProposedComponents) {
                  onProposedComponents(componentsArray);
                } else if (onUpdateComponents) {
                  onUpdateComponents(componentsArray);
                }
              }
            }
          } catch {
            // Ignore JSON parsing failure
          }
        }
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || cancelRequestedRef.current) {
        return;
      }
      setError(err.message || 'Failed to get AI response.');
      if (!options?.silent) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: `Error: ${err.message || 'Failed to get AI response.'}`,
            role: 'assistant' as const,
          }
        ]);
      }
    } finally {
      if (!cancelRequestedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Generate output for one section (silent)
  const handleGenerateSingleOutput = async (componentJson: any, userMessage?: string) => {
    if (cancelRequestedRef.current) return;
    const sectionName = componentJson?.type || componentJson?.key || 'this section';

    // NEW: Real-time progress - drafting start
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + Math.random()).toString(),
        role: 'assistant',
        content: `Drafting: ${sectionName}...`,
      },
    ]);

    const perComponentInstruction =
      `[Workflow: Copywriting Per-Section]\n` +
      (userMessage ? `Apply the following brief/request to this section:\n"${userMessage}"\n\n` : ``) +
      `Propose improved copy for this single section only.\n` +
      `Return ONLY the updated component JSON (same key and type), modifying text fields and items as needed.\n` +
      `Do not wrap in code fences. Do not change keys or remove fields.\n\n` +
      `Component JSON:\n${JSON.stringify(componentJson, null, 2)}`;
    await sendHiddenMessage(perComponentInstruction, { silent: true, attachKey: componentJson?.key, attachType: componentJson?.type });
    if (cancelRequestedRef.current) return;

    // NEW: Real-time progress - drafting done
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + Math.random()).toString(),
        role: 'assistant',
        content: `Draft ready: ${sectionName}`,
      },
    ]);
  };

  // Generate output for all sections by iterating each component silently
  const handleGenerateAllOutputs = async (userMessage?: string) => {
    if (isLoading || isBatchGenerating || cancelRequestedRef.current) return;
    const schemaComponents =
      (currentComponents && currentComponents.length > 0)
        ? currentComponents
        : (pageContextData?.layout?.components || []);
    if (!schemaComponents || schemaComponents.length === 0) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: 'No sections found to generate output.' }
      ]);
      return;
    }
    setIsBatchGenerating(true);
    // Inform user once
    setMessages(prev => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'assistant', content: `Generating drafts for ${schemaComponents.length} sections...` }
    ]);
    // Iterate per section with focused instructions
    for (let i = 0; i < schemaComponents.length; i++) {
      if (cancelRequestedRef.current) break;
      const comp = schemaComponents[i];
      const sectionName = comp?.type || comp?.key || `Section ${i + 1}`;

      // NEW: Real-time progress - drafting start
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + Math.random()).toString(),
          role: 'assistant',
          content: `Drafting: ${sectionName}...`,
        },
      ]);

      const perComponentInstruction =
        `[Workflow: Copywriting Per-Section]\n` +
        (userMessage ? `Apply the following brief/request to this section:\n"${userMessage}"\n\n` : ``) +
        `Using the earlier brief and context, propose improved copy for this single section only.\n` +
        `Return ONLY the updated component JSON (same key and type), modifying text fields and items as needed.\n` +
        `Do not wrap in code fences. Do not change keys or remove fields.\n\n` +
        `Component JSON:\n${JSON.stringify(comp, null, 2)}`;
      // Silent call to avoid chat spam; proposals are merged via onProposedComponents
      await sendHiddenMessage(perComponentInstruction, { silent: true, attachKey: comp?.key, attachType: comp?.type });

      if (cancelRequestedRef.current) break;

      // NEW: Real-time progress - drafting done
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + Math.random()).toString(),
          role: 'assistant',
          content: `Draft ready: ${sectionName}`,
        },
      ]);
    }
    // Final notice
    if (!cancelRequestedRef.current) {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 2).toString(), role: 'assistant', content: 'All drafts prepared. Open each section\'s Output tab to review and apply.' }
      ]);
    }
    setIsBatchGenerating(false);
  };

  // Launch copywriting workflow: ask brief questions, analyze full schema, then propose copy
  const handleStartCopywriting = async () => {
    const pageName = pageContext?.pageName || pageContextData?.pageName || "Page";
    const schemaPayload = {
      components:
        (currentComponents && currentComponents.length > 0)
          ? currentComponents
          : (pageContextData?.layout?.components || [])
    };
    // Do not show payload in chat; only show high-level steps
    setCopyWorkflowActive(true);
    setCopyStep('asking');
    const hiddenInstruction =
      `[Workflow: Copywriting]\n` +
      `Ask me a brief for a landing page in short, sequential questions (product/service, audience, tone, benefits, CTA, constraints). ` +
      `After my answers, analyze the current page schema and propose improved copy for text fields only.\n` +
      `Return ONLY updated schema JSON with a top-level "components" array. Wrap in \`\`\`json fences.\n\n` +
      `Page: ${pageName}\n\n` +
      `Current Page Schema:\n\`\`\`json\n${JSON.stringify(schemaPayload, null, 2)}\n\`\`\``;
    await sendHiddenMessage(hiddenInstruction);
    setCopyStep('received');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messageInput = event.currentTarget.querySelector('textarea') as HTMLTextAreaElement;
    const message = messageInput?.value.trim();

    if (!message || isLoading) {
      return;
    }

    // Clear the input
    messageInput.value = '';
    messageInput.dispatchEvent(new Event('input', { bubbles: true }));

    await submitMessage(message);
  };

  return (
    <div className={cn("relative flex h-auto w-full", className)}>
      <div className="flex flex-col w-full">
        <div className="px-0">
          <form onSubmit={handleSubmit}>
            <PromptBox
              disabled={isLoading}
              data-selector-active={isSelectorActive ? 'true' : 'false'}
            />
          </form>
        </div>
      </div>
    </div>
  );
};