import { useEffect, useState } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SourceWithStatus {
  url: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'success' | 'failed' | 'partial';
  content?: string;
  insights?: {
    main_topics: string[];
    key_insights: string[];
    content_angles: string[];
    relevance_score: number;
    summary: string;
  };
  error?: string;
}

export const Step6SourceFetching = () => {
  const { sessionData, updateSessionData, setIsLoading, isLoading } = useQuickSetup();
  const [sources, setSources] = useState<SourceWithStatus[]>([]);
  const [progress, setProgress] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (sessionData.sources && sessionData.sources.length > 0) {
      const sourcesWithStatus = sessionData.sources.map(s => ({
        ...s,
        status: s.status || 'pending'
      }));
      setSources(sourcesWithStatus);
      
      // Check if sources have already been fetched
      const fetchedCount = sourcesWithStatus.filter(s => s.status === 'success' || s.status === 'partial').length;
      if (fetchedCount > 0) {
        setHasFetched(true);
        setProgress(100);
      }
    }
  }, []);

  const fetchSources = async () => {
    if (!sessionData.sources || sessionData.sources.length === 0) {
      toast.error('No sources found. Please complete the previous step.');
      return;
    }

    setIsLoading(true);
    setHasFetched(false);
    setProgress(0);

    try {
      // Set all to pending
      const pendingSources = sessionData.sources.map(s => ({ ...s, status: 'pending' as const }));
      setSources(pendingSources);

      const { data, error } = await supabase.functions.invoke('quick-setup-source-fetching', {
        body: {
          sources: sessionData.sources,
          keywords: sessionData.keywords
        }
      });

      if (error) throw error;

      const fetchedSources = data.sources as SourceWithStatus[];
      setSources(fetchedSources);
      updateSessionData({ 
        sources: fetchedSources,
        fetched_sources: fetchedSources // Save for backlink discovery
      });
      setHasFetched(true);
      setProgress(100);

      const successCount = fetchedSources.filter(s => s.status === 'success').length;
      const partialCount = fetchedSources.filter(s => s.status === 'partial').length;
      const failedCount = fetchedSources.filter(s => s.status === 'failed').length;

      if (partialCount > 0) {
        toast.warning(`${partialCount} sources partially fetched`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} sources failed to fetch`);
      }

    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Failed to fetch source content');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-500">Partial</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const successCount = sources.filter(s => s.status === 'success' || s.status === 'partial').length;

  if (!hasFetched) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Fetch Source Content</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We'll fetch and analyze content from your discovered sources to extract key insights, 
            topics, and content angles for your content strategy.
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Sources to Fetch ({sources.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{source.title || source.url}</p>
                      <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={fetchSources}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Content...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Fetch & Analyze Sources
                </>
              )}
            </Button>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Processing sources... This may take a few minutes
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Source Content Analysis</h2>
          <p className="text-muted-foreground">
            {successCount} of {sources.length} sources successfully analyzed
          </p>
        </div>
        <Button onClick={fetchSources} disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refetching...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Refetch All
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {sources.map((source, idx) => (
          <Card key={idx} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getStatusIcon(source.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{source.title || 'Untitled'}</h3>
                      {getStatusBadge(source.status)}
                    </div>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                    >
                      {source.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {source.error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                  {source.error}
                </div>
              )}

              {source.insights && (
                <div className="space-y-3 pt-3 border-t">
                  {source.insights.summary && (
                    <p className="text-sm text-muted-foreground">{source.insights.summary}</p>
                  )}
                  
                  {source.insights.relevance_score && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Relevance:</span>
                      <Badge variant="outline">{source.insights.relevance_score}/10</Badge>
                    </div>
                  )}

                  {source.insights.main_topics && source.insights.main_topics.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Main Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {source.insights.main_topics.map((topic, i) => (
                          <Badge key={i} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {source.insights.content_angles && source.insights.content_angles.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Content Angles:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {source.insights.content_angles.map((angle, i) => (
                          <li key={i}>• {angle}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
