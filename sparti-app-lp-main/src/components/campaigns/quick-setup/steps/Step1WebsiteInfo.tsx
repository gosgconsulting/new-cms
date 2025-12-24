import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useQuickSetup, QuickSetupSession } from '@/contexts/QuickSetupContext';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCopilot } from '@/contexts/CopilotContext';
import { useQuickSetupPersistence } from '@/hooks/useQuickSetupPersistence';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandSelectorCombobox } from '@/components/campaigns/BrandSelectorCombobox';
import BaseLoadingSpinner from '@/components/base/BaseLoadingSpinner';

interface AutomationStep {
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  message?: string;
}

interface Step1WebsiteInfoProps {
  onUnauthenticatedAction?: () => void;
  autoStartAnalysis?: boolean;
  trialMode?: boolean;
}

export const Step1WebsiteInfo = ({ onUnauthenticatedAction, autoStartAnalysis, trialMode = false }: Step1WebsiteInfoProps = {}) => {
  const { sessionData, updateSessionData } = useQuickSetup();
  const { user } = useAuth();
  const { selectedBrand, setSelectedBrand } = useCopilot();
  const { saveCampaignProgress } = useQuickSetupPersistence();
  
  const [localBrandId, setLocalBrandId] = useState(selectedBrand?.id || '');
  const [brandNameInput, setBrandNameInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(sessionData.website_url || '');
  const [country, setCountry] = useState(sessionData.country || 'United States');
  const [language, setLanguage] = useState(sessionData.language || 'English');
  const [customInstructions, setCustomInstructions] = useState(sessionData.custom_instructions || '');
  const [urlError, setUrlError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [automationComplete, setAutomationComplete] = useState(false);
  const [isFetchingBrandSettings, setIsFetchingBrandSettings] = useState(true);
  
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([
    { name: 'Website Analysis', status: 'pending' },
    { name: 'Setting SEO Objective', status: 'pending' },
    { name: 'Sitemap Analysis', status: 'pending' },
    { name: 'Keywords Analysis', status: 'pending' },
  ]);

  useEffect(() => {
    if (selectedBrand?.id) {
      setLocalBrandId(selectedBrand.id);
    }
  }, [selectedBrand?.id]);

  // In trial mode, auto-fill brand name from session
  useEffect(() => {
    if (trialMode && sessionData.brand_name && !brandNameInput) {
      setBrandNameInput(sessionData.brand_name);
    }
  }, [trialMode, sessionData.brand_name]);

  useEffect(() => {
    const fetchBrandSettings = async () => {
      // In trial mode, don't fetch brand settings
      if (trialMode) {
        setIsFetchingBrandSettings(false);
        return;
      }

      if (!localBrandId) {
        setIsFetchingBrandSettings(false);
        return;
      }

      try {
        // Fetch brand data including website URL
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('id', localBrandId)
          .single();

        if (!brandError && brandData) {
          // Update selected brand in context
          setSelectedBrand(brandData as any);
          
          if (brandData.website && !sessionData.website_url) {
            setWebsiteUrl(brandData.website);
            updateSessionData({ 
              website_url: brandData.website,
              brand_id: brandData.id,
              user_id: user?.id 
            });
          } else if (!sessionData.brand_id) {
            updateSessionData({ 
              brand_id: brandData.id,
              user_id: user?.id 
            });
          }
        }

        // Fetch content settings
        const { data, error } = await supabase
          .from('content_settings')
          .select('target_country, content_language')
          .eq('brand_id', localBrandId)
          .single();

        if (!error && data) {
          if (data.target_country && !sessionData.country) {
            setCountry(data.target_country);
          }
          if (data.content_language && !sessionData.language) {
            setLanguage(data.content_language);
          }
        }
      } catch (error) {
        console.error('Error fetching brand settings:', error);
      } finally {
        setIsFetchingBrandSettings(false);
      }
    };

    fetchBrandSettings();
  }, [localBrandId, trialMode]);

  // Auto-start analysis when requested (e.g., after signup)
  useEffect(() => {
    const canAutoStart = trialMode 
      ? (sessionData.brand_id && user) // In trial mode, brand should already exist
      : (localBrandId && user);

    if (autoStartAnalysis && websiteUrl && !isAnalyzing && !automationComplete && !isFetchingBrandSettings && canAutoStart) {
      console.log('[Step1WebsiteInfo] Auto-starting analysis for trial mode');
      // In trial mode, set the localBrandId from sessionData
      if (trialMode && sessionData.brand_id) {
        setLocalBrandId(sessionData.brand_id);
      }
      handleAnalyzeWebsite();
    }
  }, [autoStartAnalysis, websiteUrl, isFetchingBrandSettings, user, localBrandId, sessionData.brand_id, trialMode]);

  const handleBrandChange = (brandId: string, brandName: string) => {
    setLocalBrandId(brandId);
    updateSessionData({ 
      brand_id: brandId,
      user_id: user?.id 
    });
  };

  const updateAutomationStep = (index: number, status: 'pending' | 'loading' | 'complete' | 'error', message?: string) => {
    setAutomationSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message } : step
    ));
  };

  const saveAnalysisResultsToCampaign = async (brandId?: string, userId?: string) => {
    try {
      console.log('[testing] Saving website analysis results to campaign...');
      
      // Use provided IDs or fallback to sessionData
      const finalBrandId = brandId || sessionData.brand_id;
      const finalUserId = userId || sessionData.user_id;
      
      // Ensure we have the required data
      if (!finalBrandId || !finalUserId) {
        console.warn('[testing] Missing brand_id or user_id for campaign save', { finalBrandId, finalUserId });
        toast.error('Missing required data to save campaign');
        return null;
      }

      // Create updated session data with the IDs
      const updatedSessionData = {
        ...sessionData,
        brand_id: finalBrandId,
        user_id: finalUserId,
      };

      // Save the campaign with current analysis results
      const campaignId = await saveCampaignProgress(updatedSessionData as QuickSetupSession, 1);
      
      if (campaignId) {
        // Update session data with the campaign ID
        updateSessionData({ campaign_id: campaignId });
        console.log('[testing] Campaign saved successfully with ID:', campaignId);
        return campaignId;
      } else {
        console.error('[testing] Failed to get campaign ID from save operation');
        toast.error('Failed to create campaign');
        return null;
      }
    } catch (error: any) {
      console.error('[testing] Error saving analysis results to campaign:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save analysis results to campaign';
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
      return null;
    }
  };

  const validateUrl = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl || !validateUrl(websiteUrl)) {
      toast.error('Please enter a valid website URL');
      return;
    }

    // Check if user is authenticated
    if (!user && onUnauthenticatedAction) {
      onUnauthenticatedAction();
      return;
    }

    // In trial mode, brand should already exist from signup
    // In normal mode, check if brand ID is available
    if (trialMode && !sessionData.brand_id) {
      toast.error('Brand not found. Please try again.');
      return;
    }
    
    if (!trialMode && !localBrandId && !brandNameInput.trim()) {
      toast.error('Please enter a brand name or select a brand');
      return;
    }

    setIsAnalyzing(true);
    setAutomationSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    // Get the brand ID to use (from trial signup or local selection)
    let finalBrandId = trialMode ? sessionData.brand_id : localBrandId;

    try {
      // Only create brand if NOT in trial mode and no brand selected (trial mode already created it)
      if (!trialMode && !localBrandId && user) {
        const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
        
        const { data: newBrandData, error: brandError } = await supabase
          .from('brands')
          .insert({
            name: brandNameInput.trim(),
            website: normalizedUrl,
            user_id: user.id,
            copilot_type: 'seo',
          })
          .select()
          .single();

        if (brandError) throw brandError;

        // Set the newly created brand
        setLocalBrandId(newBrandData.id);
        setSelectedBrand(newBrandData as any);
        finalBrandId = newBrandData.id;
        
        updateSessionData({
          brand_id: newBrandData.id,
          user_id: user.id,
          website_url: normalizedUrl,
        });

        toast.success(`Analyzing website for "${newBrandData.name}"...`);
      }
    } catch (error: any) {
      console.error('Error creating brand:', error);
      toast.error(error.message || 'Failed to create brand');
      setIsAnalyzing(false);
      return;
    }

    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    // Retry logic for website analysis
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;

        // Step 0: Website Analysis
        updateAutomationStep(0, 'loading', attempt > 1 ? `Retry ${attempt}/${MAX_RETRIES}` : undefined);
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('quick-setup-website-analysis', {
          body: {
            websiteUrl: normalizedUrl,
            extractStructured: true
          }
        });

        if (analysisError) {
          // Handle specific error types that shouldn't be retried
          if (analysisError.message?.includes('402') || analysisError.message?.includes('payment')) {
            throw new Error('PAYMENT_REQUIRED: Your workspace is out of AI credits. Please add credits to continue.');
          }
          throw analysisError;
        }
        
        if (!analysisData?.success) {
          throw new Error('Failed to analyze website');
        }

        const extractedData = analysisData.data;
        lastError = null; // Clear error on success
      
      updateSessionData({
        website_url: normalizedUrl,
        brand_name: extractedData.brand_name,
        brand_description: extractedData.brand_description,
        target_audience: extractedData.target_audience,
        key_selling_points: extractedData.key_selling_points,
      });
      updateAutomationStep(0, 'complete');

      // Step 1: Setting SEO Objective
      updateAutomationStep(1, 'loading');
      const { data: objectiveData, error: objectiveError } = await supabase.functions.invoke('quick-setup-seo-objective', {
        body: {
          websiteUrl: normalizedUrl,
          brandName: extractedData.brand_name,
          description: extractedData.brand_description,
          targetAudience: extractedData.target_audience,
          customInstructions: customInstructions || null,
        }
      });

      if (!objectiveError && objectiveData) {
        updateSessionData({
          seo_objective: objectiveData.objective,
          focus_areas: objectiveData.focus_areas,
        });
      }
      updateAutomationStep(1, 'complete');

      // Step 2: Sitemap Analysis
      updateAutomationStep(2, 'loading');
      try {
        const { data: sitemapData, error: sitemapError } = await supabase.functions.invoke('domain-sitemap-discovery', {
          body: { domain: normalizedUrl }
        });

        console.log('Sitemap discovery response:', sitemapData);

        if (sitemapError) {
          console.error('Sitemap discovery error:', sitemapError);
          updateAutomationStep(2, 'error', sitemapError.message);
        } else if (sitemapData?.success && sitemapData?.links) {
          updateSessionData({
            sitemap_links: sitemapData.links,
            sitemap_url: sitemapData.sitemapUrl,
            total_sitemap_links: sitemapData.totalLinks || sitemapData.links.length,
          });
          updateAutomationStep(2, 'complete', `Found ${sitemapData.totalLinks || sitemapData.links.length} URLs`);
        } else {
          console.warn('No sitemap discovered for domain');
          updateSessionData({
            sitemap_links: [],
            total_sitemap_links: 0,
          });
          updateAutomationStep(2, 'complete', 'No sitemap found');
        }
      } catch (error) {
        console.error('Sitemap discovery exception:', error);
        updateAutomationStep(2, 'error', error.message || 'Failed to discover sitemap');
      }

      // Step 3: Keywords Analysis
      updateAutomationStep(3, 'loading');
      
      const brandInfo = {
        brand_name: extractedData.brand_name,
        description: extractedData.brand_description,
        target_audience: extractedData.target_audience,
        key_points: extractedData.key_selling_points,
      };

      const { data: keywordsData, error: keywordsError } = await supabase.functions.invoke(
        'quick-setup-keyword-extraction',
        {
          body: {
            websiteUrl: normalizedUrl,
            country,
            language,
            customInstructions,
            aiQuestionsAnswers: [
              { question: 'What is your brand name?', answer: brandInfo.brand_name },
              { question: 'Describe your business', answer: brandInfo.description },
              { question: 'Who is your target audience?', answer: brandInfo.target_audience },
              { question: 'What are your key selling points?', answer: brandInfo.key_points?.join(', ') || '' },
            ]
          }
        }
      );

      if (keywordsError) {
        console.error('Keyword extraction error:', keywordsError);
        throw new Error(keywordsError.message || 'Keyword extraction failed');
      }

      const keywords = keywordsData?.keywords || [];
      
      // Generate keyword clusters immediately after extraction
      if (keywords.length > 0) {
        const { data: clusterData, error: clusterError } = await supabase.functions.invoke(
          'quick-setup-keyword-clustering',
          {
            body: {
              keywords: keywords,
              objective: sessionData.seo_objective || objectiveData?.objective
            }
          }
        );

        if (clusterError) {
          console.error('Clustering error:', clusterError);
          // Don't fail the entire flow if clustering fails
          updateSessionData({
            keywords: keywords,
            clusters: [],
            website_analysis_complete: true,
          });
        } else {
          const generatedClusters = clusterData?.clusters || [];
          updateSessionData({
            keywords: keywords,
            clusters: generatedClusters,
            website_analysis_complete: true,
          });
          updateAutomationStep(3, 'complete', `Found ${generatedClusters.length} keyword clusters`);
        }
      } else {
        updateSessionData({
          keywords: keywords,
          clusters: [],
          website_analysis_complete: true,
        });
      }
      
      updateAutomationStep(3, 'complete');

        setAutomationComplete(true);
        
        // Save analysis results to campaign - pass brand_id and user_id explicitly
        await saveAnalysisResultsToCampaign(finalBrandId, user?.id);
        
        break; // Success - exit retry loop
      } catch (error) {
        console.error(`Analysis error (attempt ${attempt}/${MAX_RETRIES}):`, error);
        lastError = error as Error;
        
        // Handle specific error types that shouldn't be retried
        if (error instanceof Error) {
          if (error.message.includes('PAYMENT_REQUIRED') || error.message.includes('402')) {
            toast.error('Your workspace is out of AI credits. Please add credits to continue.', {
              duration: 10000,
              action: {
                label: 'Add Credits',
                onClick: () => window.open('https://lovable.dev/settings/workspace/usage', '_blank')
              }
            });
            setIsAnalyzing(false);
            return; // Don't retry on payment issues
          }
        }
        
        // If this is not the last attempt, wait before retrying
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          continue;
        }
      }
    }

    // If we got here and lastError exists, all retries failed
    if (lastError) {
      let errorMessage = lastError instanceof Error ? lastError.message : 'Analysis failed';
      let errorStep = automationSteps.findIndex(s => s.status === 'loading');
      if (errorStep === -1) errorStep = 0;
      
      console.error('All retries failed:', lastError);
      
      // Extract more details from FunctionsHttpError
      if (lastError.name === 'FunctionsHttpError') {
        try {
          // @ts-ignore
          const statusCode = lastError.statusCode || lastError.status;
          // @ts-ignore
          const responseText = lastError.responseText || lastError.message;
          errorMessage = `API error (${statusCode}): ${responseText || 'Unknown error'}`;
        } catch (e) {
          console.log('Failed to extract error details:', e);
        }
      }
      
      toast.error(`Website analysis failed after ${MAX_RETRIES} attempts. ${errorMessage}`, {
        duration: 10000
      });
      
      updateAutomationStep(errorStep, 'error', `Failed after ${MAX_RETRIES} attempts: ${errorMessage}`);
    }
    
    setIsAnalyzing(false);
  };

  if (!automationComplete) {
    return (
      <>
        {/* Full-Screen Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <BaseLoadingSpinner size="lg" variant="primary" type="radar" />
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  Analyzing your website...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we gather insights about your website
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

        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {trialMode ? `Analyzing ${sessionData.brand_name || 'your website'}` : "Let's analyze your website"}
            </h2>
            <p className="text-muted-foreground">
              {trialMode 
                ? 'Sit back while we gather insights about your website' 
                : "Enter your website URL and we'll automatically gather all the information we need"
              }
            </p>
          </div>

          <div className="space-y-6">
            {!trialMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="brand-select">
                    Brand <span className="text-destructive">*</span>
                  </Label>
                  <BrandSelectorCombobox
                    value={localBrandId}
                    onValueChange={handleBrandChange}
                    userId={user?.id || ''}
                    disabled={isAnalyzing || !user}
                  />
                  <p className="text-xs text-muted-foreground">
                    Select an existing brand or create a new one
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website-url">
                    Website URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="website-url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      if (e.target.value) validateUrl(e.target.value);
                    }}
                    disabled={isAnalyzing}
                  />
                  {urlError && <p className="text-sm text-destructive">{urlError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-instructions">
                    Instructions <span className="text-xs text-muted-foreground">(Top priority for keyword extraction)</span>
                  </Label>
                  <textarea
                    id="custom-instructions"
                    placeholder="e.g., Focus on commercial keywords with high intent, target decision makers"
                    value={customInstructions}
                    onChange={(e) => {
                      setCustomInstructions(e.target.value);
                      updateSessionData({ custom_instructions: e.target.value });
                    }}
                    disabled={isAnalyzing}
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add specific instructions to guide keyword research and content generation
                  </p>
                </div>

                <Button
                  onClick={handleAnalyzeWebsite}
                  disabled={
                    !websiteUrl || 
                    !localBrandId || 
                    isAnalyzing || 
                    isFetchingBrandSettings
                  }
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Website'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
        <p className="text-muted-foreground">
          Review the information we gathered from your website
        </p>
      </div>

      <Tabs defaultValue="website" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="website">Website Information</TabsTrigger>
          <TabsTrigger value="keywords">Keywords Focus</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Brand Name</Label>
                <p className="font-medium">{sessionData.brand_name || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="text-sm">{sessionData.brand_description || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Target Audience</Label>
                <p className="text-sm">{sessionData.target_audience || '-'}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Key Selling Points</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {sessionData.key_selling_points?.map((point, idx) => (
                    <Badge key={idx} variant="secondary">{point}</Badge>
                  )) || '-'}
                </div>
              </div>

              {sessionData.seo_objective && (
                <div>
                  <Label className="text-sm text-muted-foreground">Objective</Label>
                  <p className="text-sm font-medium text-primary">{sessionData.seo_objective}</p>
                  {sessionData.focus_areas && sessionData.focus_areas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sessionData.focus_areas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Keywords Focus</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {sessionData.keywords && sessionData.keywords.length > 0 ? (
                    sessionData.keywords.map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="outline">{keyword}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No keywords found</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  We'll analyze these keywords and generate variants in the next step
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

                <TabsContent value="sitemap" className="mt-6">
                  <Card className="p-6">
                    <div className="space-y-4">
                      {/* Sitemap Metadata */}
                      {sessionData.sitemap_url && (
                        <div className="pb-4 border-b">
                          <Label className="text-sm text-muted-foreground">Sitemap URL</Label>
                          <a
                            href={sessionData.sitemap_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-2 mt-1"
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{sessionData.sitemap_url}</span>
                          </a>
                          {sessionData.total_sitemap_links && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Total links discovered: {sessionData.total_sitemap_links}
                            </p>
                          )}
                        </div>
                      )}

                      {/* URLs List */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-3 block">
                          Website URLs ({sessionData.sitemap_links?.length || 0} found)
                        </Label>
                        {sessionData.sitemap_links && sessionData.sitemap_links.length > 0 ? (
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {sessionData.sitemap_links.map((url: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors group">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-2 flex-1 truncate"
                                >
                                  <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                                  <span className="truncate">{url}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No sitemap URLs discovered</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              The website may not have a sitemap, or it couldn't be accessed.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </TabsContent>
      </Tabs>
    </div>
  );
};
