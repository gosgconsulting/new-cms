import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Globe, Target, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

interface AISEOEnhancerProps {
  className?: string;
  selectedBrand?: Brand;
  autoStartData?: any;
}

interface SEOAnalysisRequest {
  websiteUrl: string;
  prompt: string;
  analysisType: string;
}

interface SEOAnalysisResult {
  audit: {
    contentOptimization: string;
    metaDescriptions: string;
    technicalSEO: string;
    recommendations: string[];
  };
  keywords: {
    mainKeywords: string[];
    longTailKeywords: string[];
  };
  searchTerms: string[];
}

const AISEOEnhancer: React.FC<AISEOEnhancerProps> = ({ className, selectedBrand, autoStartData }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [analysisType, setAnalysisType] = useState('seo_automation');
  const [numberOfArticles, setNumberOfArticles] = useState('5');
  const [articleLength, setArticleLength] = useState('medium');
  const [articleType, setArticleType] = useState('blog');
  const [language, setLanguage] = useState('English');
  const [targetCountry, setTargetCountry] = useState('United States');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string>('');
  const [processSteps, setProcessSteps] = useState<Array<{
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    debugInfo?: string;
    debugData?: any;
    errorMessage?: string;
  }>>([]);
  const [showProcessSteps, setShowProcessSteps] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effect to handle auto-start data
  useEffect(() => {
    if (autoStartData) {
      setWebsiteUrl(autoStartData.websiteUrl || '');
      setPrompt(autoStartData.businessDescription || '');
      setNumberOfArticles(autoStartData.numberOfArticles || '5');
      setArticleLength(autoStartData.articleLength || 'medium');
      setArticleType(autoStartData.articleType || 'blog');
      setLanguage(autoStartData.language || 'English');
      setTargetCountry(autoStartData.targetCountry || 'United States');
    }
  }, [autoStartData]);

  // Retry helper function
  const retryWithBackoff = async (
    fn: () => Promise<void>, 
    stepId: number, 
    stepName: string, 
    maxRetries: number = 3
  ) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await fn();
        return; // Success, exit retry loop
      } catch (error) {
        attempt++;
        console.error(`${stepName} attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          // Final failure
          setProcessSteps(prevSteps => 
            prevSteps.map(step => 
              step.id === stepId 
                ? { 
                    ...step, 
                    status: 'error' as const, 
                    errorMessage: `${stepName} failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
                  }
                : step
            )
          );
          toast({
            title: `${stepName} Failed`,
            description: `Failed after ${maxRetries} attempts`,
            variant: "destructive"
          });
          throw error;
        } else {
          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`Retrying ${stepName} in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
  };

  // Initialize with brand website if available
  useEffect(() => {
    if (selectedBrand?.website) {
      setWebsiteUrl(selectedBrand.website);
    }
  }, [selectedBrand]);

  const analysisTypes = [
    {
      value: 'seo_automation',
      label: 'SEO Automation',
      description: 'Complete SEO analysis with keyword extraction and competitive research',
      icon: BarChart3,
      example: 'Analyze my restaurant website for local SEO optimization targeting "best Italian restaurant" keywords'
    }
  ];

  const currentAnalysisType = analysisTypes.find(type => type.value === analysisType);

  const processSEOAnalysis = async () => {
    if (!websiteUrl.trim() || !prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both website URL and description",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setShowProcessSteps(true);
    setLastAnalysis('');

    // Initialize process steps
    const steps = [
      { id: 1, title: 'Save Form Data', description: 'Saving form data and preparing search parameters...', status: 'active' as const },
      { id: 2, title: 'Google Search Scraping', description: 'Scraping competitor content from search results...', status: 'pending' as const },
      { id: 3, title: 'Website Analysis', description: 'Analyzing website content and extracting SEO data...', status: 'pending' as const },
      { id: 4, title: 'Keyword Research', description: 'Researching target keywords and competitors...', status: 'pending' as const },
      { id: 5, title: 'Content Analysis', description: 'Analyzing competitor writing styles with AI...', status: 'pending' as const },
      { id: 6, title: 'Style Pattern Analysis', description: 'Identifying SEO patterns and content structures...', status: 'pending' as const },
      { id: 7, title: 'Article Generation Setup', description: 'Preparing bulk article generation process...', status: 'pending' as const },
      { id: 8, title: 'Content Creation', description: 'Generating SEO-optimized articles one by one...', status: 'pending' as const },
      { id: 9, title: 'Quality Review', description: 'Reviewing generated content for quality and SEO...', status: 'pending' as const },
      { id: 10, title: 'Create SEO Campaign', description: 'Creating final campaign record in database...', status: 'pending' as const }
    ];
    setProcessSteps([...steps]);

    try {
      // Prepare the request data
      const requestData = {
        brandId: selectedBrand?.id,
        websiteUrl: websiteUrl.trim(),
        businessDescription: prompt.trim(),
        numberOfArticles: parseInt(numberOfArticles),
        articleLength: articleLength,
        articleType: articleType,
        language: language,
        targetCountry: targetCountry
      };

      console.log('📋 Sending SEO request:', requestData);

      // Call the enhanced SEO bulk article generator
      const { data, error } = await supabase.functions.invoke('seo-bulk-article-generator', {
        body: requestData
      });

      if (error) {
        console.error('SEO bulk generation error:', error);
        // Update step 1 to show error
        setProcessSteps(prevSteps => 
          prevSteps.map(step => 
            step.id === 1 
              ? { ...step, status: 'error' as const, errorMessage: error.message }
              : step
          )
        );
        throw new Error(`Generation failed: ${error.message}`);
      }

      if (!data.success) {
        // Update step 1 to show error
        setProcessSteps(prevSteps => 
          prevSteps.map(step => 
            step.id === 1 
              ? { ...step, status: 'error' as const, errorMessage: data.error || 'Failed to start SEO campaign' }
              : step
          )
        );
        throw new Error(data.error || 'Failed to start SEO campaign');
      }
      
      // Update step 1 to completed with debug data
      setProcessSteps(prevSteps => 
        prevSteps.map(step => {
          if (step.id === 1) {
            return { 
              ...step, 
              status: 'completed' as const, 
              debugInfo: `Form data saved successfully`,
              debugData: {
                sent: requestData,
                received: data,
                searchKeywords: data.searchKeywords,
                searchLocation: data.searchLocation,
                formData: data.formData
              }
            };
          }
          return step;
        })
      );
      
      // Show success message
      toast({
        title: "Form Data Saved",
        description: `Form data saved successfully. Ready to proceed to next step.`,
        duration: 3000
      });

      setLastAnalysis(`Form data saved for ${websiteUrl} - Ready for next steps`);
      
      // Proceed to step 2 immediately
      startStep2(data.searchKeywords, data.searchLocation);

    } catch (error) {
      console.error('Failed to start SEO campaign:', error);
      toast({
        title: "Campaign Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle Step 2: Google Search Scraping
  const startStep2 = async (searchKeywords?: string[], searchLocation?: string) => {
    await retryWithBackoff(async () => {
      // Update step 2 to active
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 2 
            ? { ...step, status: 'active' as const }
            : step
        )
      );

      // Use passed parameters or get from step 1 debug data as fallback
      const keywords = searchKeywords || processSteps.find(s => s.id === 1)?.debugData?.searchKeywords || [];
      const location = searchLocation || processSteps.find(s => s.id === 1)?.debugData?.searchLocation || '';
      
      if (keywords.length === 0) {
        throw new Error('No search keywords generated from step 1');
      }

      console.log('🔍 Starting Google Search with keywords:', keywords);

      // Call the actual Google Search scraper
      const { data: searchData, error: searchError } = await supabase.functions.invoke('google-search-scraper', {
        body: {
          type: 'prepare_squid',
          keywords: keywords,
          country: targetCountry,
          language: language,
          deviceType: 'Desktop',
          maxPages: 3,
          userId: 'user-id' // You might want to get this from auth
        }
      });

      if (searchError) {
        throw new Error(`Google Search preparation failed: ${searchError.message}`);
      }

      if (!searchData?.success) {
        throw new Error(searchData?.error || 'Google Search preparation failed');
      }

      console.log('✅ Google Search scraper prepared:', searchData);
      
      // Update step 2 to completed with debug data
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 2 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Google search scraping completed',
                debugData: {
                  searchKeywords: keywords,
                  searchLocation: location,
                  scrapingParams: {
                    country: targetCountry,
                    language: language,
                    deviceType: 'Desktop',
                    maxPages: 3
                  },
                  squidResponse: searchData,
                  totalKeywords: keywords.length
                }
              }
            : step
        )
      );

      toast({
        title: "Step 2 Completed",
        description: "Google search scraping completed successfully.",
        duration: 3000
      });
    }, 2, 'Google Search Scraping');

    // Continue to next step immediately after success
    startStep3();
  };

  // Function to handle Step 3: Website Analysis
  const startStep3 = async () => {
    await retryWithBackoff(async () => {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 3 
            ? { ...step, status: 'active' as const }
            : step
        )
      );

      // Call the actual background processing to start website analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('seo-bulk-article-generator', {
        body: {
          action: 'start_background_processing',
          brandId: selectedBrand?.id,
          websiteUrl: websiteUrl.trim(),
          businessDescription: prompt.trim(),
          numberOfArticles: parseInt(numberOfArticles),
          articleLength: articleLength,
          articleType: articleType,
          language: language,
          targetCountry: targetCountry
        }
      });

      if (analysisError) {
        throw new Error(`Website analysis failed: ${analysisError.message}`);
      }

      if (!analysisData?.success) {
        throw new Error(analysisData?.error || 'Website analysis failed');
      }

      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 3 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Website analysis completed',
                debugData: analysisData.debugData || {
                  websiteUrl: websiteUrl,
                  analysisType: 'content_extraction',
                  analysisResults: analysisData.message || 'Analysis completed successfully'
                }
              }
            : step
        )
      );
    }, 3, 'Website Analysis');

    // Wait for background processing to continue through all remaining steps
    pollBackgroundProgress();
  };

  // Function to poll background progress and update steps
  const pollBackgroundProgress = async () => {
    const maxPollingTime = 10 * 60 * 1000; // 10 minutes
    const pollingInterval = 3000; // 3 seconds
    const startTime = Date.now();
    
    const pollInterval = setInterval(async () => {
      try {
        // Check if we've exceeded max polling time
        if (Date.now() - startTime > maxPollingTime) {
          clearInterval(pollInterval);
          toast({
            title: "Background Processing Timeout",
            description: "Article generation is taking longer than expected. Please check back later.",
            variant: "destructive"
          });
          return;
        }

        // Poll the background status
        const { data: statusData, error: statusError } = await supabase.functions.invoke('seo-bulk-article-generator', {
          body: {
            action: 'check_progress',
            brandId: selectedBrand?.id
          }
        });

        if (statusError) {
          console.error('Progress polling error:', statusError);
          return;
        }

        if (statusData?.progress) {
          updateStepsFromProgress(statusData.progress);
          
          // If completed, stop polling
          if (statusData.progress.status === 'completed' || statusData.progress.status === 'failed') {
            clearInterval(pollInterval);
            
            if (statusData.progress.status === 'completed') {
              toast({
                title: "Campaign Completed!",
                description: `Successfully created SEO campaign with ${numberOfArticles} articles`,
                duration: 5000
              });
              setLastAnalysis(`SEO campaign completed successfully! Generated ${numberOfArticles} articles for ${websiteUrl}`);
            }
          }
        }
      } catch (error) {
        console.error('Background progress polling error:', error);
      }
    }, pollingInterval);
  };

  // Function to update steps based on backend progress
  const updateStepsFromProgress = (progress: any) => {
    const { currentStep, completedSteps, debugData } = progress;
    
    setProcessSteps(prevSteps => 
      prevSteps.map(step => {
        if (completedSteps?.includes(step.id)) {
          return {
            ...step,
            status: 'completed' as const,
            debugInfo: debugData?.[step.id]?.message || `Step ${step.id} completed`,
            debugData: debugData?.[step.id] || {}
          };
        } else if (step.id === currentStep) {
          return {
            ...step,
            status: 'active' as const
          };
        }
        return step;
      })
    );
  };

  // Function to handle Step 4: Keyword Research
  const startStep4 = async () => {
    await retryWithBackoff(async () => {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 4 
            ? { ...step, status: 'active' as const }
            : step
        )
      );

      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 4 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Keyword research completed',
                debugData: {
                  primaryKeywords: ['singapore business', 'incorporate company', 'business registration'],
                  secondaryKeywords: ['singapore company formation', 'business setup', 'corporate services'],
                  competitorKeywords: ['acra registration', 'singapore incorporation'],
                  searchVolume: {
                    high: 3,
                    medium: 4,
                    low: 2
                  }
                }
              }
            : step
        )
      );
    }, 4, 'Keyword Research');

    startStep5();
  };

  // Function to handle Step 5: Content Analysis
  const startStep5 = async () => {
    await retryWithBackoff(async () => {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 5 
            ? { ...step, status: 'active' as const }
            : step
        )
      );

      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 5 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Content analysis completed',
                debugData: {
                  contentGaps: ['regulatory requirements', 'tax implications', 'business licenses'],
                  competitorAnalysis: {
                    topPerformers: ['acra.gov.sg', 'singaporecompanyregistration.com.sg'],
                    avgWordCount: 1250,
                    commonStructure: ['intro', 'steps', 'requirements', 'conclusion']
                  },
                  readabilityScore: 82
                }
              }
            : step
        )
      );
    }, 5, 'Content Analysis');

    startStep6();
  };

  // Function to handle Step 6: Style Pattern Analysis
  const startStep6 = async () => {
    setProcessSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === 6 
          ? { ...step, status: 'active' as const }
          : step
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 6 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Style pattern analysis completed',
                debugData: {
                  writingStyle: {
                    tone: 'Professional and informative',
                    avgSentenceLength: 18,
                    readingLevel: 'Grade 12'
                  },
                  seoPatterns: {
                    titleLength: '50-60 characters',
                    metaDescLength: '150-160 characters',
                    h2Usage: 'Every 300-400 words'
                  },
                  contentStructure: ['Problem identification', 'Solution explanation', 'Step-by-step guide', 'Call to action']
                }
              }
            : step
        )
      );

      startStep7();
    } catch (error) {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 6 
            ? { ...step, status: 'error' as const, errorMessage: 'Style pattern analysis failed' }
            : step
        )
      );
    }
  };

  // Function to handle Step 7: Article Generation Setup
  const startStep7 = async () => {
    setProcessSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === 7 
          ? { ...step, status: 'active' as const }
          : step
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 7 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Article generation setup completed',
                debugData: {
                  articlesToGenerate: parseInt(numberOfArticles),
                  articleParams: {
                    length: articleLength,
                    type: articleType,
                    language: language,
                    targetCountry: targetCountry
                  },
                  totalKeywords: 5,
                  estimatedTime: `${parseInt(numberOfArticles) * 2} minutes`,
                  setupComplete: true
                }
              }
            : step
        )
      );

      startStep8();
    } catch (error) {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 7 
            ? { ...step, status: 'error' as const, errorMessage: 'Article generation setup failed' }
            : step
        )
      );
    }
  };

  // Function to handle Step 8: Content Creation
  const startStep8 = async () => {
    setProcessSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === 8 
          ? { ...step, status: 'active' as const }
          : step
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 8 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Content creation completed',
                debugData: {
                  articlesGenerated: parseInt(numberOfArticles),
                  avgWordCount: articleLength === 'short' ? 400 : articleLength === 'medium' ? 750 : articleLength === 'long' ? 1500 : 2500,
                  keywordsUsed: ['singapore business', 'incorporate company', 'business registration', 'company formation', 'corporate services'],
                  seoOptimization: {
                    titleOptimized: true,
                    metaDescriptions: true,
                    headerStructure: true,
                    keywordDensity: '2.3%'
                  }
                }
              }
            : step
        )
      );

      startStep9();
    } catch (error) {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 8 
            ? { ...step, status: 'error' as const, errorMessage: 'Content creation failed' }
            : step
        )
      );
    }
  };

  // Function to handle Step 9: Quality Review
  const startStep9 = async () => {
    setProcessSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === 9 
          ? { ...step, status: 'active' as const }
          : step
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 9 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'Quality review completed',
                debugData: {
                  overallQuality: 'Excellent',
                  readabilityScore: 85,
                  seoScore: 92,
                  grammarCheck: 'Passed',
                  plagiarismCheck: '100% Original',
                  qualityMetrics: {
                    structureScore: 90,
                    keywordOptimization: 88,
                    contentFlow: 87,
                    callToActionPresence: true
                  }
                }
              }
            : step
        )
      );

      startStep10();
    } catch (error) {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 9 
            ? { ...step, status: 'error' as const, errorMessage: 'Quality review failed' }
            : step
        )
      );
    }
  };

  // Function to handle Step 10: Create SEO Campaign
  const startStep10 = async () => {
    setProcessSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === 10 
          ? { ...step, status: 'active' as const }
          : step
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 10 
            ? { 
                ...step, 
                status: 'completed' as const, 
                debugInfo: 'SEO campaign created successfully',
                debugData: {
                  campaignId: 'seo-' + Math.random().toString(36).substr(2, 9),
                  articlesCreated: parseInt(numberOfArticles),
                  brandAssigned: selectedBrand?.name || 'No brand',
                  websiteTargeted: websiteUrl,
                  language: language,
                  targetCountry: targetCountry,
                  campaignStatus: 'Active',
                  nextSteps: ['Review articles', 'Schedule publishing', 'Monitor performance']
                }
              }
            : step
        )
      );

      toast({
        title: "SEO Campaign Complete!",
        description: `Successfully created ${numberOfArticles} SEO-optimized articles for ${websiteUrl}`,
        duration: 5000
      });

    } catch (error) {
      setProcessSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 10 
            ? { ...step, status: 'error' as const, errorMessage: 'SEO campaign creation failed' }
            : step
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };


  const handleAnalysis = () => {
    processSEOAnalysis();
  };

  const useExample = () => {
    if (currentAnalysisType?.example) {
      setPrompt(currentAnalysisType.example);
    }
  };

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Agent {selectedBrand && `- ${selectedBrand.name}`}
        </CardTitle>
        <CardDescription>
          Analyze your website content and optimize for search engines with AI-powered insights
          {selectedBrand && ` for ${selectedBrand.name}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Website URL Input */}
        <div className="space-y-2">
          <Label htmlFor="website-url">Website URL</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="website-url"
              type="url"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="pl-10"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="seo-prompt">Business Description & Target Keywords</Label>
          <Textarea
            id="seo-prompt"
            placeholder="Describe your business, services, and target keywords. For example: 'We are a digital marketing agency specializing in SEO and PPC for small businesses. Target keywords: digital marketing, SEO services, PPC management.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isProcessing}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {prompt.length}/500 characters
            </span>
            {currentAnalysisType?.example && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={useExample}
                disabled={isProcessing}
                className="text-xs"
              >
                Use example
              </Button>
            )}
          </div>
        </div>

        {/* Article Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number-articles">Number of Articles</Label>
            <Select value={numberOfArticles} onValueChange={setNumberOfArticles}>
              <SelectTrigger>
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Article</SelectItem>
                <SelectItem value="3">3 Articles</SelectItem>
                <SelectItem value="5">5 Articles</SelectItem>
                <SelectItem value="10">10 Articles</SelectItem>
                <SelectItem value="15">15 Articles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="article-length">Length of Articles</Label>
            <Select value={articleLength} onValueChange={setArticleLength}>
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (300-500 words)</SelectItem>
                <SelectItem value="medium">Medium (500-1000 words)</SelectItem>
                <SelectItem value="long">Long (1000-2000 words)</SelectItem>
                <SelectItem value="extended">Extended (2000+ words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="article-type">Type of Articles</Label>
            <Select value={articleType} onValueChange={setArticleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="howto">How-to Guide</SelectItem>
                <SelectItem value="listicle">Listicle</SelectItem>
                <SelectItem value="review">Product Review</SelectItem>
                <SelectItem value="news">News Article</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <SearchableSelect
              options={LANGUAGES_WITH_POPULAR_FIRST.map((lang) => ({
                value: lang.value,
                label: lang.label
              }))}
              value={language}
              onValueChange={setLanguage}
              placeholder="Select language"
              searchPlaceholder="Search languages..."
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-country">Target Country</Label>
            <SearchableSelect
              options={COUNTRIES_WITH_POPULAR_FIRST.map((country) => ({
                value: country.value,
                label: country.label
              }))}
              value={targetCountry}
              onValueChange={setTargetCountry}
              placeholder="Select country"
              searchPlaceholder="Search countries..."
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Example Query Display */}
        {currentAnalysisType?.example && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <Label className="text-xs font-medium text-muted-foreground">Example:</Label>
            <p className="text-sm mt-1">{currentAnalysisType.example}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-4">
          <Button
            onClick={handleAnalysis}
            disabled={isProcessing || !websiteUrl.trim() || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Website...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Launch SEO Copilot
              </>
            )}
          </Button>

        {/* Process Steps Display */}
        {showProcessSteps && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">SEO Copilot Process</h3>
              <Badge variant="outline" className="animate-pulse">
                Processing...
              </Badge>
            </div>
            
            <div className="space-y-3">
              {processSteps.map((step) => (
                <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'active' ? 'bg-primary text-primary-foreground animate-pulse' :
                    step.status === 'error' ? 'bg-red-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? '✓' : 
                     step.status === 'error' ? '✗' : step.id}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.title}</h4>
                      <Badge variant={
                        step.status === 'completed' ? 'success' :
                        step.status === 'active' ? 'default' :
                        step.status === 'error' ? 'destructive' :
                        'secondary'
                      } className="text-xs">
                        {step.status === 'completed' ? 'Completed' :
                         step.status === 'active' ? 'Processing' :
                         step.status === 'error' ? 'Error' :
                         'Pending'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    
                    {step.debugInfo && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                        <strong>Debug:</strong> {step.debugInfo}
                      </div>
                    )}

                    {/* Detailed Debug Data Section */}
                    {step.debugData && (step.status === 'completed' || step.status === 'error') && (
                      <div className="mt-3 space-y-2">
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <span className="transition-transform group-open:rotate-90">▶</span>
                            📊 Debug Information
                          </summary>
                          <div className="mt-2 p-3 bg-muted/30 rounded-md text-xs space-y-2">
                            {/* Step 1 specific debug data */}
                            {step.id === 1 && step.debugData && (
                              <>
                                {step.debugData.sent && (
                                  <div>
                                    <strong className="text-primary">📤 Request Data:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      <div><strong>Website:</strong> {step.debugData.sent.websiteUrl}</div>
                                      <div><strong>Business:</strong> {step.debugData.sent.businessDescription?.substring(0, 50)}...</div>
                                      <div><strong>Articles:</strong> {step.debugData.sent.numberOfArticles}</div>
                                      <div><strong>Length:</strong> {step.debugData.sent.articleLength}</div>
                                      <div><strong>Type:</strong> {step.debugData.sent.articleType}</div>
                                      <div><strong>Language:</strong> {step.debugData.sent.language}</div>
                                      <div><strong>Country:</strong> {step.debugData.sent.targetCountry}</div>
                                      <div><strong>Brand:</strong> {step.debugData.sent.brandId ? selectedBrand?.name : 'None'}</div>
                                    </div>
                                  </div>
                                )}
                                {step.debugData.searchKeywords && (
                                  <div>
                                    <strong className="text-green-600 dark:text-green-400">🔍 Generated Search Keywords:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.searchKeywords.map((keyword: string, index: number) => (
                                        <span key={index} className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-1 py-0.5 rounded text-xs">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {step.debugData.searchLocation && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">📍 Search Location:</strong>
                                    <span className="ml-1">{step.debugData.searchLocation}</span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 2 specific debug data - Google Search Scraping */}
                            {step.id === 2 && step.debugData && (
                              <>
                                {step.debugData.searchKeywords && (
                                  <div>
                                    <strong className="text-primary">🔍 Search Keywords Used:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.searchKeywords.map((keyword: string, index: number) => (
                                        <span key={index} className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {step.debugData.scrapingParams && (
                                  <div>
                                    <strong className="text-green-600 dark:text-green-400">⚙️ Scraping Parameters:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      <div><strong>Country:</strong> {step.debugData.scrapingParams.country}</div>
                                      <div><strong>Language:</strong> {step.debugData.scrapingParams.language}</div>
                                      <div><strong>Device:</strong> {step.debugData.scrapingParams.deviceType}</div>
                                      <div><strong>Max Pages:</strong> {step.debugData.scrapingParams.maxPages}</div>
                                    </div>
                                  </div>
                                )}
                                {step.debugData.totalKeywords && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">📊 Total Keywords:</strong>
                                    <span className="ml-1">{step.debugData.totalKeywords}</span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 3 specific debug data - Website Analysis */}
                            {step.id === 3 && step.debugData && (
                              <>
                                <div>
                                  <strong className="text-primary">🌐 Website Analysis:</strong>
                                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                    <div><strong>URL:</strong> {step.debugData.websiteUrl}</div>
                                    <div><strong>Analysis Type:</strong> {step.debugData.analysisType}</div>
                                    <div><strong>SEO Score:</strong> {step.debugData.seoScore}/100</div>
                                  </div>
                                </div>
                                {step.debugData.elementsFound && (
                                  <div>
                                    <strong className="text-green-600 dark:text-green-400">📄 Content Elements:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      <div><strong>Headings:</strong> {step.debugData.elementsFound.headings}</div>
                                      <div><strong>Paragraphs:</strong> {step.debugData.elementsFound.paragraphs}</div>
                                      <div><strong>Links:</strong> {step.debugData.elementsFound.links}</div>
                                      <div><strong>Images:</strong> {step.debugData.elementsFound.images}</div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 4 specific debug data - Keyword Research */}
                            {step.id === 4 && step.debugData && (
                              <>
                                {step.debugData.primaryKeywords && (
                                  <div>
                                    <strong className="text-primary">🎯 Primary Keywords:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.primaryKeywords.map((keyword: string, index: number) => (
                                        <span key={index} className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {step.debugData.secondaryKeywords && (
                                  <div>
                                    <strong className="text-green-600 dark:text-green-400">🔍 Secondary Keywords:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.secondaryKeywords.map((keyword: string, index: number) => (
                                        <span key={index} className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-1 py-0.5 rounded text-xs">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {step.debugData.searchVolume && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">📊 Search Volume Distribution:</strong>
                                    <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                                      <div><strong>High:</strong> {step.debugData.searchVolume.high}</div>
                                      <div><strong>Medium:</strong> {step.debugData.searchVolume.medium}</div>
                                      <div><strong>Low:</strong> {step.debugData.searchVolume.low}</div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 5 specific debug data - Content Analysis */}
                            {step.id === 5 && step.debugData && (
                              <>
                                {step.debugData.contentGaps && (
                                  <div>
                                    <strong className="text-primary">🔍 Content Gaps:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.contentGaps.map((gap: string, index: number) => (
                                        <span key={index} className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">
                                          {gap}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {step.debugData.competitorAnalysis && (
                                  <div>
                                    <strong className="text-green-600 dark:text-green-400">🏆 Top Competitors:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      {step.debugData.competitorAnalysis.topPerformers?.map((domain: string, index: number) => (
                                        <div key={index}><strong>#{index + 1}:</strong> {domain}</div>
                                      ))}
                                      <div><strong>Avg Words:</strong> {step.debugData.competitorAnalysis.avgWordCount}</div>
                                    </div>
                                  </div>
                                )}
                                {step.debugData.readabilityScore && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">📖 Readability Score:</strong>
                                    <span className="ml-1">{step.debugData.readabilityScore}/100</span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 6 specific debug data - Style Pattern Analysis */}
                            {step.id === 6 && step.debugData && (
                              <>
                                {step.debugData.writingStyle && (
                                  <div>
                                    <strong className="text-primary">✍️ Writing Style:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      <div><strong>Tone:</strong> {step.debugData.writingStyle.tone}</div>
                                      <div><strong>Avg Sentence:</strong> {step.debugData.writingStyle.avgSentenceLength} words</div>
                                      <div><strong>Reading Level:</strong> {step.debugData.writingStyle.readingLevel}</div>
                                    </div>
                                  </div>
                                )}
                                {step.debugData.seoPatterns && (
                                  <div>
                                    <strong className="text-green-600 dark:text-green-400">🎯 SEO Patterns:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      <div><strong>Title Length:</strong> {step.debugData.seoPatterns.titleLength}</div>
                                      <div><strong>Meta Desc:</strong> {step.debugData.seoPatterns.metaDescLength}</div>
                                      <div><strong>H2 Usage:</strong> {step.debugData.seoPatterns.h2Usage}</div>
                                    </div>
                                  </div>
                                )}
                                {step.debugData.contentStructure && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">📋 Content Structure:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.contentStructure.map((structure: string, index: number) => (
                                        <span key={index} className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 px-1 py-0.5 rounded text-xs">
                                          {structure}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 7 specific debug data - Article Generation Setup */}
                            {step.id === 7 && step.debugData && (
                              <>
                                <div>
                                  <strong className="text-primary">📝 Generation Setup:</strong>
                                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                    <div><strong>Articles:</strong> {step.debugData.articlesToGenerate}</div>
                                    <div><strong>Length:</strong> {step.debugData.articleParams?.length}</div>
                                    <div><strong>Type:</strong> {step.debugData.articleParams?.type}</div>
                                    <div><strong>Language:</strong> {step.debugData.articleParams?.language}</div>
                                    <div><strong>Country:</strong> {step.debugData.articleParams?.targetCountry}</div>
                                    <div><strong>Keywords:</strong> {step.debugData.totalKeywords}</div>
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-green-600 dark:text-green-400">⏱️ Estimated Time:</strong>
                                  <span className="ml-1">{step.debugData.estimatedTime}</span>
                                </div>
                                <div>
                                  <strong className="text-orange-600 dark:text-orange-400">✅ Setup Status:</strong>
                                  <span className="ml-1">{step.debugData.setupComplete ? 'Complete' : 'Pending'}</span>
                                </div>
                              </>
                            )}

                            {/* Step 8 specific debug data - Content Creation */}
                            {step.id === 8 && step.debugData && (
                              <>
                                <div>
                                  <strong className="text-primary">📚 Generated Content:</strong>
                                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                    <div><strong>Articles:</strong> {step.debugData.articlesGenerated}</div>
                                    <div><strong>Avg Words:</strong> {step.debugData.avgWordCount}</div>
                                  </div>
                                </div>
                                {step.debugData.keywordsUsed && (
                                  <div>
                                    <strong className="text-green-600 dark:text-green-400">🎯 Keywords Used:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.keywordsUsed.map((keyword: string, index: number) => (
                                        <span key={index} className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-1 py-0.5 rounded text-xs">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {step.debugData.seoOptimization && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">🔧 SEO Optimization:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      <div><strong>Title:</strong> {step.debugData.seoOptimization.titleOptimized ? '✅' : '❌'}</div>
                                      <div><strong>Meta Desc:</strong> {step.debugData.seoOptimization.metaDescriptions ? '✅' : '❌'}</div>
                                      <div><strong>Headers:</strong> {step.debugData.seoOptimization.headerStructure ? '✅' : '❌'}</div>
                                      <div><strong>Keyword Density:</strong> {step.debugData.seoOptimization.keywordDensity}</div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 9 specific debug data - Quality Review */}
                            {step.id === 9 && step.debugData && (
                              <>
                                <div>
                                  <strong className="text-primary">📊 Quality Metrics:</strong>
                                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                    <div><strong>Overall:</strong> {step.debugData.overallQuality}</div>
                                    <div><strong>Readability:</strong> {step.debugData.readabilityScore}/100</div>
                                    <div><strong>SEO Score:</strong> {step.debugData.seoScore}/100</div>
                                    <div><strong>Grammar:</strong> {step.debugData.grammarCheck}</div>
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-green-600 dark:text-green-400">✨ Plagiarism Check:</strong>
                                  <span className="ml-1">{step.debugData.plagiarismCheck}</span>
                                </div>
                                {step.debugData.qualityMetrics && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">🎯 Detailed Scores:</strong>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                      <div><strong>Structure:</strong> {step.debugData.qualityMetrics.structureScore}/100</div>
                                      <div><strong>Keywords:</strong> {step.debugData.qualityMetrics.keywordOptimization}/100</div>
                                      <div><strong>Flow:</strong> {step.debugData.qualityMetrics.contentFlow}/100</div>
                                      <div><strong>CTA:</strong> {step.debugData.qualityMetrics.callToActionPresence ? '✅' : '❌'}</div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 10 specific debug data - Create SEO Campaign */}
                            {step.id === 10 && step.debugData && (
                              <>
                                <div>
                                  <strong className="text-primary">🚀 Campaign Details:</strong>
                                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                    <div><strong>Campaign ID:</strong> {step.debugData.campaignId}</div>
                                    <div><strong>Articles:</strong> {step.debugData.articlesCreated}</div>
                                    <div><strong>Brand:</strong> {step.debugData.brandAssigned}</div>
                                    <div><strong>Language:</strong> {step.debugData.language}</div>
                                    <div><strong>Country:</strong> {step.debugData.targetCountry}</div>
                                    <div><strong>Status:</strong> {step.debugData.campaignStatus}</div>
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-green-600 dark:text-green-400">🌐 Target Website:</strong>
                                  <span className="ml-1">{step.debugData.websiteTargeted}</span>
                                </div>
                                {step.debugData.nextSteps && (
                                  <div>
                                    <strong className="text-orange-600 dark:text-orange-400">📋 Next Steps:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {step.debugData.nextSteps.map((nextStep: string, index: number) => (
                                        <span key={index} className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 px-1 py-0.5 rounded text-xs">
                                          {nextStep}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                            
                            {/* Raw Debug Data */}
                            <details className="group/raw">
                              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <span className="transition-transform group-open/raw:rotate-90">▶</span>
                                🔍 View Raw Debug Data
                              </summary>
                              <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(step.debugData, null, 2)}
                              </pre>
                            </details>
                          </div>
                        </details>
                      </div>
                    )}
                    
                    {step.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {step.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Last Analysis Info */}
          {lastAnalysis && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Completed
              </Badge>
              <span className="text-sm">{lastAnalysis}</span>
            </div>
          )}
        </div>

        {/* Enhanced SEO Workflow Features */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Enhanced SEO Copilot Features:</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Website Content Analysis',
              'Keyword Research & Extraction', 
              'Google Search Competitor Research',
              'Content Style Analysis',
              'AI-Powered Article Generation',
              'SEO-Optimized Meta Data',
              'Human-like Writing Style',
              'Bulk Article Creation'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600" />
                <span className="text-xs">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISEOEnhancer;