import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

/**
 * AI Assistant Integration component that displays Anthropic Claude API integration status
 */
export const AIAssistantIntegration: React.FC = () => {
  // Check if the API key exists in environment variables
  // @ts-ignore - Vite environment variables
  const apiKeyExists = Boolean(import.meta.env?.VITE_ANTHROPIC_API_KEY);
  
  return (
    <div className="border rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Bot className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">AI Assistant</h3>
            <Badge variant="outline" className={apiKeyExists ? "bg-green-500/10 text-green-700 border-green-300" : "bg-gray-100 text-gray-800"}>
              {apiKeyExists ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Anthropic Claude API integration for AI-powered assistance via Railway
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Type: AI Service</span>
            <span>Provider: Anthropic (Railway)</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            <p>{apiKeyExists 
              ? "Using API key from environment variables for security" 
              : "Add VITE_ANTHROPIC_API_KEY to your environment variables to activate"
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * AI Assistant Integration list item for modals
 */
export const AIAssistantIntegrationListItem: React.FC = () => {
  return (
    <li className="flex items-center space-x-2">
      <Bot className="h-4 w-4 text-purple-600" />
      <span>• AI Assistant (Anthropic Claude API via Railway)</span>
    </li>
  );
};

export default AIAssistantIntegration;
