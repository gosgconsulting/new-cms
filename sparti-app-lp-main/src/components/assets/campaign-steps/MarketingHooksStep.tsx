import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingOverlay } from '../LoadingOverlay';
import type { BrandAnalysis, AssetObjective, MarketingHook } from '../CreateCampaignModal';

interface MarketingHooksStepProps {
  brandId: string;
  brandAnalysis: BrandAnalysis;
  assetObjective: AssetObjective;
  useBrandInfo: boolean;
  marketingHooks: MarketingHook[];
  selectedHooks: MarketingHook[];
  onHooksGenerated: (hooks: MarketingHook[]) => void;
  onHooksSelected: (hooks: MarketingHook[]) => void;
}

export const MarketingHooksStep = ({
  brandId,
  brandAnalysis,
  assetObjective,
  useBrandInfo,
  marketingHooks,
  selectedHooks,
  onHooksGenerated,
  onHooksSelected,
}: MarketingHooksStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandData, setBrandData] = useState<any>(null);
  const { toast } = useToast();

  // Fetch brand data
  useEffect(() => {
    const fetchBrandData = async () => {
      if (!brandId || !useBrandInfo) return;

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (!error && data) {
        setBrandData(data);
      }
    };

    fetchBrandData();
  }, [brandId, useBrandInfo]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Build brand context only if useBrandInfo is true and we have brand data
      const brandContext = useBrandInfo && brandData 
        ? `Brand Name: ${brandData.name}
Brand Description: ${brandData.description || 'Not specified'}
Industry: ${brandData.industry || 'Not specified'}
Target Audience: ${brandData.target_audience || 'General audience'}
Key Selling Points: ${Array.isArray(brandData.key_selling_points) ? brandData.key_selling_points.join(', ') : 'Not specified'}
Website: ${brandData.website || brandData.url || 'Not specified'}`
        : 'Using generic brand context (brand information not enabled or available)';

      // Call OpenRouter directly via edge function
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'user',
              content: `Generate 12 compelling marketing hooks for social media ads based on the following information.

${brandContext}

Campaign Objective: ${assetObjective.campaign_goal || 'Create engaging social media ads'}

Target Platforms: ${assetObjective.target_platforms?.join(', ') || 'Social Media'}
Tone: ${assetObjective.tone_direction || 'Professional and Engaging'}
Call to Action: ${assetObjective.call_to_action || 'Learn More'}

IMPORTANT: Generate hooks that are highly relevant to the brand's actual products/services and industry. DO NOT generate generic hooks about unrelated topics.

Each hook should:
- Be 5-15 words
- Be platform-appropriate for social ads
- Highlight a benefit or create curiosity about the ACTUAL brand offerings
- Be action-oriented
- Be directly relevant to the brand's products/services

Respond with ONLY valid JSON:
{
  "hooks": [
    {
      "hook_text": "Hook text here",
      "hook_type": "question|statement|stat|benefit|urgency",
      "emotional_appeal": "curiosity|excitement|fear|trust|desire",
      "best_for": "Platform or audience type",
      "rationale": "Brief explanation of the hook's appeal"
    }
  ]
}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
      });

      if (error) throw error;

      const content = data.choices?.[0]?.message?.content;
      let parsedHooks;
      
      try {
        const jsonMatch = content?.match(/\{[\s\S]*\}/);
        parsedHooks = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse hooks:', parseError);
        throw new Error('Invalid AI response format');
      }

      if (parsedHooks.hooks) {
        onHooksGenerated(parsedHooks.hooks);
        toast({
          title: 'Hooks Generated',
          description: `${parsedHooks.hooks.length} marketing hooks created successfully`,
        });
      }
    } catch (error) {
      console.error('Hook generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate marketing hooks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (marketingHooks.length === 0) {
      handleGenerate();
    }
  }, []);

  const toggleHook = (hook: MarketingHook) => {
    const isSelected = selectedHooks.some((h) => h.hook_text === hook.hook_text);
    if (isSelected) {
      onHooksSelected(selectedHooks.filter((h) => h.hook_text !== hook.hook_text));
    } else {
      onHooksSelected([...selectedHooks, hook]);
    }
  };

  const getHookTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      question: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      statement: 'bg-green-500/10 text-green-700 border-green-500/20',
      stat: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      benefit: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
      urgency: 'bg-red-500/10 text-red-700 border-red-500/20',
    };
    return colors[type] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isVisible={isGenerating && marketingHooks.length === 0}
        icon={Sparkles}
        title="Generating Marketing Hooks"
        description="Creating compelling marketing hooks for your campaign"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Marketing Hooks</CardTitle>
            </div>
            {marketingHooks.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
            )}
          </div>
          <CardDescription>
            Select {selectedHooks.length > 0 ? `${selectedHooks.length} hook(s)` : 'one or more hooks'} to use in your assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marketingHooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hooks generated yet
            </div>
          ) : (
            <div className="grid gap-4">
              {marketingHooks.map((hook, idx) => {
                const isSelected = selectedHooks.some((h) => h.hook_text === hook.hook_text);
                return (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleHook(hook)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} className="mt-1" />
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{hook.hook_text}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={getHookTypeColor(hook.hook_type)}>
                              {hook.hook_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {hook.emotional_appeal}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Best for: {hook.best_for}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{hook.rationale}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedHooks.length > 0 && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">
                {selectedHooks.length} hook(s) selected for asset generation
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
