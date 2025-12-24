import { useEffect, useState } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Trash2, ExternalLink, Plus, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Competitor {
  url: string;
  name: string;
  description: string;
}

export const Step7CompetitorAnalysis = () => {
  const { sessionData, updateSessionData } = useQuickSetup();
  const [competitors, setCompetitors] = useState<Competitor[]>(sessionData.competitors || []);
  const [manualDomain, setManualDomain] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    updateSessionData({ competitors });
  }, [competitors]);

  const analyzeCompetitors = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('quick-setup-competitor-analysis', {
        body: {
          keywords: sessionData.keywords,
          websiteUrl: sessionData.website_url,
          language: sessionData.language,
        },
      });

      if (error) throw error;

      if (data?.competitors && Array.isArray(data.competitors)) {
        // Transform the data to match our interface
        const transformedCompetitors = data.competitors.map((comp: any) => ({
          url: `https://${comp.domain}`,
          name: comp.name,
          description: comp.reasoning,
        }));
        setCompetitors(transformedCompetitors);
        toast({
          title: 'Competitors Identified',
          description: `${transformedCompetitors.length} competitors discovered`,
        });
      }
    } catch (error) {
      console.error('Competitor analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to identify competitors',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addCompetitor = () => {
    const trimmed = manualDomain.trim();
    let url = trimmed;
    
    // Ensure URL has protocol
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    if (url && !competitors.some((c) => c.url === url)) {
      setCompetitors([
        ...competitors,
        {
          url,
          name: new URL(url).hostname,
          description: 'Manually added competitor',
        },
      ]);
      setManualDomain('');
    }
  };

  const removeCompetitor = (url: string) => {
    setCompetitors(competitors.filter((c) => c.url !== url));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Competitor Analysis</h2>
        <p className="text-muted-foreground">
          Identify your main SEO competitors for strategic insights
        </p>
      </div>

      {competitors.length === 0 && (
        <div className="text-center p-8 border border-border rounded-lg bg-muted/30">
          <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground mb-4">
            AI will identify competitors ranking for your target keywords
          </p>
          <Button onClick={analyzeCompetitors} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Identifying Competitors...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Discover Competitors with AI
              </>
            )}
          </Button>
        </div>
      )}

      {competitors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Competitors ({competitors.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={analyzeCompetitors}
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
            {competitors.map((competitor, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border border-border rounded-lg bg-background hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {competitor.name}
                    </h4>
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {competitor.description}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {competitor.url}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => removeCompetitor(competitor.url)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Add Custom Competitor</label>
        <div className="flex gap-2">
          <Input
            value={manualDomain}
            onChange={(e) => setManualDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
            placeholder="https://competitor.com"
            className="flex-1"
            type="url"
          />
          <Button onClick={addCompetitor} disabled={!manualDomain.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">💡 Competitor Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Focus on direct competitors in your niche</li>
          <li>• Include both established leaders and emerging competitors</li>
          <li>• These will help inform your content strategy and positioning</li>
        </ul>
      </div>
    </div>
  );
};
