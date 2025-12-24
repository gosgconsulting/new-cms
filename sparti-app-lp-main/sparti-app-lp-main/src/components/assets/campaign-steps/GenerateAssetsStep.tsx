import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Download, CheckCircle2, Upload, X, Loader2, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/utils/imageUpload';
import { LoadingOverlay } from '../LoadingOverlay';
import type { BrandAnalysis, AssetObjective, MarketingHook, AdFormat, GeneratedAsset } from '../CreateCampaignModal';
import { useAuth } from '@/contexts/AuthContext';
import { checkIsAdminFromDatabase } from '@/utils/adminUtils';

interface GenerateAssetsStepProps {
  brandId: string;
  userId: string;
  brandAnalysis: BrandAnalysis;
  assetObjective: AssetObjective;
  selectedHooks: MarketingHook[];
  selectedFormats: AdFormat[];
  customAssets: string[];
  brandStyle?: {
    colors: string[];
    typography: {
      primary?: string;
      secondary?: string;
    };
    logoUrl?: string;
    useBrandLogo?: boolean;
  } | null;
  onFormatsSelected: (formats: AdFormat[]) => void;
  onAssetsGenerated: (assets: GeneratedAsset[]) => void;
  onSaveComplete: (campaignId: string) => void;
}

const AD_FORMATS: AdFormat[] = [
  {
    name: 'Square',
    aspect_ratio: '1:1',
    dimensions: '1080x1080',
    platforms: ['Instagram Feed', 'Facebook Feed'],
    best_for: 'General posts, product showcases',
  },
  {
    name: 'Portrait',
    aspect_ratio: '4:5',
    dimensions: '1080x1350',
    platforms: ['Instagram Feed', 'Facebook Feed'],
    best_for: 'Mobile-optimized feed posts',
  },
  {
    name: 'Story',
    aspect_ratio: '9:16',
    dimensions: '1080x1920',
    platforms: ['Instagram Stories', 'Facebook Stories', 'Reels'],
    best_for: 'Full-screen immersive content',
  },
  {
    name: 'Landscape',
    aspect_ratio: '16:9',
    dimensions: '1200x675',
    platforms: ['Facebook Feed', 'Facebook Ads'],
    best_for: 'Desktop feed, video ads',
  },
];

const AD_STYLES = [
  {
    id: 'style1',
    name: 'Headline + Text + CTA',
    description: 'Bold headline with supporting text and clear call-to-action',
  },
  {
    id: 'style2',
    name: 'Hooks + Bullet Points + CTA',
    description: 'Marketing hooks with feature/benefit bullets and CTA',
  },
  {
    id: 'style3',
    name: 'Hooks + Product Image + CTA',
    description: 'Marketing hooks showcasing product/service with CTA',
  },
  {
    id: 'style4',
    name: 'Image + Hooks + CTA',
    description: 'Product/service image with overlay text and CTA',
  },
  {
    id: 'style5',
    name: 'Luxury Background + Hooks',
    description: 'Premium image background with elegant marketing copy',
  },
];

export const GenerateAssetsStep = ({
  brandId,
  userId,
  brandAnalysis,
  assetObjective,
  selectedHooks,
  selectedFormats,
  customAssets,
  brandStyle,
  onFormatsSelected,
  onAssetsGenerated,
  onSaveComplete,
}: GenerateAssetsStepProps) => {
  const [language, setLanguage] = useState('en');
  const [variationCount, setVariationCount] = useState('2');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(AD_STYLES.map(s => s.id));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [totalAssetsToGenerate, setTotalAssetsToGenerate] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savingToLibrary, setSavingToLibrary] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.id) {
        const adminStatus = await checkIsAdminFromDatabase(user.id);
        setIsAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [user]);

  const handleFormatChange = (formatName: string) => {
    setSelectedFormat(formatName);
    const format = AD_FORMATS.find(f => f.name === formatName);
    if (format) {
      onFormatsSelected([format]);
    }
  };

  const totalAssets = selectedFormat && selectedStyles.length > 0 ? selectedStyles.length * parseInt(variationCount) : 0;

  const getStylePrompt = (style: string, hook: string) => {
    const styleConfig = AD_STYLES.find(s => s.id === style);
    
    // Build brand colors string
    const brandColorsText = brandStyle?.colors && brandStyle.colors.length > 0
      ? `\nBrand Colors: ${brandStyle.colors.join(', ')}`
      : '';
    
    // Build logo instruction
    const logoInstruction = brandStyle?.useBrandLogo && brandStyle?.logoUrl
      ? `\nIMPORTANT: Include the brand logo (provided as reference image) prominently in the design.`
      : `\nDo not include any brand logo in the design.`;
    
    // Build custom assets instruction
    const customAssetsInstruction = customAssets.length > 0
      ? `\nCRITICAL INSTRUCTION FOR PROVIDED ASSETS:
- Use the provided product/brand images EXACTLY as they appear - DO NOT modify, regenerate, or alter the products in any way
- Keep the exact colors, shapes, positioning, and details of the provided assets
- ONLY add marketing elements around them: text overlays, headlines, copywriting, CTA buttons, background enhancements
- The provided assets should be the hero elements - preserve them perfectly while adding compelling copy and design elements
- Think of it as compositing: the provided images are locked, you're only adding the marketing layer on top`
      : '';
    
    const baseContext = `Brand: ${brandAnalysis.brand_name}
Brand Description: ${brandAnalysis.brand_description}
Marketing Hook: "${hook}"
Campaign Goal: ${assetObjective.campaign_goal}
Format: ${selectedFormat}${brandColorsText}${logoInstruction}${customAssetsInstruction}`;

    switch (style) {
      case 'style1':
        return `${baseContext}

Create a professional social media ad with:
- Bold, attention-grabbing headline at the top
- Supporting text in the middle explaining the value proposition
- Clear call-to-action button at the bottom
- Clean, modern design with brand-appropriate colors`;

      case 'style2':
        return `${baseContext}

Create a social media ad featuring:
- Eye-catching marketing hook as the headline
- 3-4 bullet points highlighting key features or benefits (use checkmarks or icons)
- Prominent call-to-action button
- Professional layout with clear visual hierarchy`;

      case 'style3':
        return `${baseContext}

Create a product-focused social media ad with:
- Marketing hook as compelling headline
- Large, prominent product/service showcase in the center
- Call-to-action button at the bottom
- Clean background that makes the product stand out
- Feature the product/service prominently`;

      case 'style4':
        return `${baseContext}

Create an image-driven social media ad with:
- Full-bleed product/service image as the background
- Marketing hook overlaid on the image with contrasting text
- Semi-transparent overlay for text readability
- Call-to-action button prominently placed
- Create an engaging visual background`;

      case 'style5':
        return `${baseContext}

Create a luxury-style social media ad with:
- Premium, elegant background (subtle gradients, textures, or sophisticated imagery)
- Refined typography with the marketing hook
- Minimal, high-end aesthetic
- Sophisticated color palette (golds, blacks, whites, or brand colors)
- Elegant call-to-action
- Focus on premium brand atmosphere`;

      default:
        return baseContext;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newAssets: GeneratedAsset[] = [];
    const variations = parseInt(variationCount);
    const totalAssets = selectedStyles.length * variations;
    setTotalAssetsToGenerate(totalAssets);
    setCurrentAssetIndex(0);
    
    try {
      let assetCount = 0;
      
      // Generate for each selected style × number of variations
      for (const style of selectedStyles) {
        for (let v = 0; v < variations; v++) {
          assetCount++;
          setCurrentAssetIndex(assetCount);
          
          const hookIndex = v % selectedHooks.length;
          const hook = selectedHooks[hookIndex]?.hook_text || 'Discover something amazing';
          const prompt = getStylePrompt(style, hook);
          
          const messageContent: any[] = [
            {
              type: 'text',
              text: prompt,
            }
          ];

          // Include brand logo if enabled and available
          if (brandStyle?.useBrandLogo && brandStyle?.logoUrl) {
            messageContent.push({
              type: 'image_url',
              image_url: {
                url: brandStyle.logoUrl,
              }
            });
          }

          // Include custom assets if available
          if (customAssets.length > 0) {
            customAssets.forEach(assetUrl => {
              messageContent.push({
                type: 'image_url',
                image_url: {
                  url: assetUrl,
                }
              });
            });
          }

          const { data, error } = await supabase.functions.invoke('openrouter-chat', {
            body: {
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [
                {
                  role: 'user',
                  content: messageContent,
                }
              ],
              modalities: ['image', 'text'],
            },
          });

          if (error) throw error;

          const images = data?.choices?.[0]?.message?.images || [];
          if (images.length > 0) {
            const styleName = AD_STYLES.find(s => s.id === style)?.name || style;
            newAssets.push({
              hookText: `${styleName} - ${hook}`,
              format: selectedFormat,
              imageUrl: images[0].image_url?.url || '',
              aspectRatio: selectedFormats[0]?.aspect_ratio || '1:1',
            });
          }
        }
      }

      setGeneratedAssets(newAssets);
      onAssetsGenerated(newAssets);
      
      toast({
        title: 'Assets Generated',
        description: `${newAssets.length} assets created successfully. Saving campaign...`,
      });

      // Auto-save campaign in background
      await saveCampaign(newAssets);
    } catch (error) {
      console.error('Asset generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate assets. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setCurrentAssetIndex(0);
      setTotalAssetsToGenerate(0);
    }
  };

  const handleSaveToLibrary = async (asset: GeneratedAsset, index: number) => {
    setSavingToLibrary(index);
    try {
      const styleName = AD_STYLES.find(s => asset.hookText.includes(s.name))?.name || 'Unknown Style';
      
      const { error } = await supabase
        .from('design_library')
        .insert({
          image_url: asset.imageUrl,
          hook_text: asset.hookText,
          format: asset.format,
          aspect_ratio: asset.aspectRatio,
          style_name: styleName,
          brand_name: brandAnalysis.brand_name,
          campaign_goal: assetObjective.campaign_goal,
          design_notes: `Generated with style: ${styleName}. Hook: ${asset.hookText}`,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Saved to Design Library',
        description: 'This design has been added to the global library for future AI reference.',
      });
    } catch (error) {
      console.error('Error saving to library:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save design to library. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingToLibrary(null);
    }
  };

  const saveCampaign = async (assets: GeneratedAsset[]) => {
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
          total_assets: assets.length,
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
      const assetsToInsert = assets.map(asset => {
        const matchingHook = savedHooks?.find(h => asset.hookText.includes(h.hook_text));
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

      toast({
        title: 'Campaign Saved',
        description: 'Your asset campaign has been saved successfully',
      });

      setTimeout(() => {
        onSaveComplete(campaign.id);
      }, 1500);
    } catch (error) {
      console.error('Save campaign error:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save campaign. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isVisible={isGenerating}
        icon={Image}
        title="Generating Assets"
        description={`Creating ${totalAssetsToGenerate} marketing assets`}
        progress={totalAssetsToGenerate > 0 ? `${currentAssetIndex}/${totalAssetsToGenerate}` : undefined}
      />

      {/* Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle>Generate Assets</CardTitle>
          </div>
          <CardDescription>Configure and generate your marketing assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ad-format">Ad Format</Label>
              <Select value={selectedFormat} onValueChange={handleFormatChange} disabled={isGenerating || generatedAssets.length > 0}>
                <SelectTrigger id="ad-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {AD_FORMATS.map((format) => (
                    <SelectItem key={format.name} value={format.name}>
                      {format.name} ({format.aspect_ratio})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variation-count">Number of Variations</Label>
              <Select value={variationCount} onValueChange={setVariationCount} disabled={isGenerating || generatedAssets.length > 0}>
                <SelectTrigger id="variation-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage} disabled={isGenerating || generatedAssets.length > 0}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Ad Styles */}
          <div className="space-y-3">
            <Label>Ad Styles (Select which styles to generate)</Label>
            <div className="space-y-2">
              {AD_STYLES.map((style) => (
                <div key={style.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <Checkbox
                    id={style.id}
                    checked={selectedStyles.includes(style.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStyles([...selectedStyles, style.id]);
                      } else {
                        setSelectedStyles(selectedStyles.filter(s => s !== style.id));
                      }
                    }}
                    disabled={isGenerating || generatedAssets.length > 0}
                  />
                  <div className="flex-1">
                    <Label htmlFor={style.id} className="text-sm font-medium cursor-pointer">
                      {style.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-medium">Total Assets to Generate:</span> {totalAssets}
            </p>
            <p className="text-sm">
              <span className="font-medium">Enabled Styles:</span> {selectedStyles.length}
            </p>
            <p className="text-sm">
              <span className="font-medium">Variations per Style:</span> {variationCount}
            </p>
            <p className="text-sm">
              <span className="font-medium">Format:</span> {selectedFormat || 'None'}
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || generatedAssets.length > 0 || !selectedFormat || selectedStyles.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating {totalAssets} Assets...
              </>
            ) : generatedAssets.length > 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {generatedAssets.length} Assets Generated
              </>
            ) : (
              <>
                <Image className="h-4 w-4 mr-2" />
                Generate {totalAssets} Assets
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Assets */}
      {generatedAssets.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Generated Assets
            </CardTitle>
            <CardDescription>{generatedAssets.length} assets ready for download</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                    <p className="text-xs font-medium truncate">{asset.hookText}</p>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs text-muted-foreground flex-1">{asset.format}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <a href={asset.imageUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleSaveToLibrary(asset, idx)}
                            disabled={savingToLibrary === idx}
                          >
                            {savingToLibrary === idx ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
