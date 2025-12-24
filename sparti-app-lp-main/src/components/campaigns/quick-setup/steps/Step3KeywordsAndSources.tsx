import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuickSetupPersistence } from '@/hooks/useQuickSetupPersistence';
import { Card, CardContent } from '@/components/ui/card';
import BaseLoadingSpinner from '@/components/base/BaseLoadingSpinner';

interface AutomationStep {
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  message?: string;
}

export const Step3KeywordsAndSources = () => {
  const { sessionData, updateSessionData, nextStep, setIsLoading: setContextLoading } = useQuickSetup();
  const { saveCampaignProgress } = useQuickSetupPersistence();
  
  // Use keywords from selected cluster
  const selectedCluster = sessionData.selected_cluster;
  const keywords = selectedCluster?.keywords || [];
  
  const [location, setLocation] = useState(sessionData.country || 'United States');
  const [language, setLanguage] = useState(sessionData.language || 'English');
  const [topicsNumber, setTopicsNumber] = useState(20);
  const [contentSettings, setContentSettings] = useState<any>(null);
  const [showProgress, setShowProgress] = useState(false);

  // New states for search terms and sources
  const [searchTerms, setSearchTerms] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  // Progress tracking - updated steps
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([
    { name: 'Generate search terms', status: 'pending' },
    { name: 'Search on web for sources', status: 'pending' },
    { name: 'Analyse internal backlinks', status: 'pending' },
    { name: 'Suggest topics', status: 'pending' },
  ]);

  const updateAutomationStep = (index: number, status: 'pending' | 'loading' | 'complete' | 'error', message?: string) => {
    setAutomationSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message } : step
    ));
  };

  const [isLoading, setIsLoading] = useState(false);

  // Load content settings and brand defaults
  useEffect(() => {
    const loadSettings = async () => {
      if (!sessionData.brand_id) return;
      
      try {
        // Load content settings for location and language
        const { data: settings } = await supabase
          .from('content_settings')
          .select('*')
          .eq('brand_id', sessionData.brand_id)
          .maybeSingle();
        
        if (settings) {
          setContentSettings(settings);
          // Set location and language from content settings if available
          if (settings.target_country) setLocation(settings.target_country);
          if (settings.content_language) setLanguage(settings.content_language);
        } else {
          // Fallback to brand settings if no content settings
          const { data: brand } = await supabase
            .from('brands')
            .select('country, language')
            .eq('id', sessionData.brand_id)
            .maybeSingle();
          
          if (brand) {
            if (brand.country) setLocation(brand.country);
            if (brand.language) setLanguage(brand.language);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
    
    // Reset topicsGenerated flag when entering this step
    if (sessionData.topicsGenerated) {
      updateSessionData({ topicsGenerated: false });
    }
  }, [sessionData.brand_id]);


  const handleSearchClick = async () => {
    // Validate before starting
    if (!sessionData.brand_id) {
      toast.error('Brand not found');
      return;
    }

    if (keywords.length === 0) {
      toast.error('Please select at least one keyword');
      return;
    }

    // IMMEDIATELY show progress UI and reset steps
    setShowProgress(true);
    setIsLoading(true);
    setAutomationSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    // Ensure we have sitemap links
    let sitemapLinks = sessionData.sitemap_links || [];
    
    // If no sitemap links in session, try to fetch them
    if (sitemapLinks.length === 0 && sessionData.website_url) {
      console.log('No sitemap links found, fetching sitemap...');
      try {
        const { data: sitemapData, error: sitemapError } = await supabase.functions.invoke(
          'domain-sitemap-discovery',
          { body: { domain: sessionData.website_url } }
        );
        
        if (!sitemapError && sitemapData?.success && sitemapData?.links) {
          sitemapLinks = sitemapData.links;
          updateSessionData({
            sitemap_links: sitemapLinks,
            sitemap_url: sitemapData.sitemapUrl,
            total_sitemap_links: sitemapData.totalLinks || sitemapLinks.length,
          });
          console.log('Sitemap fetched:', sitemapLinks.length, 'URLs');
        } else {
          console.warn('Could not fetch sitemap:', sitemapError);
        }
      } catch (error) {
        console.error('Sitemap fetch error:', error);
      }
    }

    try {
      // Step 1: Generate search terms from selected cluster
      updateAutomationStep(0, 'loading');
      
      const { data: searchTermsData, error: searchTermsError } = await supabase.functions.invoke(
        'quick-setup-search-terms',
        {
          body: {
            cluster: selectedCluster,
            topicsNumber,
            objective: sessionData.seo_objective,
            language
          }
        }
      );

      if (searchTermsError) throw new Error('Failed to generate search terms');
      
      const generatedSearchTerms = searchTermsData.searchTerms;
      setSearchTerms(generatedSearchTerms);
      updateAutomationStep(0, 'complete', `✅ ${generatedSearchTerms.length} search terms`);

      // Step 2: Search and scrape sources
      updateAutomationStep(1, 'loading');
      const { data: sourcesData, error: sourcesError } = await supabase.functions.invoke(
        'quick-setup-scrape-sources',
        {
          body: {
            searchTerms: generatedSearchTerms,
            country: location,
            websiteUrl: sessionData.website_url
          }
        }
      );

      if (sourcesError) throw new Error('Failed to scrape sources');
      
      const scrapedSources = sourcesData.sources;
      console.log('Scraped sources:', scrapedSources.length, 'sources');
      console.log('Sample scraped source:', JSON.stringify(scrapedSources[0] || {}, null, 2));
      
      setSources(scrapedSources);
      updateSessionData({ sources: scrapedSources, fetched_sources: scrapedSources });
      updateAutomationStep(1, 'complete', `✅ ${scrapedSources.length} sources found`);

      // Step 3: Analyse internal backlinks and existing content (non-blocking)
      updateAutomationStep(2, 'loading');
      
      let existingTopics: string[] = [];
      let internalBacklinksMap: any = {};
      
      try {
        console.log('Analyzing internal backlinks with', sitemapLinks.length, 'sitemap URLs');
        
        if (sitemapLinks.length === 0) {
          console.warn('No sitemap URLs available for internal backlinks analysis');
          updateAutomationStep(2, 'complete', '⚠️ No sitemap - skipped');
        } else {
          const { data: backlinksData, error: backlinksError } = await supabase.functions.invoke(
            'quick-setup-internal-backlinks',
            {
              body: {
                keywords,
                sitemapUrls: sitemapLinks,
                websiteUrl: sessionData.website_url,
                analyzeExisting: true // Flag to analyze existing content
              }
            }
          );

          if (backlinksError) {
            console.warn('⚠️ Backlinks analysis failed (non-blocking):', backlinksError);
            // Continue workflow - backlinks are optional
            existingTopics = [];
            internalBacklinksMap = {};
            updateAutomationStep(2, 'complete', '⚠️ Skipped - continuing without backlinks');
          } else {
            console.log('✅ Internal backlinks analysis complete:', backlinksData);
            existingTopics = backlinksData.existingTopics || [];
            internalBacklinksMap = backlinksData.backlinksMap || {};
            updateAutomationStep(2, 'complete', `✅ Found ${existingTopics.length} existing topics`);
          }
        }
      } catch (error) {
        console.warn('⚠️ Backlinks analysis exception (non-blocking):', error);
        // Continue workflow even if internal backlinks fail
        existingTopics = [];
        internalBacklinksMap = {};
        updateAutomationStep(2, 'complete', '⚠️ Skipped - continuing without backlinks');
      }

      // Step 4: Generate topics with the scraped sources (avoiding duplicates)
      updateAutomationStep(3, 'loading');
      
      const { data: topicsData, error: topicsError } = await supabase.functions.invoke(
        'quick-setup-topic-generation',
        {
          body: {
            keywords,
            // Normalize search terms to strings before passing
            searchTerms: generatedSearchTerms.map((st: any) => 
              typeof st === 'string' ? st : st.search_term
            ),
            sources: scrapedSources,
            fetchedSources: scrapedSources,
            websiteUrl: sessionData.website_url,
            language,
            topicCount: topicsNumber,
            existingTopics: existingTopics, // Pass topics to avoid
            // Pass brand information when using brand data source
            brandName: sessionData.brand_name,
            brandDescription: sessionData.brand_description,
            targetAudience: sessionData.target_audience,
            keySellingPoints: sessionData.key_selling_points,
            dataSource: sessionData.data_source,
          }
        }
      );

      if (topicsError) {
        console.error('Topic generation error details:', {
          message: topicsError.message,
          details: topicsError,
          statusCode: topicsError.status,
          context: topicsError.context
        });
        
        // Mark as attempted even if failed
        updateSessionData({ 
          topicsGenerationAttempted: true, 
          topicsGenerationError: topicsError.message || 'Failed to generate topics' 
        });
        
        // Show user-friendly error message with status codes
        let errorMsg = 'Failed to generate topics';
        if (topicsError.message?.includes('Rate limit') || topicsError.status === 429) {
          errorMsg = 'Rate limit reached. Please wait a moment and try again.';
          updateAutomationStep(3, 'error', '⚠️ Rate limit - try again in a few minutes');
        } else if (topicsError.message?.includes('Payment') || topicsError.status === 402) {
          errorMsg = 'OpenRouter credits exhausted. Please add credits to your OpenRouter account.';
          updateAutomationStep(3, 'error', '⚠️ Payment required - add OpenRouter credits');
        } else if (topicsError.message?.includes('Invalid') || topicsError.status === 401) {
          errorMsg = 'Invalid API key. Please check your OpenRouter configuration.';
          updateAutomationStep(3, 'error', '⚠️ Invalid API key - check configuration');
        } else if (topicsError.message) {
          errorMsg = topicsError.message;
          updateAutomationStep(3, 'error', `⚠️ ${errorMsg}`);
        } else {
          updateAutomationStep(3, 'error', '⚠️ Topic generation failed');
        }
        
        throw new Error(errorMsg);
      }
      
      if (!topicsData || !topicsData.topics) {
        console.error('Invalid response from topic generation:', topicsData);
        throw new Error('Invalid response from topic generation service');
      }
      
      let generatedTopics = topicsData.topics;
      console.log('Generated topics:', generatedTopics.length);
      
      // Show partial success if we got fewer topics than requested
      const expectedTopics = topicsNumber;
      const actualTopics = generatedTopics.length;
      const successRate = Math.round((actualTopics / expectedTopics) * 100);
      
      // Merge internal backlinks into topics
      if (Object.keys(internalBacklinksMap).length > 0) {
        generatedTopics = generatedTopics.map((topic: any) => {
          const matchedBacklink = internalBacklinksMap[topic.title];
          return {
            ...topic,
            internal_links: matchedBacklink?.internal_links || []
          };
        });
      }
      
      updateSessionData({ 
        topics: generatedTopics,
        sources: scrapedSources,
        topicsGenerated: true,
        topicsGenerationAttempted: true,
        topicsGenerationError: null
      });
      
      // Show different messages based on success rate
      if (successRate >= 90) {
        updateAutomationStep(3, 'complete', `✅ ${generatedTopics.length} topics generated`);
      } else if (successRate >= 75) {
        updateAutomationStep(3, 'complete', `✅ ${generatedTopics.length}/${expectedTopics} topics (partial success)`);
      } else {
        updateAutomationStep(3, 'complete', `⚠️ ${generatedTopics.length}/${expectedTopics} topics (low success rate)`);
        toast.warning(`Only generated ${generatedTopics.length} of ${expectedTopics} topics`);
      }
      setIsLoading(false);
      setContextLoading(false); // Reset context loading state
      
      // Auto-redirect to next step after a brief delay
      setTimeout(() => {
        nextStep();
      }, 1500);

    } catch (error) {
      console.error('Research error:', error);
      const currentStepIndex = automationSteps.findIndex(s => s.status === 'loading');
      if (currentStepIndex !== -1) {
        updateAutomationStep(currentStepIndex, 'error', error instanceof Error ? error.message : 'Failed to complete this step');
      }
      
      // Mark as attempted with error
      updateSessionData({ 
        topicsGenerationAttempted: true, 
        topicsGenerationError: error instanceof Error ? error.message : 'Research failed' 
      });
      
      toast.error(error instanceof Error ? error.message : 'Research failed');
      setIsLoading(false);
      setContextLoading(false); // Reset context loading state
      setShowProgress(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Selected Cluster Display */}
        {selectedCluster && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Selected Keyword Cluster</Label>
                  <p className="text-lg font-semibold mt-1">{selectedCluster.cluster_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedCluster.keywords.length} keywords • {selectedCluster.intent} intent
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {selectedCluster.intent}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-base font-medium mb-2 block">Location</Label>
            <SearchableSelect
              value={location}
              onValueChange={setLocation}
              placeholder="Select location"
              options={COUNTRIES_WITH_POPULAR_FIRST.map(countryData => ({
                value: countryData.value,
                label: countryData.label
              }))}
            />
          </div>

          <div>
            <Label className="text-base font-medium mb-2 block">Language</Label>
            <SearchableSelect
              value={language}
              onValueChange={setLanguage}
              placeholder="Select language"
              options={LANGUAGES_WITH_POPULAR_FIRST.map(langData => ({
                value: langData.value,
                label: langData.label
              }))}
            />
          </div>

          <div>
            <Label className="text-base font-medium mb-2 block">Topics Number</Label>
            <Select value={topicsNumber.toString()} onValueChange={(value) => setTopicsNumber(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Number of topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Topics</SelectItem>
                <SelectItem value="16">16 Topics</SelectItem>
                <SelectItem value="20">20 Topics</SelectItem>
                <SelectItem value="24">24 Topics</SelectItem>
                <SelectItem value="28">28 Topics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Start Research Button */}
        <Button 
          onClick={handleSearchClick}
          disabled={keywords.length === 0 || isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Researching Topics...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Start Topic Research
            </>
          )}
        </Button>
      </div>

      {/* Full-Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <BaseLoadingSpinner size="lg" variant="primary" type="radar" />
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Researching topics...
              </h2>
              <p className="text-muted-foreground">
                This may take 2-3 minutes. Please wait while we analyze and suggest topics.
              </p>
              <div className="space-y-3 text-left">
                {automationSteps.map((step, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-3">
                      {step.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {step.status === 'complete' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {step.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                      {step.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-muted" />}
                      <span className={`text-sm ${step.status === 'complete' ? 'text-muted-foreground' : ''}`}>
                        {step.name}
                      </span>
                    </div>
                    {step.message && step.status === 'error' && (
                      <p className="text-xs text-destructive ml-7">{step.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
