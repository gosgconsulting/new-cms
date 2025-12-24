import { useState, useEffect } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Rocket, CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCopilot } from '@/contexts/CopilotContext';
import { useAuth } from '@/contexts/AuthContext';
import { useArticleGeneration } from '@/contexts/ArticleGenerationContext';
import ArticleGenerationProgress from '@/components/ArticleGenerationProgress';
import { supabase } from '@/integrations/supabase/client';

export const Step10ArticleSetup = () => {
  const { sessionData, updateSessionData } = useQuickSetup();
  const { selectedBrand } = useCopilot();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentSession, isGenerating, startGeneration, clearSession } = useArticleGeneration();
  const [customInstructions, setCustomInstructions] = useState('');
  // Default values for tone and style (not displayed in UI)
  const tone = 'Professional';
  const style = 'Informative';
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Clear any stale session when component mounts (only if not currently generating)
  useEffect(() => {
    if (!isGenerating && currentSession?.status === 'completed') {
      clearSession();
    }
  }, []); // Run only on mount

  // Monitor generation completion and link articles to existing campaign
  useEffect(() => {
    const linkArticlesToCampaign = async () => {
      if (currentSession?.status === 'completed' && !isGenerating && !isCreatingCampaign && sessionData.campaign_id) {
        const successCount = currentSession.completedArticles;
        
        if (successCount > 0 && currentSession.steps) {
          setIsCreatingCampaign(true);
          
          try {
            // Link generated articles to existing campaign
            const articleIds = currentSession.steps
              .filter((step: any) => step.status === 'completed' && step.result?.blogPost?.id)
              .map((step: any) => step.result.blogPost.id);

            if (articleIds.length > 0) {
              const { error: updateError } = await supabase
                .from('blog_posts')
                .update({ 
                  seo_campaign_id: sessionData.campaign_id,
                  campaign_id: sessionData.campaign_id 
                })
                .in('id', articleIds);

              if (updateError) {
                console.error('Error linking articles to campaign:', updateError);
                toast.error('Articles generated but failed to link to campaign');
              }
            }
          } catch (error) {
            console.error('Error linking articles:', error);
            toast.error('Failed to link articles to campaign');
          } finally {
            setIsCreatingCampaign(false);
          }
        }
      }
    };
    
    linkArticlesToCampaign();
  }, [currentSession?.status, isGenerating, sessionData.campaign_id]);

  const handleComplete = async () => {
    if (!selectedBrand || !user) {
      toast.error('Missing brand or user information');
      return;
    }

    if (!sessionData.topics || sessionData.topics.length === 0) {
      toast.error('No topics selected for article generation');
      return;
    }

    // Save configuration
    updateSessionData({
      article_config: {
        tone,
        style,
        custom_instructions: customInstructions
      }
    });

    // Prepare topics for generation
    const topicsToGenerate = sessionData.topics
      .filter((t: any) => t.isSelected !== false)
      .slice(0, 12) // Max 12 articles
      .map((topic: any) => ({
        id: topic.id || `quick-setup-${Math.random()}`,
        title: topic.title,
        keywords: topic.secondary_keywords || [],
        keyword_focus: topic.primary_keyword,
        intent: topic.search_intent,
        status: 'selected',
        created_at: new Date().toISOString()
      }));

    // Use the existing bulk generation workflow
    startGeneration({
      topics: topicsToGenerate,
      language: sessionData.language || 'English',
      wordCount: 800,
      tone,
      includeIntro: true,
      includeConclusion: true,
      includeFAQ: false,
      featuredImage: sessionData.ai_featured_image ? 'ai_generation' : 'none',
      brandId: selectedBrand.id,
      brandName: selectedBrand.name,
      userId: user.id,
      customPrompt: customInstructions,
      contentSettings: {
        use_brand_info: sessionData.brand_mentions ?? true,
        brand_mentions: sessionData.brand_mentions ? 'regular' : 'none',
        competitor_mentions: sessionData.competitor_mentions ? 'minimal' : 'none',
        internal_links: sessionData.internal_links ? 'few' : 'none',
        external_links: sessionData.external_links ? 'few' : 'none',
        external_search: true
      }
    }, true); // Skip completion modal
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Article Generation Setup</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Configure how articles should be generated. These settings will be applied to all {sessionData.topics?.filter((t: any) => t.isSelected !== false).length || 0} topics.
        </p>
      </div>

      {!isGenerating && !currentSession && (
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Add any specific writing guidelines, brand voice requirements, or content preferences..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Campaign Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Keywords</p>
                  <p className="text-muted-foreground">{sessionData.keywords?.length || 0} main keywords</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Long-tail Variants</p>
                  <p className="text-muted-foreground">{sessionData.longtail_keywords?.length || 0} variants</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Sources</p>
                  <p className="text-muted-foreground">{sessionData.sources?.length || 0} sources analyzed</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Competitors</p>
                  <p className="text-muted-foreground">{sessionData.competitors?.length || 0} identified</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Topics</p>
                  <p className="text-muted-foreground">{sessionData.topics?.filter((t: any) => t.isSelected !== false).length || 0} ready to write</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Intent Analysis</p>
                  <p className="text-muted-foreground">Complete with backlink strategy</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Generate Articles
          </Button>
        </Card>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Article Generation Progress - Inline Display */}
        {(isGenerating || currentSession) && (
          <Card className="p-6 space-y-6">
            <ArticleGenerationProgress showDetails={true} />

            {currentSession?.status === 'completed' && (
              <div className="space-y-4">
                {isCreatingCampaign && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating campaign...
                  </div>
                )}
                
                {campaignId && (
                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Campaign created successfully!
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearSession();
                      navigate(`/app/campaigns?brand=${selectedBrand?.id}`);
                    }}
                    className="flex-1"
                    disabled={isCreatingCampaign}
                  >
                    View Campaign
                  </Button>
                  <Button
                    onClick={() => {
                      clearSession();
                      navigate(`/app/schedule?brand=${selectedBrand?.id}`);
                    }}
                    className="flex-1"
                    disabled={isCreatingCampaign}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Articles
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
