import { Card, CardContent } from '@/components/ui/card';
import { Building2, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { useCopilot } from '@/contexts/CopilotContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

export const Step0DataSource = () => {
  const { updateSessionData, nextStep, goToStep, sessionData } = useQuickSetup();
  const { selectedBrand } = useCopilot();
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  const handleAnalyzeUrl = () => {
    updateSessionData({ 
      data_source: 'url',
      // Reset any brand data
      brand_name: undefined,
      brand_description: undefined,
      target_audience: undefined,
      key_selling_points: undefined
    });
    nextStep();
  };

  const handleUseBrandInfo = async () => {
    if (!selectedBrand) {
      toast.error('No brand selected');
      return;
    }

    setIsLoadingKeywords(true);

    try {
      // Pre-fill brand information into session
      updateSessionData({
        data_source: 'brand',
        website_url: selectedBrand.website || '',
        brand_name: selectedBrand.name,
        brand_description: selectedBrand.description || '',
        target_audience: selectedBrand.target_audience || '',
        key_selling_points: (selectedBrand as any).key_selling_points || [],
        website_analysis_complete: true,
      });

      // Load brand settings for country/language
      const { data: settingsData } = await supabase
        .from('content_settings')
        .select('target_country, content_language')
        .eq('brand_id', selectedBrand.id)
        .single();

      const country = settingsData?.target_country || sessionData.country || 'United States';
      const language = settingsData?.content_language || sessionData.language || 'English';

      // Generate keywords from brand information
      
      const { data: keywordsData, error: keywordsError } = await supabase.functions.invoke(
        'quick-setup-keyword-extraction',
        {
          body: {
            websiteUrl: selectedBrand.website || '',
            country,
            language,
            customInstructions: sessionData.custom_instructions || null,
            aiQuestionsAnswers: [
              { question: 'What is your brand name?', answer: selectedBrand.name },
              { question: 'Describe your business', answer: selectedBrand.description || '' },
              { question: 'Who is your target audience?', answer: selectedBrand.target_audience || '' },
            ]
          }
        }
      );

      if (keywordsError) {
        throw new Error(keywordsError.message || 'Failed to extract keywords');
      }

      const keywords = keywordsData?.keywords || [];
      
      if (keywords.length === 0) {
        toast.error('No keywords found. Please add more details to your brand or try analyzing a website URL.');
        setIsLoadingKeywords(false);
        return;
      }

      // Generate keyword clusters
      
      const { data: clusterData, error: clusterError } = await supabase.functions.invoke(
        'quick-setup-keyword-clustering',
        {
          body: {
            keywords: keywords,
            objective: `Create content for ${selectedBrand.name}`
          }
        }
      );

      if (clusterError) {
        throw new Error(clusterError.message || 'Failed to generate clusters');
      }

      const clusters = clusterData?.clusters || [];

      // Update session with keywords and clusters
      updateSessionData({
        keywords,
        clusters,
        country,
        language,
      });

      // Navigate to Step 2 (keyword clusters)
      goToStep(2);
    } catch (error: any) {
      console.error('Error generating keywords from brand:', error);
      toast.error(error.message || 'Failed to generate keywords. Please try again.');
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Data Source</h2>
        <p className="text-muted-foreground">
          How would you like to start your campaign setup?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Analyze New URL Option */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={handleAnalyzeUrl}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Analyze Website URL</h3>
              <p className="text-sm text-muted-foreground">
                Enter a website URL to automatically extract brand details, keywords, and content information
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                disabled={isLoadingKeywords}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Use Brand Information Option */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={!isLoadingKeywords ? handleUseBrandInfo : undefined}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Building2 className="h-8 w-8 text-accent" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Use Brand Information</h3>
              <p className="text-sm text-muted-foreground">
                Skip website analysis and use your existing brand information: <strong>{selectedBrand?.name}</strong>
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Button 
                variant="outline"
                className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                disabled={isLoadingKeywords}
              >
                {isLoadingKeywords ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoadingKeywords && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <div>
              <h3 className="font-semibold mb-2">Analyzing Brand Keywords</h3>
              <p className="text-sm text-muted-foreground">
                Extracting keywords and creating clusters from your brand information...
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>
          💡 <strong>Tip:</strong> Choose "Use Brand Information" to skip directly to keyword research if your brand details are already configured.
        </p>
      </div>
    </div>
  );
};
