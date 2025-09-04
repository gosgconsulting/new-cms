import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Loader2, Globe, Key, TestTube } from 'lucide-react';
import { configureWordPressAPI } from '@/lib/wordpress-api';
import { useQuery } from '@tanstack/react-query';

interface ConnectionTestResult {
  success: boolean;
  message: string;
  data?: {
    siteName: string;
    postsFound: boolean;
    samplePost: string;
  };
}

const WordPressConnectionTester = () => {
  const [wordpressUrl, setWordpressUrl] = useState('https://gosgconsulting.com');
  const [testTriggered, setTestTriggered] = useState(false);

  const { data: testResult, isLoading, error, refetch } = useQuery({
    queryKey: ['wordpress-connection-test', wordpressUrl],
    queryFn: async (): Promise<ConnectionTestResult> => {
      const api = configureWordPressAPI(wordpressUrl);
      return await api.testConnection();
    },
    enabled: testTriggered,
    refetchOnWindowFocus: false,
  });

  const handleTestConnection = () => {
    setTestTriggered(true);
    refetch();
  };

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          WordPress Connection Tester
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">WordPress Site URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://your-wordpress-site.com"
              value={wordpressUrl}
              onChange={(e) => {
                setWordpressUrl(formatUrl(e.target.value));
                setTestTriggered(false);
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading || !wordpressUrl}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        {testTriggered && (
          <div className="space-y-4">
            <Separator />
            
            {isLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Testing connection to WordPress site...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Connection test failed: {error.message}
                </AlertDescription>
              </Alert>
            )}

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}

            {testResult?.success && testResult.data && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Connection Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Site URL:</span>
                    <div className="text-muted-foreground break-all">
                      {testResult.data.siteName}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Posts Available:</span>
                    <Badge variant={testResult.data.postsFound ? "default" : "secondary"} className="ml-2">
                      {testResult.data.postsFound ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  {testResult.data.postsFound && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Sample Post:</span>
                      <div className="text-muted-foreground">
                        {testResult.data.samplePost}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Public API Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Public API Access
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                This integration uses the WordPress REST API public endpoints to fetch published content.
                No authentication required - perfect for displaying blog posts, pages, and categories.
              </div>
            </div>
          </div>
        </div>

        {/* Quick Setup Guide */}
        <div className="space-y-3">
          <h4 className="font-medium">Quick Setup Guide:</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <div>1. Enter your WordPress site URL above</div>
            <div>2. Click "Test Connection" to verify access to the WordPress REST API</div>
            <div>3. If successful, your app can now fetch WordPress content</div>
            <div>4. Use the WordPress hooks in your components to display posts, pages, etc.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordPressConnectionTester;