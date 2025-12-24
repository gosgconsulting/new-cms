import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '../LoadingOverlay';
import type { BrandAnalysis, AssetObjective } from '../CreateCampaignModal';

interface WebsiteAnalysisStepProps {
  brandId: string;
  userId: string;
  onAnalysisComplete: (analysis: BrandAnalysis, objective: AssetObjective) => void;
  brandAnalysis: BrandAnalysis | null;
  websiteUrl: string;
  onWebsiteUrlChange: (url: string) => void;
}

export const WebsiteAnalysisStep = ({
  brandId,
  userId,
  onAnalysisComplete,
  brandAnalysis,
  websiteUrl,
  onWebsiteUrlChange,
}: WebsiteAnalysisStepProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Removed auto-trigger to give users explicit control over when to analyze

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      toast({
        title: 'Website URL Required',
        description: 'Please enter a website URL to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('assets-website-analysis', {
        body: {
          websiteUrl,
          brandId,
          userId,
        },
      });

      if (error) throw error;

      if (data?.success && data?.brandAnalysis && data?.assetObjective) {
        const analysis: BrandAnalysis = data.brandAnalysis;
        const objective: AssetObjective = data.assetObjective;
        
        onAnalysisComplete(analysis, objective);
        
        toast({
          title: 'Analysis Complete',
          description: 'Website analyzed successfully',
        });
      } else {
        throw new Error('Invalid response from analysis');
      }
    } catch (error) {
      console.error('Website analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze website. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isVisible={isAnalyzing}
        icon={Globe}
        title="Analyzing Website"
        description={`Extracting brand information from ${websiteUrl}`}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Website Analysis</CardTitle>
          </div>
          <CardDescription>
            Enter your website URL to analyze your brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website-url">Website URL</Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => onWebsiteUrlChange(e.target.value)}
              disabled={isAnalyzing}
            />
            <p className="text-xs text-muted-foreground">
              We'll analyze your website to extract brand information
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!websiteUrl || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Website
              </>
            )}
          </Button>

          {brandAnalysis && (
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Analysis complete
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Brand information extracted from {websiteUrl}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
