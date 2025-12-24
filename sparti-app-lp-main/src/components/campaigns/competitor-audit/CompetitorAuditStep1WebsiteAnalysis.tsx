import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Globe } from 'lucide-react';
import { useCompetitorAudit } from '@/contexts/CompetitorAuditContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CompetitorAuditStep1WebsiteAnalysis = () => {
  const { sessionData, updateSessionData } = useCompetitorAudit();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!sessionData.website_url) {
      toast({
        title: 'Error',
        description: 'Please enter a website URL',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('quick-setup-website-analysis', {
        body: {
          websiteUrl: sessionData.website_url,
          extractStructured: true,
          customInstructions: sessionData.custom_instructions || '',
        },
      });

      if (error) throw error;

      if (data.success && data.data) {
        updateSessionData({
          website_analysis: data.data,
          website_analysis_complete: true,
          brand_name: data.data.brand_name || sessionData.brand_name,
          business_description: data.data.brand_description,
          keywords: data.data.suggested_keywords || [],
        });

        toast({
          title: 'Analysis Complete',
          description: 'Website analysis completed successfully',
        });
      }
    } catch (error) {
      console.error('Error analyzing website:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze website',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Analyze Competitor Website
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter your competitor's website URL to analyze their content and extract keywords
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="website-url">Website URL *</Label>
          <Input
            id="website-url"
            placeholder="https://competitor.com"
            value={sessionData.website_url}
            onChange={(e) => updateSessionData({ website_url: e.target.value })}
            disabled={analyzing}
          />
        </div>

        <div>
          <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
          <Textarea
            id="custom-instructions"
            placeholder="Add any specific instructions for the analysis..."
            value={sessionData.custom_instructions || ''}
            onChange={(e) => updateSessionData({ custom_instructions: e.target.value })}
            disabled={analyzing}
            rows={4}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!sessionData.website_url || analyzing}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Website'
          )}
        </Button>

        {sessionData.website_analysis_complete && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Analysis Complete</h4>
            {sessionData.business_description && (
              <p className="text-sm text-muted-foreground">{sessionData.business_description}</p>
            )}
            {sessionData.keywords && sessionData.keywords.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Extracted Keywords:</p>
                <p className="text-xs text-muted-foreground">{sessionData.keywords.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorAuditStep1WebsiteAnalysis;
