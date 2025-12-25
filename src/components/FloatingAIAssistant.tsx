import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AIAssistantChat } from './AIAssistantChat';
import { cn } from '@/lib/utils';

interface FloatingAIAssistantProps {
  pageContext?: {
    slug: string;
    pageName: string;
    tenantId?: string;
  } | null;
  currentComponents?: any[];
  onUpdateComponents?: (components: any[]) => void;
  onProposedComponents?: (components: any[]) => void;
  onOpenJSONEditor?: () => void;
  selectedComponentJSON?: any;
  onComponentSelected?: (component: any) => void;
}

/**
 * Floating AI Assistant widget that appears as a button on the bottom right
 * Expands to show a compact AI chat when clicked
 */
export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  pageContext,
  currentComponents,
  onUpdateComponents,
  onProposedComponents,
  onOpenJSONEditor,
  selectedComponentJSON,
  onComponentSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        // Expanded chat view - compact design
        <div className="bg-card border rounded-lg shadow-2xl flex flex-col w-[380px] h-[500px] overflow-hidden">
          {/* Header with close button */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-background flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Close AI Assistant"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Compact AI Chat */}
          <div className="flex-1 min-h-0">
            <AIAssistantChat
              className="h-full w-full"
              pageContext={pageContext}
              currentComponents={currentComponents}
              onUpdateComponents={onUpdateComponents}
              onProposedComponents={onProposedComponents}
              onOpenJSONEditor={onOpenJSONEditor}
              selectedComponentJSON={selectedComponentJSON}
              onComponentSelected={onComponentSelected}
              onClosedChange={(closed) => {
                if (closed) {
                  setIsOpen(false);
                }
              }}
              isCompact={true}
            />
          </div>
        </div>
      ) : (
        // Collapsed button view
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "bg-primary text-primary-foreground rounded-full shadow-lg",
            "px-4 py-3 flex items-center gap-2",
            "hover:bg-primary/90 transition-all",
            "hover:scale-105 active:scale-95"
          )}
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium text-sm">AI Assistant</span>
        </button>
      )}
    </div>
  );
};

