import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { cn } from "@/lib/utils";
import api from "../../sparti-cms/utils/api";

interface AIAssistantChatProps {
  className?: string;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Array<{ id: string; content: string; role: 'user' | 'assistant' }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

      // Call Claude API
      const response = await api.post('/ai-assistant/chat', {
        message,
        conversationHistory: conversationHistory.slice(0, -1) // Exclude current message from history
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
    <>
      {/* Floating Toggle Button - Only show when chat is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 px-4 py-2.5",
            className
          )}
          aria-label="Open AI Assistant Chat"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">AI Assistant</span>
        </button>
      )}

      {/* Chat Dialog - Positioned at bottom right */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          {/* Custom Dialog Content without overlay, positioned at bottom-right */}
          <DialogPrimitive.Content
            className={cn(
              "fixed bottom-4 right-4 z-[55] w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)]",
              "flex flex-col bg-card border rounded-lg shadow-2xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2",
              "duration-200 p-0"
            )}
          >
            <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">AI Assistant</DialogTitle>
                <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>
            </DialogHeader>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              {messages.length === 0 && !isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-center">
                    Start a conversation with the AI Assistant.
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
                          "max-w-[80%] rounded-lg px-4 py-2",
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
                      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted text-muted-foreground flex items-center gap-2">
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
            <div className="px-6 pb-6 pt-4 border-t flex-shrink-0">
              <form onSubmit={handleSubmit}>
                <PromptBox disabled={isLoading} />
              </form>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>
    </>
  );
};

