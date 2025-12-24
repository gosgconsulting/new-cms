import { useEffect, useState } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Lightbulb, CheckCircle2, X, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TopicBriefModal } from '../TopicBriefModal';
import { useCopilot } from '@/contexts/CopilotContext';
import { Info, Briefcase, ShoppingCart, Compass } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';

interface Topic {
  title: string;
  search_term?: string | { search_term: string }; // Can be string or object with search_term property
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string; // Required - one of: informational, commercial, transactional, navigational
  difficulty: number;
  opportunity_score: number;
  target_word_count: number;
  content_angle: string;
  outline: string[];
  matched_backlinks?: Array<{ url: string; title: string; keyword: string; type: 'internal' | 'external' }>;
  matched_sources?: Array<{
    url: string;
    title: string;
    insights?: any;
    citations?: Array<{ text: string; url: string }>;
  }>;
  source_citations?: Array<{ text: string; url: string }>;
  isSelected?: boolean;
}

// Helper function to capitalize titles properly (handles null/undefined safely)
const toTitleCase = (str: string | undefined | null): string => {
  // Handle edge cases
  if (!str || typeof str !== 'string' || str.trim() === '') {
    return 'Untitled';
  }
  
  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'via', 'with'];
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first and last word
      if (index === 0 || index === str.split(' ').length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Don't capitalize small words unless they're the first word
      if (smallWords.includes(word)) {
        return word;
      }
      // Capitalize all other words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const Step8TopicGeneration = () => {
  const { sessionData, updateSessionData, setIsLoading, isLoading } = useQuickSetup();
  const { selectedBrand } = useCopilot();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);

  // Function to match backlinks with topics based on keyword similarity
  const matchBacklinksToTopics = (topics: Topic[], backlinks: Array<{ url: string; title: string; keyword: string; type: 'internal' | 'external' }>) => {
    return topics.map(topic => {
      // Match backlinks where the backlink keyword is related to the topic's primary or secondary keywords
      const matchedBacklinks = backlinks.filter(backlink => {
        const backlinkKeywordLower = backlink.keyword.toLowerCase();
        const primaryKeywordLower = topic.primary_keyword.toLowerCase();
        const secondaryKeywordsLower = topic.secondary_keywords.map(k => k.toLowerCase());
        
        // Check if backlink keyword matches or is contained in primary keyword
        if (backlinkKeywordLower.includes(primaryKeywordLower) || primaryKeywordLower.includes(backlinkKeywordLower)) {
          return true;
        }
        
        // Check if backlink keyword matches any secondary keywords
        return secondaryKeywordsLower.some(sk => 
          backlinkKeywordLower.includes(sk) || sk.includes(backlinkKeywordLower)
        );
      });
      
      return {
        ...topic,
        matched_backlinks: matchedBacklinks
      };
    });
  };

  useEffect(() => {
    if (sessionData.topics && sessionData.topics.length > 0) {
      let loadedTopics = sessionData.topics;
      
      // If backlinks exist but topics don't have matched_backlinks, match them now
      if (sessionData.backlinks && sessionData.backlinks.length > 0 && 
          !loadedTopics[0]?.matched_backlinks) {
        loadedTopics = matchBacklinksToTopics(loadedTopics, sessionData.backlinks);
        updateSessionData({ topics: loadedTopics });
      }
      
      setTopics(loadedTopics);
      setHasGenerated(true);
    }
  }, []);

  const generateTopics = async () => {
    setIsLoading(true);
    setHasGenerated(false);

    try {
      // STEP 0: Ensure campaign exists and get campaign_id BEFORE generating topics
      let campaignId = sessionData.campaign_id;
      
      if (!campaignId && sessionData.brand_id && sessionData.user_id) {
        // Create campaign first so topics can be linked
        const campaignName = `${sessionData.selected_cluster?.cluster_name || 'Quick Setup'} - ${sessionData.website_url}`;
        const { data: campaignData, error: campaignError } = await supabase
          .from('seo_campaigns')
          .insert({
            brand_id: sessionData.brand_id,
            user_id: sessionData.user_id,
            name: campaignName,
            website_url: sessionData.website_url,
            business_description: sessionData.business_description || `SEO Campaign for ${sessionData.website_url}`,
            language: sessionData.language || 'English',
            target_country: sessionData.country || 'United States',
            article_length: 'medium',
            article_type: 'blog',
            quick_setup_data: sessionData,
            current_step: 'step_4',
            progress: 66,
            status: 'in_progress',
            number_of_articles: sessionData.topic_count || 12,
            keywords_cluster: sessionData.selected_cluster?.cluster_name || null,
          })
          .select('id')
          .single();

        if (campaignError) throw campaignError;
        
        campaignId = campaignData.id;
        updateSessionData({ campaign_id: campaignId });
        console.log('✅ Campaign created:', campaignId);
      }

      // Step 1: Use existing backlinks from website analysis or discover new ones
      let backlinks: Array<{ url: string; title: string; keyword: string; type: 'internal' | 'external' }> = [];
      
      // Check if we already have backlinks from Step 1 (website analysis)
      if (sessionData.backlinks && sessionData.backlinks.length > 0) {
        backlinks = sessionData.backlinks;
        console.log(`Using ${backlinks.length} backlinks from website analysis`);
      } else {
        // If no existing backlinks, discover new ones based on settings
        const backlinkTypes: string[] = [];
        
        if (sessionData.internal_links) backlinkTypes.push('internal');
        if (sessionData.external_links) backlinkTypes.push('external');
        
        if (backlinkTypes.length > 0) {
          const { data: backlinkData, error: backlinkError } = await supabase.functions.invoke('quick-setup-backlink-discovery', {
            body: {
              websiteUrl: sessionData.website_url,
              keywords: sessionData.keywords?.slice(0, 20) || [],
              topics: [],
              types: backlinkTypes,
              brandId: sessionData.brand_id,
              userId: sessionData.user_id,
              sources: sessionData.sources,
            }
          });

          if (backlinkError) {
            console.error('Backlink discovery error:', backlinkError);
            toast.error('Failed to discover backlinks, continuing without them');
          } else {
            backlinks = backlinkData?.backlinks || [];
            if (backlinks.length > 0) {
              updateSessionData({ backlinks });
            }
          }
        }
      }

      // Step 2: Generate topics
      const { data, error } = await supabase.functions.invoke('quick-setup-topic-generation', {
        body: {
          keywords: sessionData.keywords,
          longtailKeywords: sessionData.longtail_keywords,
          sources: sessionData.sources,
          fetchedSources: sessionData.fetched_sources || sessionData.sources,
          competitors: sessionData.competitors,
          websiteUrl: sessionData.website_url,
          language: sessionData.language,
          existingBlogTopics: sessionData.existing_blog_topics || [],
          topicCount: sessionData.topic_count || 12,
          brandMentions: sessionData.brand_mentions ?? true,
          competitorMentions: sessionData.competitor_mentions ?? true,
          internalLinks: sessionData.internal_links ?? true,
          aiFeaturedImage: sessionData.ai_featured_image ?? true,
        }
      });

      if (error) {
        // Handle specific error types
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

      let generatedTopics = data.topics as Topic[];
      
      // Format topic titles with proper capitalization and ensure required fields exist
      generatedTopics = generatedTopics.map(topic => ({
        ...topic,
        title: toTitleCase(topic.title),
        primary_keyword: topic.primary_keyword || topic.title.toLowerCase(),
        secondary_keywords: topic.secondary_keywords || [],
        target_word_count: topic.target_word_count || 1400,
      }));
      
      // Match backlinks with topics
      if (backlinks.length > 0) {
        generatedTopics = matchBacklinksToTopics(generatedTopics, backlinks);
      }
      
      setTopics(generatedTopics);
      updateSessionData({ topics: generatedTopics });
      setHasGenerated(true);

      // Save topics to database
      await saveTopicsToDatabase(generatedTopics);

    } catch (error) {
      console.error('Error generating topics:', error);
      // Error already handled above with specific messages
    } finally {
      setIsLoading(false);
    }
  };

  const saveTopicsToDatabase = async (topics: Topic[]) => {
    const brandId = sessionData.brand_id;
    const userId = sessionData.user_id;
    const campaignId = sessionData.campaign_id;
    
    if (!brandId || !userId) {
      console.warn('Missing brand_id or user_id, skipping database save');
      return;
    }

    try {
      // Check for existing topics with same titles to avoid duplicates
      const { data: existing } = await supabase
        .from('selected_topics')
        .select('title')
        .eq('brand_id', brandId)
        .eq('campaign_id', campaignId || '')
        .in('title', topics.map(t => t.title));

      const existingTitles = new Set(existing?.map(t => t.title) || []);
      
      // Prepare new topics with all required fields
      const newTopics = topics
        .filter(t => !existingTitles.has(t.title))
        .map(topic => ({
          brand_id: brandId,
          user_id: userId,
          campaign_id: campaignId, // ← CRITICAL: Link to campaign!
          title: topic.title,
          // Map keywords correctly
          primary_keyword: topic.primary_keyword || topic.title.toLowerCase(),
          secondary_keywords: topic.secondary_keywords || [],
          keywords: [topic.primary_keyword, ...topic.secondary_keywords].filter(Boolean),
          // Search intent and metrics
          search_intent: topic.search_intent || 'informational',
          search_term: typeof topic.search_term === 'string' ? topic.search_term : null,
          difficulty: topic.difficulty || 5,
          opportunity_score: topic.opportunity_score || 7,
          // Content structure
          content_angle: topic.content_angle || 'Comprehensive guide',
          outline: topic.outline || ['Introduction', 'Main Content', 'Conclusion'],
          target_word_count: topic.target_word_count || 1400,
          estimated_word_count: topic.target_word_count || 1400,
          // Backlinks and sources
          matched_backlinks: topic.matched_backlinks || null,
          matched_sources: topic.matched_sources || null,
          internal_links: topic.matched_backlinks?.filter(b => b.type === 'internal') || null,
          // Status
          status: 'ready',
        }));

      if (newTopics.length > 0) {
        console.log('Saving topics to selected_topics table:', newTopics.length);
        const { data, error } = await supabase
          .from('selected_topics')
          .insert(newTopics)
          .select();

        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }
        console.log('✅ Successfully saved topics:', data?.length);
      }
    } catch (error) {
      console.error('Error saving topics:', error);
      toast.error('Failed to save topics to database');
    }
  };

  const removeTopic = (index: number) => {
    const updated = topics.filter((_, i) => i !== index);
    setTopics(updated);
    updateSessionData({ topics: updated });
  };

  const toggleTopicSelection = (index: number) => {
    const updated = topics.map((topic, i) => 
      i === index ? { ...topic, isSelected: topic.isSelected !== false ? false : true } : topic
    );
    setTopics(updated);
    updateSessionData({ topics: updated });
  };

  const selectAllTopics = () => {
    const updated = topics.map(topic => ({ ...topic, isSelected: true }));
    setTopics(updated);
    updateSessionData({ topics: updated });
  };

  const deselectAllTopics = () => {
    const updated = topics.map(topic => ({ ...topic, isSelected: false }));
    setTopics(updated);
    updateSessionData({ topics: updated });
  };

  const getIntentIcon = (intent: string | undefined) => {
    if (!intent) return <Info className="h-4 w-4" />;
    const intentLower = intent.toLowerCase();
    switch (intentLower) {
      case 'informational':
        return <Info className="h-4 w-4" />;
      case 'commercial':
        return <Briefcase className="h-4 w-4" />;
      case 'transactional':
        return <ShoppingCart className="h-4 w-4" />;
      case 'navigational':
        return <Compass className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getIntentColor = (intent: string | undefined) => {
    if (!intent) return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    switch (intent.toLowerCase()) {
      case 'informational':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'commercial':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      case 'transactional':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'navigational':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  // Group topics by search term (with safe string extraction)
  const groupedTopics = topics.reduce((acc, topic, index) => {
    // Defensively extract search_term string (handle both string and object formats)
    let searchTerm: string;
    if (typeof topic.search_term === 'string' && topic.search_term.trim()) {
      searchTerm = topic.search_term;
    } else if (topic.search_term && typeof topic.search_term === 'object' && topic.search_term.search_term) {
      searchTerm = topic.search_term.search_term;
    } else {
      searchTerm = 'General Topics';
    }
    
    if (!acc[searchTerm]) {
      acc[searchTerm] = [];
    }
    acc[searchTerm].push({ ...topic, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<Topic & { originalIndex: number }>>);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 dark:text-green-400';
    if (difficulty <= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleViewBrief = (topic: Topic, index: number) => {
    setSelectedTopic(topic);
    setSelectedTopicIndex(index);
    setShowBriefModal(true);
  };

  const getBacklinkPotential = (index: number) => {
    if (!sessionData.intent_analysis) return null;
    const analysis = sessionData.intent_analysis.find((a: any) => a.topic_index === index);
    return analysis?.backlink_potential || null;
  };

  const getIntentAnalysis = (index: number) => {
    if (!sessionData.intent_analysis) return null;
    return sessionData.intent_analysis.find((a: any) => a.topic_index === index) || null;
  };

  // Check if topics generation was already attempted in Step 3
  const wasAttempted = sessionData.topicsGenerationAttempted;
  const generationError = sessionData.topicsGenerationError;

  if (!hasGenerated) {
    // If generation was attempted in Step 3 but failed, show error state
    if (wasAttempted && generationError) {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6 border-destructive/50">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Topic Generation Failed</h2>
              <p className="text-muted-foreground">
                {generationError}
              </p>
              <Button
                onClick={() => {
                  updateSessionData({ topicsGenerationAttempted: false, topicsGenerationError: null });
                  window.location.href = '/app/campaigns/quick-setup?step=3';
                }}
                variant="outline"
              >
                Return to Step 3 and Retry
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Generate Content Topics</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose how many topics you'd like to generate based on your keywords and source analysis.
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Language and Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <SearchableSelect
                  value={sessionData.country || 'United States'}
                  onValueChange={(value) => updateSessionData({ country: value })}
                  placeholder="Select location"
                  options={COUNTRIES_WITH_POPULAR_FIRST.map(countryData => ({
                    value: countryData.value,
                    label: countryData.label
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <SearchableSelect
                  value={sessionData.language || 'English'}
                  onValueChange={(value) => updateSessionData({ language: value })}
                  placeholder="Select language"
                  options={LANGUAGES_WITH_POPULAR_FIRST.map(langData => ({
                    value: langData.value,
                    label: langData.label
                  }))}
                />
              </div>
            </div>

            {/* Topic Count Selection */}
            <div>
              <h3 className="font-semibold mb-4 text-center">How many topics do you want?</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updateSessionData({ topic_count: 12 })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    (sessionData.topic_count || 12) === 12
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl font-bold text-primary mb-1">12</div>
                  <div className="text-xs text-muted-foreground">Topics</div>
                </button>
                <button
                  onClick={() => updateSessionData({ topic_count: 16 })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    sessionData.topic_count === 16
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl font-bold text-primary mb-1">16</div>
                  <div className="text-xs text-muted-foreground">Topics</div>
                </button>
                <button
                  onClick={() => updateSessionData({ topic_count: 20 })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    sessionData.topic_count === 20
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl font-bold text-primary mb-1">20</div>
                  <div className="text-xs text-muted-foreground">Topics</div>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => updateSessionData({ topic_count: 24 })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    sessionData.topic_count === 24
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl font-bold text-primary mb-1">24</div>
                  <div className="text-xs text-muted-foreground">Topics</div>
                </button>
                <button
                  onClick={() => updateSessionData({ topic_count: 28 })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    sessionData.topic_count === 28
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl font-bold text-primary mb-1">28</div>
                  <div className="text-xs text-muted-foreground">Topics</div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What we'll generate:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>1 search term per 4 topics covering all user intents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Topics optimized for your selected keywords</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Search intent and ranking difficulty analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Content angles based on source analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Article outlines and word count recommendations</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={generateTopics}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating {sessionData.topic_count || 12} Topics...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Generate {sessionData.topic_count || 12} Content Topics
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Campaign Topics</h2>
        <p className="text-muted-foreground">
          {topics.length} topics generated for this campaign
        </p>
      </div>

        <Card className="overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">Campaign Topics</h2>
            <p className="text-sm text-muted-foreground">Topics generated from the Quick Setup for this campaign</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Search Term</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead className="text-center">Brief</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedTopics).map(([searchTerm, groupTopics]) => (
                <>
                  {groupTopics.map((topic) => {
                    const index = topic.originalIndex;
                    return (
                      <TableRow key={index} className={topic.isSelected === false ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="font-medium">{toTitleCase(topic.title)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {typeof topic.search_term === 'string' && topic.search_term
                              ? toTitleCase(topic.search_term)
                              : (typeof topic.search_term === 'object' && topic.search_term && 'search_term' in topic.search_term)
                                ? toTitleCase(topic.search_term.search_term)
                                : 'General Topic'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {topic.primary_keyword && (
                              <Badge variant="default" className="bg-primary text-primary-foreground">
                                {topic.primary_keyword}
                              </Badge>
                            )}
                            {topic.secondary_keywords && topic.secondary_keywords.length > 0 ? (
                              <>
                                {topic.secondary_keywords.slice(0, 2).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary">{keyword}</Badge>
                                ))}
                                {topic.secondary_keywords.length > 2 && (
                                  <Badge variant="outline">+{topic.secondary_keywords.length - 2} more</Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">No keywords</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getIntentColor(topic.search_intent)} flex items-center gap-1 w-fit`}>
                            {getIntentIcon(topic.search_intent)}
                            <span className="capitalize">{topic.search_intent || 'Unknown'}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" onClick={() => handleViewBrief(topic, index)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Brief
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <TopicBriefModal
        open={showBriefModal}
        onOpenChange={setShowBriefModal}
        topic={selectedTopic}
        intentAnalysis={selectedTopicIndex !== null ? getIntentAnalysis(selectedTopicIndex) : null}
        sources={sessionData.sources || []}
        websiteUrl={sessionData.website_url}
        targetCountry={sessionData.country}
        language={sessionData.language}
        brandName={sessionData.brand_name}
        brandDescription={sessionData.brand_description}
        targetAudience={sessionData.target_audience}
        keySellingPoints={sessionData.key_selling_points}
      />
    </>
  );
};
