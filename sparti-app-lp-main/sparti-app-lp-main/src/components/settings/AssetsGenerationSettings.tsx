import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, X, Save, Loader2, Palette, Sparkles, ChevronsUpDown, Check, Type } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/utils/imageUpload';
import { cn } from '@/lib/utils';

// Popular Google Fonts list
const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Nunito', 'Playfair Display', 'Merriweather', 'Oswald', 'Source Sans Pro',
  'Roboto Condensed', 'Noto Sans', 'Ubuntu', 'PT Sans', 'Work Sans', 'Quicksand',
  'Crimson Text', 'Libre Baskerville', 'Bitter', 'DM Sans', 'Space Grotesk',
  'Plus Jakarta Sans', 'Manrope', 'Rubik', 'Karla', 'Outfit', 'Sora'
];

interface AssetsGenerationSettingsProps {
  brandId: string;
  userId: string;
  currentLogoUrl?: string;
  currentUseBrandLogo?: boolean;
  currentColors?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
  };
  currentTypography?: {
    primary?: string;
    secondary?: string;
  };
  onUpdate?: () => void;
}

export const AssetsGenerationSettings = ({
  brandId,
  userId,
  currentLogoUrl,
  currentUseBrandLogo = true,
  currentColors,
  currentTypography,
  onUpdate,
}: AssetsGenerationSettingsProps) => {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || '');
  const [useBrandLogo, setUseBrandLogo] = useState(currentUseBrandLogo);
  const [primaryColor, setPrimaryColor] = useState(currentColors?.primary || '#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState(currentColors?.secondary || '#8B5CF6');
  const [tertiaryColor, setTertiaryColor] = useState(currentColors?.tertiary || '#10B981');
  const [primaryFont, setPrimaryFont] = useState(currentTypography?.primary || 'Inter');
  const [secondaryFont, setSecondaryFont] = useState(currentTypography?.secondary || 'Roboto');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingColors, setIsGeneratingColors] = useState(false);
  const [primaryFontOpen, setPrimaryFontOpen] = useState(false);
  const [secondaryFontOpen, setSecondaryFontOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoUrl(currentLogoUrl || '');
    setUseBrandLogo(currentUseBrandLogo);
    setPrimaryColor(currentColors?.primary || '#3B82F6');
    setSecondaryColor(currentColors?.secondary || '#8B5CF6');
    setTertiaryColor(currentColors?.tertiary || '#10B981');
    setPrimaryFont(currentTypography?.primary || 'Inter');
    setSecondaryFont(currentTypography?.secondary || 'Roboto');
  }, [currentLogoUrl, currentUseBrandLogo, currentColors, currentTypography]);

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
        setLogoUrl(result.url);
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('An error occurred while uploading the logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateColors = async () => {
    if (!primaryColor) {
      toast.error('Please select a primary color first');
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
          toast.error('Not enough credits in your OpenRouter account. Please add credits at openrouter.ai to use AI features.', {
            duration: 5000,
          });
        } else if (data.error.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      if (data?.secondary && data?.tertiary) {
        setSecondaryColor(data.secondary);
        setTertiaryColor(data.tertiary);
        toast.success('Colors generated successfully with AI!');
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error: any) {
      console.error('Color generation error:', error);
      toast.error('Failed to generate colors. Please try again.');
    } finally {
      setIsGeneratingColors(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({
          logo_url: logoUrl || null,
          use_brand_logo: useBrandLogo,
          colors: {
            primary: primaryColor,
            secondary: secondaryColor,
            tertiary: tertiaryColor,
          },
          typography: {
            primary: primaryFont,
            secondary: secondaryFont,
          },
        })
        .eq('id', brandId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Assets generation settings saved successfully');
      onUpdate?.();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save assets generation settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Assets Generation Settings</CardTitle>
        </div>
        <CardDescription>
          Configure your brand assets for AI-powered image generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label>Brand Logo</Label>
          <div className="border-2 border-dashed rounded-lg p-4">
            {logoUrl ? (
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="Brand Logo"
                  className="w-full max-w-xs h-32 object-contain rounded-lg mx-auto"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveLogo}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your brand logo
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  PNG, JPG or SVG (max 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isSaving}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo || isSaving}
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Logo
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Use Brand Logo Toggle */}
        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
          <div className="flex-1 space-y-1">
            <Label htmlFor="use-brand-logo" className="text-base">
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
            disabled={isSaving || !logoUrl}
          />
        </div>

        {/* Design Colors */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">Design Colors</Label>
            <p className="text-sm text-muted-foreground mt-1">
              These colors will be used for backgrounds, CTAs, headlines, and gradients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10 p-1 cursor-pointer"
                  disabled={isSaving}
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                  placeholder="#3B82F6"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-20 h-10 p-1 cursor-pointer"
                  disabled={isSaving}
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1"
                  placeholder="#8B5CF6"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Tertiary Color */}
            <div className="space-y-2">
              <Label htmlFor="tertiary-color">Tertiary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="tertiary-color"
                  type="color"
                  value={tertiaryColor}
                  onChange={(e) => setTertiaryColor(e.target.value)}
                  className="w-20 h-10 p-1 cursor-pointer"
                  disabled={isSaving}
                />
                <Input
                  type="text"
                  value={tertiaryColor}
                  onChange={(e) => setTertiaryColor(e.target.value)}
                  className="flex-1"
                  placeholder="#10B981"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* AI Color Generation Button */}
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateColors}
              disabled={isGeneratingColors || isSaving || !primaryColor}
              className="w-full max-w-md"
            >
              {isGeneratingColors ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Set up primary color and generate with AI
                </>
              )}
            </Button>
          </div>

          {/* Color Preview */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <Label className="text-sm mb-2 block">Color Preview</Label>
            <div className="flex gap-2">
              <div
                className="flex-1 h-16 rounded-md border"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className="flex-1 h-16 rounded-md border"
                style={{ backgroundColor: secondaryColor }}
              />
              <div
                className="flex-1 h-16 rounded-md border"
                style={{ backgroundColor: tertiaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Type className="h-4 w-4" />
              <Label className="text-base">Typography</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Select Google Fonts to use in generated assets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Font */}
            <div className="space-y-2">
              <Label htmlFor="primary-font">Primary Font</Label>
              <Popover open={primaryFontOpen} onOpenChange={setPrimaryFontOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={primaryFontOpen}
                    className="w-full justify-between"
                    disabled={isSaving}
                  >
                    {primaryFont || "Select font..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search fonts..." />
                    <CommandList>
                      <CommandEmpty>No font found.</CommandEmpty>
                      <CommandGroup>
                        {GOOGLE_FONTS.map((font) => (
                          <CommandItem
                            key={font}
                            value={font}
                            onSelect={(currentValue) => {
                              setPrimaryFont(currentValue);
                              setPrimaryFontOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                primaryFont === font ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {font}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Secondary Font */}
            <div className="space-y-2">
              <Label htmlFor="secondary-font">Secondary Font</Label>
              <Popover open={secondaryFontOpen} onOpenChange={setSecondaryFontOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={secondaryFontOpen}
                    className="w-full justify-between"
                    disabled={isSaving}
                  >
                    {secondaryFont || "Select font..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search fonts..." />
                    <CommandList>
                      <CommandEmpty>No font found.</CommandEmpty>
                      <CommandGroup>
                        {GOOGLE_FONTS.map((font) => (
                          <CommandItem
                            key={font}
                            value={font}
                            onSelect={(currentValue) => {
                              setSecondaryFont(currentValue);
                              setSecondaryFontOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                secondaryFont === font ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {font}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Assets Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
