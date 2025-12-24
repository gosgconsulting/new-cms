import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Type, Image as ImageIcon, Upload, X, Sparkles, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/utils/imageUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BrandStyle {
  colors: string[];
  typography: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string;
  useBrandLogo?: boolean;
}

interface BrandStyleStepProps {
  brandId: string;
  brandStyle: BrandStyle | null;
  onStyleFetched: (style: BrandStyle, isAI: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BrandStyleStep = ({
  brandId,
  brandStyle,
  onStyleFetched,
  onNext,
  onBack,
}: BrandStyleStepProps) => {
  const { toast } = useToast();
  const [styleMode, setStyleMode] = useState<'ai' | 'manual' | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isGeneratingColors, setIsGeneratingColors] = useState(false);
  const [manualColors, setManualColors] = useState<string[]>(brandStyle?.colors || []);
  const [manualTypography, setManualTypography] = useState(brandStyle?.typography || {});
  const [logoPreview, setLogoPreview] = useState<string | undefined>(brandStyle?.logoUrl);
  const [useBrandLogo, setUseBrandLogo] = useState<boolean>(brandStyle?.useBrandLogo ?? true);

  // Fetch brand settings from database on mount
  useEffect(() => {
    const fetchBrandSettings = async () => {
      try {
        const { data: brandData, error } = await supabase
          .from('brands')
          .select('logo_url, use_brand_logo, colors, typography')
          .eq('id', brandId)
          .single();

        if (error) throw error;

        if (brandData) {
          // Pre-fill with brand settings if no brand style is set yet
          if (!brandStyle) {
            const colors = brandData.colors as any;
            const typography = brandData.typography as any;
            
            const defaultColors = [
              colors?.primary || '#000000',
              colors?.secondary || '#666666',
              colors?.tertiary || '#999999',
            ];
            
            setManualColors(defaultColors);
            setManualTypography({
              primary: typography?.primary || 'Inter',
              secondary: typography?.secondary || 'Roboto',
            });
            setLogoPreview(brandData.logo_url || undefined);
            setUseBrandLogo(brandData.use_brand_logo ?? true);
          }
        }
      } catch (error) {
        console.error('Error fetching brand settings:', error);
      }
    };

    fetchBrandSettings();
  }, [brandId, brandStyle]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const result = await uploadImage(file, {
        brandId,
        folder: 'logos',
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
      });

      if (result.success && result.url) {
        setLogoPreview(result.url);
        toast({
          title: 'Logo Uploaded',
          description: 'Logo uploaded successfully',
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: result.error || 'Failed to upload logo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while uploading the logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleGenerateColors = async () => {
    const primaryColor = manualColors[0];
    if (!primaryColor) {
      toast({
        title: 'Primary color required',
        description: 'Please set a primary color first',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingColors(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-colors', {
        body: { primaryColor }
      });

      // Check for payment/credit errors
      if (data?.error) {
        if (data.error.includes('Payment required') || data.error.includes('credits')) {
          toast({
            title: 'Credits Required',
            description: 'Not enough credits. Please add credits to your Lovable workspace to use AI features.',
            variant: 'destructive',
          });
        } else if (data.error.includes('Rate limit')) {
          toast({
            title: 'Rate Limit',
            description: 'Rate limit exceeded. Please try again in a moment.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: data.error,
            variant: 'destructive',
          });
        }
        return;
      }

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      if (data?.secondary && data?.tertiary) {
        // Update colors array with AI generated colors
        const newColors = [primaryColor, data.secondary, data.tertiary];
        setManualColors(newColors);
        toast({
          title: 'Success',
          description: 'Colors generated successfully with AI!',
        });
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error: any) {
      console.error('Color generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate colors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingColors(false);
    }
  };

  const handleAddColor = () => {
    setManualColors([...manualColors, "#000000"]);
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...manualColors];
    newColors[index] = value;
    setManualColors(newColors);
  };

  const handleRemoveColor = (index: number) => {
    setManualColors(manualColors.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const style: BrandStyle = {
      colors: manualColors,
      typography: manualTypography,
      logoUrl: logoPreview,
      useBrandLogo: useBrandLogo
    };
    const isAI = styleMode === 'ai';
    onStyleFetched(style, isAI);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Brand Style
        </h3>
        <p className="text-sm text-muted-foreground">
          Define your brand colors, typography, and logo
        </p>
      </div>

      {/* Style Mode Selection */}
      {!styleMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              // When AI is selected, skip to generate step with empty style
              const emptyStyle: BrandStyle = {
                colors: [],
                typography: {},
              };
              onStyleFetched(emptyStyle, true);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Use AI Recommended Styles
              </CardTitle>
              <CardDescription>
                Let AI analyze your brand and suggest optimal colors and typography
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically generate brand styles based on your website and industry
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              // Load brand style from settings and skip to generate step
              const brandStyleFromSettings: BrandStyle = {
                colors: manualColors,
                typography: manualTypography,
                logoUrl: logoPreview,
                useBrandLogo: useBrandLogo
              };
              onStyleFetched(brandStyleFromSettings, false);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Use Brand Style
              </CardTitle>
              <CardDescription>
                Use your brand style from Assets Copilot settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Apply colors, fonts, and logo from your saved settings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Brand Style Form - only show when styleMode is selected */}
      {styleMode && (
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStyleMode(null)}
            className="mb-2"
          >
            ← Change selection
          </Button>

          {/* Logo */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Brand Logo
          </Label>
          {logoPreview ? (
            <div className="relative border rounded-lg p-4 flex items-center justify-center bg-muted">
              <img src={logoPreview} alt="Brand logo" className="max-h-32 object-contain" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setLogoPreview(undefined)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">Upload your brand logo</p>
              <Button variant="outline" asChild disabled={isUploadingLogo}>
                <label className="cursor-pointer flex items-center gap-2">
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Choose Logo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploadingLogo}
                  />
                </label>
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            PNG, JPG or SVG (max 5MB)
          </p>
        </div>

        {/* Use Brand Logo Toggle */}
        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card">
          <div className="flex-1 space-y-1">
            <Label htmlFor="use-brand-logo" className="text-base cursor-pointer">
              Use Brand Logo in Generated Assets
            </Label>
            <p className="text-sm text-muted-foreground">
              Include your brand logo in AI-generated images
            </p>
          </div>
          <Switch
            id="use-brand-logo"
            checked={useBrandLogo}
            onCheckedChange={setUseBrandLogo}
            disabled={!logoPreview}
          />
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <div>
            <Label className="flex items-center gap-2 text-base mb-1">
              <Palette className="w-4 h-4" />
              Brand Colors
            </Label>
            <p className="text-sm text-muted-foreground">
              These colors will be used for backgrounds, CTAs, headlines, and gradients
            </p>
          </div>
          
          <div className="space-y-2">
            {manualColors.map((color, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveColor(index)}
                  disabled={manualColors.length <= 1}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <Label className="text-sm mb-2 block">Color Preview</Label>
            <div className="flex gap-2">
              {manualColors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 h-16 rounded-md border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* AI Color Generation */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateColors}
            disabled={isGeneratingColors || manualColors.length < 1}
            className="w-full"
          >
            {isGeneratingColors ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Set up primary color and generate with AI
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handleAddColor} className="w-full">
            Add Color
          </Button>
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </Label>
          <div className="space-y-2">
            <Input
              placeholder="Primary font (e.g., Arial, Helvetica)"
              value={manualTypography.primary || ""}
              onChange={(e) => setManualTypography({ ...manualTypography, primary: e.target.value })}
            />
            <Input
              placeholder="Secondary font (optional)"
              value={manualTypography.secondary || ""}
              onChange={(e) => setManualTypography({ ...manualTypography, secondary: e.target.value })}
            />
          </div>
        </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSave} disabled={!styleMode}>
          Continue
        </Button>
      </div>
    </div>
  );
};
