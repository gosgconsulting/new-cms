import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
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

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ className, pageContext, currentComponents, onUpdateComponents, onOpenJSONEditor, selectedComponentJSON, onComponentSelected }) => {
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

  // Clear all messages and reset chat
  const clearAllMessages = () => {
    setMessages([]);
    setError(null);
    setFocusedComponentJSON(null);
    setComponentHierarchy([]);
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
    if (selectedComponentJSON) {
      setFocusedComponentJSON(selectedComponentJSON);
      
      // Build component hierarchy path
      const buildHierarchyPath = (component: any) => {
        const path: string[] = [];
        
        // Try to get parent component information from various sources
        if (component.parentType || component.parent) {
          const parentName = component.parentType || component.parent?.type || component.parent?.name || 'Parent Component';
          path.push(parentName);
        } else if (component.parentId && currentComponents) {
          // Try to find parent in current components
          const parentComponent = currentComponents.find(c => c.id === component.parentId);
          if (parentComponent) {
            path.push(parentComponent.type || parentComponent.name || 'Parent Component');
          }
        } else if (component.path) {
          // If component has a path property, use it
          const pathParts = component.path.split('/').filter(Boolean);
          path.push(...pathParts);
        } else if (component.selector) {
          // Try to infer hierarchy from CSS selector
          const selectorParts = component.selector.split(' ').filter(part => !part.startsWith('.') && !part.startsWith('#'));
          if (selectorParts.length > 1) {
            path.push(...selectorParts.slice(0, -1).map(part => part.charAt(0).toUpperCase() + part.slice(1)));
          }
        }
        
        // Add current component
        const currentName = component.type || component.name || component.key || component.tagName || 'Component';
        path.push(currentName);
        
        return path;
      };
      
      const hierarchy = buildHierarchyPath(selectedComponentJSON);
      setComponentHierarchy(hierarchy);
      
      // Notify parent that component was received
      if (onComponentSelected) {
        onComponentSelected(selectedComponentJSON);
      }
    }
  }, [selectedComponentJSON, onComponentSelected]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messageInput = event.currentTarget.querySelector('textarea') as HTMLTextAreaElement;
    const message = messageInput?.value.trim();

    if (!message || isLoading) {
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

    // Clear the input
    messageInput.value = '';
    messageInput.dispatchEvent(new Event('input', { bubbles: true }));

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

      // Get active tools from textarea data attribute
      const activeToolsString = (messageInput as HTMLElement).dataset.selectedTools || '';
      const activeTools = activeToolsString ? activeToolsString.split(',') : [];
      // Get selected model from textarea data attribute
      const selectedModel = (messageInput as HTMLElement).dataset.selectedModel || 'claude-3-5-haiku-20241022';

      // Build message with selected components context
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

      // Build page context with current components if available
      // Use try-catch to handle any JSON parsing errors gracefully
      let finalPageContext = undefined;
      try {
        if (pageContextData) {
          finalPageContext = {
            slug: pageContextData.slug,
            tenantId: pageContextData.tenantId,
            layout: pageContextData.layout
          };
        }

        // If currentComponents are provided, use them instead of (or merge with) pageContextData layout
        if (currentComponents && currentComponents.length > 0) {
          finalPageContext = {
            ...finalPageContext,
            layout: {
              components: currentComponents
            }
          } as any;
        }

        // If a component is focused from left panel, include it in the context
        if (focusedComponentJSON) {
          if (!finalPageContext) {
            finalPageContext = {} as any;
          }
          finalPageContext.focusedComponent = focusedComponentJSON;
          // Add focused component info to the message with hierarchy
          try {
            const componentPath = componentHierarchy.length > 1 ? componentHierarchy.join(' > ') : (focusedComponentJSON.type || focusedComponentJSON.key || 'Component');
            enhancedMessage = `[Focused Component: ${componentPath}]\n\nComponent JSON:\n${JSON.stringify(focusedComponentJSON, null, 2)}\n\n---\n\nUser Question: ${enhancedMessage}`;
          } catch (jsonError) {
            console.warn('[testing] Error stringifying focused component, continuing without it:', jsonError);
            // Continue without the focused component JSON if it fails to stringify
          }
        }
      } catch (contextError) {
        console.warn('[testing] Error building page context, continuing without it:', contextError);
        // Continue without page context if there's an error
        finalPageContext = undefined;
      }

      // Call Claude API with page context
      const response = await api.post('/api/ai-assistant/chat', {
        message: enhancedMessage,
        conversationHistory: conversationHistory.slice(0, -1), // Exclude current message from history
        pageContext: finalPageContext,
        activeTools: activeTools.length > 0 ? activeTools : undefined,
        selectedComponents: selectedComponents.length > 0 ? selectedComponents : undefined,
        model: selectedModel
      });

      if (!response.ok) {
        // Check if response is HTML (error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Server returned HTML instead of JSON. This usually means the API endpoint was not found or authentication failed. Status: ${response.status}`);
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Expected JSON but received ${contentType}. Response: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          role: 'assistant' as const,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Try to extract and apply JSON from the response if callbacks are provided
        if (onUpdateComponents) {
          try {
            // Try to extract JSON from markdown code blocks (most common format)
            let jsonString: string | null = null;
            const jsonMatch = data.message.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              jsonString = jsonMatch[1];
            } else {
              // Try to find JSON object directly (with components property)
              const directJsonMatch = data.message.match(/\{[\s\S]*"components"[\s\S]*\}/);
              if (directJsonMatch) {
                jsonString = directJsonMatch[0];
              } else {
                // Try to find array format
                const arrayMatch = data.message.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (arrayMatch) {
                  jsonString = arrayMatch[0];
                }
              }
            }

            if (jsonString) {
              // Parse and validate JSON
              const parsed = JSON.parse(jsonString);
              
              // Extract components array
              let componentsArray: any[] = [];
              if (Array.isArray(parsed)) {
                componentsArray = parsed;
              } else if (parsed.components && Array.isArray(parsed.components)) {
                componentsArray = parsed.components;
              }

              // If valid components found, update them
              if (componentsArray.length > 0) {
                onUpdateComponents(componentsArray);
                // Optionally open JSON Editor to show the updated JSON
                if (onOpenJSONEditor) {
                  // Small delay to ensure state is updated
                  setTimeout(() => {
                    onOpenJSONEditor();
                  }, 500);
                }
              }
            }
          } catch (error) {
            // JSON parsing failed, which is fine - not all responses contain JSON
            // Silently ignore - the message will still be displayed
          }
        }
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('[testing] Editor Error:', error);
      setError(error.message || 'Failed to get AI response. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error.message || 'Failed to get AI response. Please check your API key configuration.'}`,
        role: 'assistant' as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("relative flex h-full", className)}>
      {/* Sidebar - Always visible */}
      <div className="flex flex-col h-full bg-card border-l shadow-lg w-full">
        {/* Always show content - no collapse functionality */}
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 bg-background">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Editor</h2>
                    {messages.length > 0 && (
                      <button
                        onClick={clearAllMessages}
                        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
                        title="Clear all messages"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {pageContextData && (
                    <span className="text-xs text-muted-foreground truncate">
                      {pageContextData.pageName}
                    </span>
                  )}
                  {focusedComponentJSON && (
                    <span className="text-xs text-primary font-medium truncate" title={JSON.stringify(focusedComponentJSON, null, 2)}>
                      Focused: {componentHierarchy.length > 1 ? componentHierarchy.join(' > ') : (focusedComponentJSON.type || focusedComponentJSON.key || 'Component')}
                    </span>
                  )}
                </div>
              </div>
              {/* No close button - always visible */}
            </div>

            {/* Selected Components Display */}
            {selectedComponents.length > 0 && (
              <div className="px-6 py-3 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Selected Components ({selectedComponents.length})
                  </span>
                  <button
                    onClick={() => setSelectedComponents([])}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedComponents.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs"
                    >
                      <span className="font-mono font-semibold">{comp.tagName}</span>
                      {comp.filePath && (
                        <span className="text-muted-foreground text-[10px] font-mono">
                          {comp.filePath.split('/').pop()}
                          {comp.lineNumber && `:${comp.lineNumber}`}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedComponents(prev => prev.filter(c => c.id !== comp.id));
                        }}
                        className="ml-0.5 hover:bg-primary/20 rounded p-0.5 transition-colors"
                        aria-label="Remove component"
                      >
                        <ChevronRight className="h-3 w-3 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-center text-sm">
                Start a conversation with the Editor.
                <br />
                <br />
                Ask questions, get help, or request assistance with your content.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-4 py-2",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : message.content.startsWith('Error:')
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-lg px-4 py-2 bg-muted text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

            {/* Input Area */}
            <div className="px-6 pb-6 pt-4 border-t flex-shrink-0 bg-background">
              <form onSubmit={handleSubmit}>
                <PromptBox 
                  disabled={isLoading} 
                  data-selector-active={isSelectorActive ? 'true' : 'false'}
                />
              </form>
            </div>
      </div>

      {/* Collapsed State - Toggle Button */}
      {/* No expand button needed - always visible */}
    </div>
  );
};

