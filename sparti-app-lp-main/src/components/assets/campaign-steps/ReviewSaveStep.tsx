import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, CheckCircle2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { BrandAnalysis, AssetObjective, MarketingHook, AdFormat } from '../CreateCampaignModal';

interface GeneratedAsset {
  hookText: string;
  format: string;
  imageUrl: string;
  aspectRatio: string;
}

interface ReviewSaveStepProps {
  brandId: string;
  userId: string;
  brandAnalysis: BrandAnalysis;
  assetObjective: AssetObjective;
  selectedHooks: MarketingHook[];
  selectedFormats: AdFormat[];
  generatedAssets: GeneratedAsset[];
  onSaveComplete: () => void;
}

export const ReviewSaveStep = ({
  brandId,
  userId,
  brandAnalysis,
  assetObjective,
  selectedHooks,
  selectedFormats,
  generatedAssets,
  onSaveComplete,
}: ReviewSaveStepProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('asset_campaigns')
        .insert({
          brand_id: brandId,
          user_id: userId,
          campaign_name: `Campaign ${new Date().toLocaleDateString()}`,
          website_url: brandAnalysis.brand_name || 'N/A',
          brand_analysis: brandAnalysis,
          asset_objective: assetObjective,
          total_assets: generatedAssets.length,
          status: 'completed',
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // 2. Save hooks
      const { data: savedHooks, error: hooksError } = await supabase
        .from('asset_campaign_hooks')
        .insert(
          selectedHooks.map(hook => ({
            campaign_id: campaign.id,
            hook_text: hook.hook_text,
            hook_description: hook.rationale,
            is_selected: true,
          }))
        )
        .select();

      if (hooksError) throw hooksError;

      // 3. Save formats
      const { data: savedFormats, error: formatsError } = await supabase
        .from('asset_campaign_formats')
        .insert(
          selectedFormats.map(format => ({
            campaign_id: campaign.id,
            format_name: format.name,
            aspect_ratio: format.aspect_ratio,
            platform: format.platforms[0] || 'social',
            width: parseInt(format.dimensions.split('x')[0]) || 1080,
            height: parseInt(format.dimensions.split('x')[1]) || 1080,
            is_selected: true,
          }))
        )
        .select();

      if (formatsError) throw formatsError;

      // 4. Save assets
      const assetsToInsert = generatedAssets.map(asset => {
        const matchingHook = savedHooks?.find(h => h.hook_text === asset.hookText);
        const matchingFormat = savedFormats?.find(f => f.format_name === asset.format);
        
        return {
          campaign_id: campaign.id,
          hook_id: matchingHook?.id,
          format_id: matchingFormat?.id,
          asset_url: asset.imageUrl,
          asset_type: 'image',
          status: 'completed',
        };
      });

      const { error: assetsError } = await supabase
        .from('asset_campaign_assets')
        .insert(assetsToInsert);

      if (assetsError) throw assetsError;

      setIsSaved(true);
      toast({
        title: 'Campaign Saved',
        description: 'Your asset campaign has been saved successfully',
      });

      setTimeout(() => {
        onSaveComplete();
      }, 1500);
    } catch (error) {
      console.error('Save campaign error:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
          <CardDescription>Review your campaign details before saving</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Campaign Goal</h4>
            <p className="text-sm text-muted-foreground">{assetObjective.campaign_goal}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Marketing Hooks</h4>
              <p className="text-sm text-muted-foreground">{selectedHooks.length} hooks selected</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Ad Formats</h4>
              <div className="flex flex-wrap gap-1">
                {selectedFormats.map((format, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {format.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Generated Assets</h4>
            <p className="text-sm text-muted-foreground">{generatedAssets.length} assets ready</p>
          </div>
        </CardContent>
      </Card>

      {/* Generated Assets Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Assets</CardTitle>
          <CardDescription>Preview all your generated marketing assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedAssets.map((asset, idx) => (
              <Card key={idx} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  <img
                    src={asset.imageUrl}
                    alt={asset.hookText}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs font-medium line-clamp-2">{asset.hookText}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{asset.format}</span>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={asset.imageUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className="w-full mt-6"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Campaign...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Campaign Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
