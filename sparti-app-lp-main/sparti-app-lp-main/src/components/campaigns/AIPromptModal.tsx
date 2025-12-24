import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy, Check, FileText, Settings, Globe, Link2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface AIPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  brandId: string;
}

interface TopicData {
  title: string;
  keywords: string[];
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  search_intent: string | null;
  difficulty: number | null;
  opportunity_score: number | null;
  target_word_count: number | null;
  content_angle: string | null;
  outline: string[] | null;
  matched_backlinks: any;
  matched_sources: any;
}

interface BrandData {
  name: string;
  website_url: string | null;
  brand_description: string | null;
  target_audience: string | null;
  brand_voice: string | null;
  key_selling_points: string[] | null;
}

interface WebsiteAnalysis {
  website_url: string | null;
  industry: string | null;
  target_audience: string | null;
  seo_objective: string | null;
  content_pillars: any;
  competitors: string[] | null;
  country: string | null;
  language: string | null;
  analysis_data: any;
}

interface ArticleSettings {
  language: string;
  word_count: number;
  tone: string;
  include_intro: boolean;
  include_conclusion: boolean;
  include_faq: boolean;
  model: string | null;
  image_style: string | null;
  brand_mentions: string;
  competitor_mentions: string;
}

export const AIPromptModal = ({ open, onOpenChange, topicId, brandId }: AIPromptModalProps) => {
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [articleSettings, setArticleSettings] = useState<ArticleSettings | null>(null);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (open && topicId && brandId) {
      fetchData();
    }
  }, [open, topicId, brandId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch topic data
      const { data: topic, error: topicError } = await supabase
        .from('selected_topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;
      setTopicData(topic);

      // Fetch brand data
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (brandError) throw brandError;
      setBrandData(brand);

      // Fetch article settings (use content_settings if article_settings doesn't exist)
      let settings = null;
      try {
        const { data, error } = await supabase
          .from('article_settings')
          .select('*')
          .eq('brand_id', brandId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
          throw error;
        }
        settings = data;
      } catch (error: any) {
        // If article_settings table doesn't exist, try content_settings
        if (error?.code === '42P01') {
          const { data: contentSettings } = await supabase
            .from('content_settings')
            .select('*')
            .eq('brand_id', brandId)
            .maybeSingle();
          settings = contentSettings;
        }
      }
      
      setArticleSettings({
        language: settings?.language || 'English',
        word_count: settings?.word_count || 1500,
        tone: settings?.tone || 'Professional',
        include_intro: settings?.include_intro ?? true,
        include_conclusion: settings?.include_conclusion ?? true,
        include_faq: settings?.include_faq ?? false,
        model: settings?.model || 'google/gemini-2.5-flash',
        image_style: settings?.image_style || null,
        brand_mentions: settings?.brand_mentions || 'regular',
        competitor_mentions: settings?.competitor_mentions || 'minimal'
      });

      // Fetch custom instructions if available
      const { data: instructions } = await supabase
        .from('custom_instruction_prompts')
        .select('content')
        .eq('brand_id', brandId)
        .maybeSingle();

      setCustomInstructions(instructions?.content || '');

      // Fetch website analysis from campaign
      if (topic?.campaign_id) {
        const { data: campaign } = await supabase
          .from('quick_setup_sessions')
          .select('website_url, industry, target_audience, seo_objective, content_pillars, competitors, country, language, analysis_data')
          .eq('id', topic.campaign_id)
          .maybeSingle();

        if (campaign) {
          setWebsiteAnalysis(campaign);
        } else {
          // Fallback to seo_campaigns if not in quick_setup_sessions
          const { data: seoCampaign } = await supabase
            .from('seo_campaigns')
            .select('website_url, industry, target_audience, seo_objective, content_pillars, competitors, country, language')
            .eq('id', topic.campaign_id)
            .maybeSingle();

          if (seoCampaign) {
            setWebsiteAnalysis({
              ...seoCampaign,
              analysis_data: null
            });
          }
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load prompt data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateFullWorkflowData = () => {
    return JSON.stringify({
      workflow: 'Content Writing',
      model: articleSettings?.model || 'google/gemini-2.5-flash',
      website_information: {
        website_url: websiteAnalysis?.website_url,
        industry: websiteAnalysis?.industry,
        target_audience: websiteAnalysis?.target_audience,
        seo_objective: websiteAnalysis?.seo_objective,
        content_pillars: websiteAnalysis?.content_pillars,
        competitors: websiteAnalysis?.competitors,
        country: websiteAnalysis?.country,
        language: websiteAnalysis?.language,
        analysis_data: websiteAnalysis?.analysis_data,
      },
      topic: {
        id: topicId,
        title: topicData?.title,
        primary_keyword: topicData?.primary_keyword,
        secondary_keywords: topicData?.secondary_keywords,
        keywords: topicData?.keywords,
        search_intent: topicData?.search_intent,
        content_angle: topicData?.content_angle,
        outline: topicData?.outline,
        difficulty: topicData?.difficulty,
        opportunity_score: topicData?.opportunity_score,
        target_word_count: topicData?.target_word_count,
      },
      brand: {
        id: brandId,
        name: brandData?.name,
        website_url: brandData?.website_url,
        brand_description: brandData?.brand_description,
        target_audience: brandData?.target_audience,
        brand_voice: brandData?.brand_voice,
        key_selling_points: brandData?.key_selling_points,
      },
      article_configuration: {
        language: articleSettings?.language || 'English',
        word_count: articleSettings?.word_count || 1500,
        tone: articleSettings?.tone || 'Professional',
        include_intro: articleSettings?.include_intro ?? true,
        include_conclusion: articleSettings?.include_conclusion ?? true,
        include_faq: articleSettings?.include_faq ?? false,
        brand_mentions: articleSettings?.brand_mentions || 'regular',
        competitor_mentions: articleSettings?.competitor_mentions || 'minimal',
        featured_image: articleSettings?.image_style || 'ai_generation',
      },
      custom_instructions: customInstructions || null,
      internal_backlinks: topicData?.matched_backlinks || [],
      sources: topicData?.matched_sources || [],
    }, null, 2);
  };

  const workflowSteps = [
    {
      number: 1,
      title: 'Website Analysis',
      description: 'Industry, target audience, SEO objective, competitors, content pillars',
      dataSource: 'quick_setup_sessions / seo_campaigns',
      icon: Globe,
    },
    {
      number: 2,
      title: 'Topic Selection',
      description: 'User clicks Write Article and selects topics',
      dataSource: 'selected_topics table',
      icon: FileText,
    },
    {
      number: 3,
      title: 'Article Configuration',
      description: 'Brand mentions, competitors, internal backlinks, AI featured image',
      dataSource: 'article_settings table + user input',
      icon: Settings,
    },
    {
      number: 4,
      title: 'Custom Prompt',
      description: 'Optional custom instructions sent to AI',
      dataSource: 'custom_instruction_prompts table',
      icon: FileText,
    },
    {
      number: 5,
      title: 'Topic Data Points',
      description: 'Keywords focus, word count, outlines, search intent (per topic)',
      dataSource: 'selected_topics + brands tables',
      icon: FileText,
    },
    {
      number: 6,
      title: 'Internal Backlinks',
      description: 'Topic-specific backlinks (if activated)',
      dataSource: 'matched_backlinks field',
      icon: Link2,
    },
    {
      number: 7,
      title: 'Source Analysis',
      description: 'Fetch content, analyze style, citations, tones',
      dataSource: 'matched_sources field + firecrawl',
      icon: BookOpen,
    },
  ];

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AI Content Generation Prompt</DialogTitle>
          <DialogDescription>
            Complete workflow data sent to AI for generating this article
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Workflow Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Writing Workflow (Version 1)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {workflowSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <Card key={step.number} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {step.number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-sm">{step.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {step.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {step.dataSource}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Complete Workflow Data */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Complete Workflow Data</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generateFullWorkflowData(), 'workflow')}
                >
                  {copiedSection === 'workflow' ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                  <div className="p-4">
                    <pre className="text-xs font-mono whitespace-pre">
                      {generateFullWorkflowData()}
                    </pre>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Metadata */}
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline">
                Model: {articleSettings?.model || 'google/gemini-2.5-flash'}
              </Badge>
              <Badge variant="outline">
                Topic: {topicData?.title}
              </Badge>
              <Badge variant="outline">
                Language: {articleSettings?.language || 'English'}
              </Badge>
              <Badge variant="outline">
                Word Count: {articleSettings?.word_count || 1500}
              </Badge>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
