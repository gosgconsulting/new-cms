import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CustomInstructionsSelector } from './CustomInstructionsSelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ImageIcon } from 'lucide-react';
import { FeaturedImageGalleryModal } from './FeaturedImageGalleryModal';
import { BrandInformationScanner } from './BrandInformationScanner';

interface ArticleSettingsManagerProps {
  brandId: string;
  userId: string;
  viewMode?: 'page' | 'modal';
  onSettingsChange?: (settings: ArticleSettings) => void;
  initialSettings?: Partial<ArticleSettings>;
  currentWebsite?: string;
  currentName?: string;
  currentDescription?: string;
  currentTargetAudience?: string;
  currentBrandVoice?: string;
  showContentSettings?: boolean; // Control visibility of Content Generation Settings
}

export interface ArticleSettings {
  // Content behavior settings
  use_brand_info: boolean;
  brand_mentions: string;
  competitor_mentions: string;
  internal_links: string;
  custom_instructions: string;
}

const linkOptions = [
  { value: 'none', label: 'None' },
  { value: 'few', label: 'Few (1-2)' },
  { value: 'regular', label: 'Regular (3-4)' },
  { value: 'many', label: 'Many (over 5)' }
];

export const ArticleSettingsManager = ({
  brandId,
  userId,
  viewMode = 'page',
  onSettingsChange,
  initialSettings,
  currentWebsite,
  currentName,
  currentDescription,
  currentTargetAudience,
  currentBrandVoice,
  showContentSettings = true // Default to true for backward compatibility
}: ArticleSettingsManagerProps) => {
  const queryClient = useQueryClient();
  
  // Content behavior settings
  const [useBrandInfo, setUseBrandInfo] = useState(initialSettings?.use_brand_info ?? true);
  const [brandMentions, setBrandMentions] = useState(initialSettings?.brand_mentions || 'regular');
  const [competitorMentions, setCompetitorMentions] = useState(initialSettings?.competitor_mentions || 'minimal');
  const [internalLinks, setInternalLinks] = useState(initialSettings?.internal_links || 'few');
  const [customInstructions, setCustomInstructions] = useState(initialSettings?.custom_instructions || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [brandId]);

  useEffect(() => {
    notifySettingsChange();
  }, [
    useBrandInfo, brandMentions, competitorMentions, internalLinks, customInstructions
  ]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_settings')
        .select('*')
        .eq('brand_id', brandId)
        .maybeSingle();

      if (data) {
        setUseBrandInfo(data.use_brand_info);
        setBrandMentions(data.brand_mentions);
        setCompetitorMentions(data.competitor_mentions);
        setInternalLinks(data.internal_links);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const notifySettingsChange = () => {
    if (onSettingsChange) {
      onSettingsChange({
        use_brand_info: useBrandInfo,
        brand_mentions: brandMentions,
        competitor_mentions: competitorMentions,
        internal_links: internalLinks,
        custom_instructions: customInstructions
      });
    }
  };

  const handleSaveGlobal = async () => {
    setSaving(true);
    try {
      const settingsData = {
        brand_id: brandId,
        user_id: userId,
        use_brand_info: useBrandInfo,
        brand_mentions: brandMentions,
        competitor_mentions: competitorMentions,
        internal_links: internalLinks
      };

      const { error } = await supabase
        .from('content_settings')
        .upsert(settingsData, {
          onConflict: 'brand_id'
        });

      if (error) throw error;

      toast.success('Settings saved as global defaults');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setUseBrandInfo(true);
    setBrandMentions('regular');
    setCompetitorMentions('minimal');
    setInternalLinks('few');
    setCustomInstructions('');
    toast.success('Settings reset to defaults');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === 'page' && (
        <BrandInformationScanner 
          brandId={brandId}
          userId={userId}
          currentWebsite={currentWebsite}
          currentName={currentName}
          currentDescription={currentDescription}
          currentTargetAudience={currentTargetAudience}
          currentBrandVoice={currentBrandVoice}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['brand', brandId, userId] });
          }}
        />
      )}

      {showContentSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Content Generation Settings</CardTitle>
            <CardDescription>
              Configure how your content will be generated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Use Brand Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Use brand info</Label>
                <p className="text-sm text-muted-foreground">
                  When selected, content uses both the topic brief and your brand info.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useBrandInfo"
                  checked={useBrandInfo}
                  onCheckedChange={(checked) => setUseBrandInfo(checked as boolean)}
                />
                <Label htmlFor="useBrandInfo">Using brand info</Label>
              </div>
            </div>

            <Separator />

            {/* Brand Mentions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Brand mentions</Label>
                <p className="text-sm text-muted-foreground">
                  How often mentions to your brand/product should appear.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {['none', 'minimal', 'regular', 'maximal'].map((level) => (
                  <label key={level} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="brandMentions"
                      value={level}
                      checked={brandMentions === level}
                      onChange={(e) => setBrandMentions(e.target.value)}
                      className="text-primary"
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Competitor Mentions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Competitor mentions</Label>
                <p className="text-sm text-muted-foreground">
                  How often competitor references should appear.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {['none', 'minimal', 'regular', 'maximal'].map((level) => (
                  <label key={level} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="competitorMentions"
                      value={level}
                      checked={competitorMentions === level}
                      onChange={(e) => setCompetitorMentions(e.target.value)}
                      className="text-primary"
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Internal Links */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Internal Links</Label>
                <p className="text-sm text-muted-foreground">
                  Number of links to other pages of your website.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {linkOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="internalLinks"
                      value={option.value}
                      checked={internalLinks === option.value}
                      onChange={(e) => setInternalLinks(e.target.value)}
                      className="text-primary"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Custom Instructions */}
            <CustomInstructionsSelector 
              value={customInstructions}
              onChange={setCustomInstructions}
            />

            <Separator />

            {/* Gallery for Featured Image */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Gallery for Featured Image</Label>
                <p className="text-sm text-muted-foreground">
                  Manage your collection of featured images for articles.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setGalleryModalOpen(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                View Gallery
              </Button>
            </div>

            {viewMode === 'page' && (
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline"
                  onClick={handleResetToDefaults}
                >
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={handleSaveGlobal}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Global Settings'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <FeaturedImageGalleryModal
        open={galleryModalOpen}
        onOpenChange={setGalleryModalOpen}
        brandId={brandId}
        userId={userId}
      />
    </div>
  );
};
