import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Settings, User } from 'lucide-react';
import { LibreChatInterface } from './LibreChatInterface';

export const LibreChatContainer: React.FC = () => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chatConfig, setChatConfig] = useState<any>(null);

  useEffect(() => {
    if (session?.access_token) {
      initializeLibreChat();
    }
  }, [session]);

  const initializeLibreChat = async () => {
    try {
      setIsLoading(true);
      
      // For now, we'll use a demo configuration
      // In production, this would connect to your actual LibreChat instance
      const config = {
        endpoint: process.env.NODE_ENV === 'production' 
          ? 'https://your-librechat-instance.com' 
          : 'http://localhost:3080',
        models: ['gpt-4', 'claude-3-sonnet', 'claude-3-haiku'],
        features: {
          artifacts: true,
          codeInterpreter: true,
          fileUpload: true,
          plugins: true,
        },
        theme: 'sparti', // Custom Sparti theme
      };

      setChatConfig(config);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to initialize LibreChat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 glass border-primary/20 bg-background/95 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Initializing LibreChat...</h3>
            <p className="text-muted-foreground text-center">
              Setting up your AI chat experience with full LibreChat features
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !chatConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 glass border-primary/20 bg-background/95 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <MessageCircle className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Chat Unavailable</h3>
            <p className="text-muted-foreground text-center">
              Unable to connect to LibreChat. Please check your configuration.
            </p>
            <Button onClick={initializeLibreChat} variant="default">
              Retry Connection
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <LibreChatInterface config={chatConfig} session={session} />
    </div>
  );
};