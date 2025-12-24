import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { openRouterService, OPENROUTER_MODELS } from '@/services/openRouterService';
import { toast } from 'sonner';
import { 
  Send, 
  Paperclip, 
  Settings, 
  Plus, 
  Bot, 
  User,
  Code,
  Image,
  FileText,
  Zap,
  Loader2
} from 'lucide-react';

interface LibreChatInterfaceProps {
  config: any;
  session: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'artifact';
}

export const LibreChatInterface: React.FC<LibreChatInterfaceProps> = ({ config, session }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const [isStreaming, setIsStreaming] = useState(false);

  // Welcome message with OpenRouter info
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Welcome to LibreChat with OpenRouter integration! 🚀

I now have access to multiple AI models including:
• **Claude 3.5 Sonnet** - Most intelligent with superior reasoning
• **GPT-4 Turbo** - Advanced capabilities with long context
• **Gemini Pro** - Google's multimodal model
• **Llama 3.1 70B** - High-performance open-source model
• **Mixtral 8x7B** - Mixture of experts model

**Features Available:**
• Multi-model conversations
• Code generation and analysis
• Document processing
• Campaign data integration
• Real-time streaming responses

Select a model above and start chatting!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Get conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: currentInput
      });

      let fullResponse = '';
      
      // Stream the response
      await openRouterService.streamChat(
        {
          model: selectedModel,
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 4000,
        },
        (chunk: string) => {
          fullResponse += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullResponse }
              : msg
          ));
        }
      );

      toast.success(`Response generated using ${selectedModel}`);
    } catch (error) {
      console.error('Error calling OpenRouter:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Update with error message
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error processing your request. Please try again or select a different model.' 
            }
          : msg
      ));
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/20 glass bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-semibold">LibreChat</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Sparti Integration
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                OPENROUTER_MODELS.reduce((acc, model) => {
                  if (!acc[model.category]) acc[model.category] = [];
                  acc[model.category].push(model);
                  return acc;
                }, {} as Record<string, typeof OPENROUTER_MODELS>)
              ).map(([category, models]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{category}</div>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="text-sm">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Feature Bar */}
      <div className="flex items-center gap-2 p-3 border-b border-border/10 bg-secondary/10">
        <Badge variant="outline" className="gap-1">
          <Code className="h-3 w-3" />
          Code Interpreter
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" />
          Artifacts
        </Badge>
        <Badge variant="outline" className="gap-1">
          <FileText className="h-3 w-3" />
          File Upload
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Image className="h-3 w-3" />
          Vision
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <Card className={`p-4 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'glass bg-background/95 backdrop-blur-md border-border/20'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </Card>
              </div>
            </div>
          ))}
          
          {isTyping && isStreaming && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="p-4 glass bg-background/95 backdrop-blur-md border-border/20">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {selectedModel.split('/')[1] || selectedModel} is generating response...
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/20 p-4 glass bg-background/95 backdrop-blur-md">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="mb-2">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message LibreChat... (Enter to send, Shift+Enter for new line)"
              className="min-h-[40px] resize-none border-border/20"
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="mb-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>LibreChat with OpenRouter integration</span>
          <span>Model: {OPENROUTER_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}</span>
        </div>
      </div>
    </div>
  );
};