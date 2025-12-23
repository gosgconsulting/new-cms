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
  } | null;
}

interface SelectedComponent {
  id: string;
  tagName: string;
  selector: string;
  filePath?: string;
  lineNumber?: number;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ className, pageContext }) => {
  const { currentTenantId } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Array<{ id: string; content: string; role: 'user' | 'assistant' }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContextData, setPageContextData] = useState<PageContext | null>(null);
  const [loadingPageContext, setLoadingPageContext] = useState(false);
  const [isSelectorActive, setIsSelectorActive] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load page context when pageContext prop changes
  useEffect(() => {
    const loadPageContext = async () => {
      if (!pageContext || !currentTenantId) {
        setPageContextData(null);
        return;
      }

      try {
        setLoadingPageContext(true);
        // Fetch page context from API (using query parameter for slug to handle slashes)
        const encodedSlug = encodeURIComponent(pageContext.slug);
        const response = await api.get(`/api/ai-assistant/page-context?slug=${encodedSlug}&tenantId=${currentTenantId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.pageContext) {
            setPageContextData(data.pageContext);
          } else {
            setPageContextData(null);
          }
        } else {
          console.warn('[testing] Failed to load page context:', response.status);
          setPageContextData(null);
        }
      } catch (error) {
        console.error('[testing] Error loading page context:', error);
        setPageContextData(null);
      } finally {
        setLoadingPageContext(false);
      }
    };

    loadPageContext();
  }, [pageContext?.slug, pageContext?.pageName, currentTenantId]);

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

      // Get active tool from textarea data attribute
      const activeTool = (messageInput as HTMLElement).dataset.selectedTool || null;

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

      // Call Claude API with page context
      const response = await api.post('/ai-assistant/chat', {
        message: enhancedMessage,
        conversationHistory: conversationHistory.slice(0, -1), // Exclude current message from history
        pageContext: pageContextData ? {
          slug: pageContextData.slug,
          tenantId: pageContextData.tenantId,
          layout: pageContextData.layout
        } : undefined,
        activeTool: activeTool || undefined,
        selectedComponents: selectedComponents.length > 0 ? selectedComponents : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          role: 'assistant' as const,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('[testing] AI Assistant Error:', error);
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
      {/* Sidebar - Always visible, collapsible */}
      <div
        className={cn(
          "flex flex-col h-full bg-card border-l shadow-lg transition-all duration-300 ease-in-out",
          isOpen ? "w-[420px]" : "w-0 overflow-hidden"
        )}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 bg-background">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold">AI Assistant</h2>
                  {pageContextData && (
                    <span className="text-xs text-muted-foreground">
                      {pageContextData.pageName}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-accent"
                aria-label="Collapse sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
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
                Start a conversation with the AI Assistant.
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
          </>
        )}
      </div>

      {/* Collapsed State - Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-20",
            "flex items-center justify-center w-12 h-24",
            "bg-primary text-primary-foreground rounded-l-lg shadow-xl",
            "hover:bg-primary/90 transition-all hover:shadow-2xl",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "border-l border-t border-b border-primary/20"
          )}
          aria-label="Expand AI Assistant"
        >
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="h-5 w-5" />
            <ChevronLeft className="h-4 w-4" />
          </div>
        </button>
      )}
    </div>
  );
};

