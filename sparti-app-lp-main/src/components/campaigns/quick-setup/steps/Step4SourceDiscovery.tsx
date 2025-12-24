import { useState, useEffect } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Source {
  url: string;
  title: string;
  description: string;
}

export const Step4SourceDiscovery = () => {
  const { sessionData, updateSessionData } = useQuickSetup();
  const [sources, setSources] = useState<Source[]>(sessionData.sources || []);
  const [newUrl, setNewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    updateSessionData({ sources });
  }, [sources]);

  const generateSources = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('quick-setup-source-discovery', {
        body: {
          keywords: sessionData.keywords,
          websiteUrl: sessionData.website_url,
          language: sessionData.language,
        },
      });

      if (error) throw error;

      if (data?.sources && Array.isArray(data.sources)) {
        setSources(data.sources);
        toast({
          title: 'Sources Discovered',
          description: `${data.sources.length} authoritative sources suggested`,
        });
      }
    } catch (error) {
      console.error('Source discovery error:', error);
      toast({
        title: 'Discovery Failed',
        description: error instanceof Error ? error.message : 'Failed to discover sources',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addSource = () => {
    const trimmed = newUrl.trim();
    if (trimmed && !sources.some((s) => s.url === trimmed)) {
      setSources([
        ...sources,
        {
          url: trimmed,
          title: new URL(trimmed).hostname,
          description: 'Manually added source',
        },
      ]);
      setNewUrl('');
    }
  };

  const removeSource = (url: string) => {
    setSources(sources.filter((s) => s.url !== url));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Source Discovery</h2>
        <p className="text-muted-foreground">
          Find authoritative sources for content research
        </p>
      </div>

      {sources.length === 0 && (
        <div className="text-center p-8 border border-border rounded-lg bg-muted/30">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground mb-4">
            AI will suggest high-quality sources based on your keywords
          </p>
          <Button onClick={generateSources} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Discovering Sources...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Discover Sources with AI
              </>
            )}
          </Button>
        </div>
      )}

      {sources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Sources ({sources.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSources}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {sources.map((source, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border border-border rounded-lg bg-background hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {source.title}
                    </h4>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {source.description}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {source.url}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => removeSource(source.url)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Add Custom Source</label>
        <div className="flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSource()}
            placeholder="https://example.com/resource"
            className="flex-1"
            type="url"
          />
          <Button onClick={addSource} disabled={!newUrl.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">💡 Source Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Include authoritative industry blogs and publications</li>
          <li>• Add Wikipedia and educational resources for foundational knowledge</li>
          <li>• These sources will be analyzed to generate content ideas</li>
        </ul>
      </div>
    </div>
  );
};
