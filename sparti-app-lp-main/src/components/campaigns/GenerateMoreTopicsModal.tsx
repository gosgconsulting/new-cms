import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';

interface GenerateMoreTopicsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  onComplete: () => void;
}

interface CampaignData {
  keywords_cluster: string;
  quick_setup_data: {
    country?: string;
    language?: string;
    keywords?: string[];
  };
}

const TOPIC_COUNT_OPTIONS = [
  { value: '12', label: '12 topics' },
  { value: '16', label: '16 topics' },
  { value: '20', label: '20 topics' },
  { value: '24', label: '24 topics' },
  { value: '28', label: '28 topics' },
];

export function GenerateMoreTopicsModal({ open, onOpenChange, campaignId, onComplete }: GenerateMoreTopicsModalProps) {
  const [country, setCountry] = useState<string>('United States');
  const [language, setLanguage] = useState<string>('English');
  const [topicCount, setTopicCount] = useState<string>('12');
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && campaignId) {
      loadCampaignData();
    }
  }, [open, campaignId]);

  const loadCampaignData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_campaigns')
        .select('keywords_cluster, quick_setup_data')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      setCampaignData(data as CampaignData);
      
      // Pre-fill form with existing campaign data
      if (data.quick_setup_data) {
        if (data.quick_setup_data.country) setCountry(data.quick_setup_data.country);
        if (data.quick_setup_data.language) setLanguage(data.quick_setup_data.language);
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
      toast.error('Failed to load campaign data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!campaignData) return;

    setIsGenerating(true);

    try {
      // Call the topic generation edge function
      const { data, error } = await supabase.functions.invoke('quick-setup-topic-generation', {
        body: {
          keywords: campaignData.quick_setup_data?.keywords || [],
          longtailKeywords: [],
          sources: [],
          fetchedSources: [],
          competitors: [],
          websiteUrl: '',
          language: language,
          existingBlogTopics: [],
          topicCount: parseInt(topicCount),
          brandMentions: true,
          competitorMentions: true,
          internalLinks: true,
          aiFeaturedImage: true,
        }
      });

      if (error) {
        if (error.message?.includes('PAYMENT_REQUIRED')) {
          toast.error('Your workspace is out of AI credits. Please add credits to continue.', {
            duration: 10000,
            action: {
              label: 'Add Credits',
              onClick: () => window.open('https://lovable.dev/settings/workspace/usage', '_blank')
            }
          });
        } else if (error.message?.includes('RATE_LIMITED')) {
          toast.error('Rate limit reached. Please wait a moment and try again.');
        } else {
          toast.error(`Failed to generate topics: ${error.message}`);
        }
        throw error;
      }

      const generatedTopics = data.topics;
      
      // Get the current user and brand from the campaign
      const { data: campaignInfo, error: campaignError } = await supabase
        .from('seo_campaigns')
        .select('brand_id, user_id')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Save new topics to database
      const newTopics = generatedTopics.map((topic: any) => ({
        brand_id: campaignInfo.brand_id,
        user_id: campaignInfo.user_id,
        campaign_id: campaignId,
        title: topic.title,
        primary_keyword: topic.primary_keyword || topic.title.toLowerCase(),
        secondary_keywords: topic.secondary_keywords || [],
        keywords: [topic.primary_keyword, ...topic.secondary_keywords].filter(Boolean),
        search_intent: topic.search_intent || 'informational',
        search_term: typeof topic.search_term === 'string' ? topic.search_term : null,
        difficulty: topic.difficulty || 5,
        opportunity_score: topic.opportunity_score || 7,
        content_angle: topic.content_angle || 'Comprehensive guide',
        outline: topic.outline || ['Introduction', 'Main Content', 'Conclusion'],
        target_word_count: topic.target_word_count || 1400,
        estimated_word_count: topic.target_word_count || 1400,
        matched_backlinks: topic.matched_backlinks || null,
        matched_sources: topic.matched_sources || null,
        internal_links: topic.matched_backlinks?.filter((b: any) => b.type === 'internal') || null,
        status: 'ready',
      }));

      const { error: insertError } = await supabase
        .from('selected_topics')
        .insert(newTopics);

      if (insertError) throw insertError;

      toast.success(`Successfully generated and saved ${generatedTopics.length} new topics!`);
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating topics:', error);
      // Error already handled above with specific messages
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Generate More Topics
          </DialogTitle>
          <DialogDescription>
            Create additional topics for this campaign
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Campaign Info */}
            {campaignData && (
              <Card className="p-4 bg-muted/50">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Keywords Cluster</Label>
                  <Badge variant="secondary" className="text-sm">
                    {campaignData.keywords_cluster}
                  </Badge>
                </div>
              </Card>
            )}

            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <SearchableSelect
                options={COUNTRIES_WITH_POPULAR_FIRST}
                value={country}
                onValueChange={setCountry}
                placeholder="Select country"
                searchPlaceholder="Search countries..."
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <SearchableSelect
                options={LANGUAGES_WITH_POPULAR_FIRST}
                value={language}
                onValueChange={setLanguage}
                placeholder="Select language"
                searchPlaceholder="Search languages..."
              />
            </div>

            {/* Topic Count Selection */}
            <div className="space-y-2">
              <Label htmlFor="topic-count">Number of Topics to Generate</Label>
              <SearchableSelect
                options={TOPIC_COUNT_OPTIONS}
                value={topicCount}
                onValueChange={setTopicCount}
                placeholder="Select number of topics"
                searchPlaceholder="Search..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isLoading}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate {TOPIC_COUNT_OPTIONS.find(opt => opt.value === topicCount)?.label || topicCount + ' Topics'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
