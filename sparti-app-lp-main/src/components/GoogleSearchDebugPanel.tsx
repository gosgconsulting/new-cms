import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Bug, Database, Download, Loader2 } from 'lucide-react';
import { GoogleSearchLobstrService } from '@/services/googleSearchLobstrService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DebugResult {
  success: boolean;
  message: string;
  debugData?: any;
  error?: string;
  timestamp: string;
}

export const GoogleSearchDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [squidId, setSquidId] = useState('2dc14dc015c341d4bcd9264111988ee5');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const { toast } = useToast();

  // Get current user ID
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleImportSquidRuns = async () => {
    if (!squidId || !userId) {
      toast({
        title: "Missing Information",
        description: "Squid ID and User ID are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await GoogleSearchLobstrService.importSquidRuns(squidId, userId);
      
      setDebugResult({
        success: result.success,
        message: result.message || 'Import completed',
        debugData: result,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.totalImported} results from ${result.runsProcessed} runs`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugResult({
        success: false,
        message: 'Import failed',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Import Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Success" : "Failed"}
      </Badge>
    );
  };

  return (
    <Card className="w-full border-dashed border-muted-foreground/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Debug Panel</CardTitle>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <CardDescription>
              Debug tools for Google Search scraper issues and manual data import
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Manual Import Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <h3 className="font-semibold">Manual Squid Import</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="squidId">Squid ID</Label>
                  <Input
                    id="squidId"
                    value={squidId}
                    onChange={(e) => setSquidId(e.target.value)}
                    placeholder="Enter squid ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Auto-filled from current user"
                    disabled
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleImportSquidRuns} 
                disabled={isLoading || !squidId || !userId}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import All Runs from Squid
                  </>
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                This will fetch all completed runs from the specified squid and import their results 
                into the Google Search results table. Use this to debug import issues or recover data.
              </p>
            </div>

            {/* Debug Results */}
            {debugResult && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Import Results</h3>
                  {getStatusBadge(debugResult.success)}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Message:</span> {debugResult.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Timestamp:</span> {new Date(debugResult.timestamp).toLocaleString()}
                  </p>
                </div>

                {debugResult.error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                    <p className="text-sm text-destructive">
                      <span className="font-medium">Error:</span> {debugResult.error}
                    </p>
                  </div>
                )}

                {debugResult.debugData && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Debug Data
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-3 bg-muted rounded text-xs">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-64">
                          {JSON.stringify(debugResult.debugData, null, 2)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};