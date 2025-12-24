import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/utils/imageUpload';
import type { BrandAnalysis } from '../CreateCampaignModal';

interface BrandInfoStepProps {
  brandId: string;
  brandAnalysis: BrandAnalysis;
  customAssets: string[];
  targetAudiences: string[];
  onBrandAnalysisUpdate: (analysis: BrandAnalysis) => void;
  onCustomAssetsChange: (assets: string[]) => void;
  onTargetAudiencesChange: (audiences: string[]) => void;
}

export const BrandInfoStep = ({
  brandId,
  brandAnalysis,
  customAssets,
  targetAudiences,
  onBrandAnalysisUpdate,
  onCustomAssetsChange,
  onTargetAudiencesChange,
}: BrandInfoStepProps) => {
  const { toast } = useToast();
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [audienceInput, setAudienceInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use AI-generated suggested audiences from brand analysis, fallback to generic ones
  const suggestedAudiences = brandAnalysis.suggested_audiences || [
    'SEO professionals',
    'Content marketers',
    'Digital marketing agencies',
    'Small business owners',
    'Freelance writers',
    'E-commerce managers',
    'Bloggers and influencers',
  ];

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAsset(true);
    try {
      const result = await uploadImage(file, {
        brandId,
        folder: 'custom-assets',
        maxSizeBytes: 10 * 1024 * 1024,
      });

      if (result.success && result.url) {
        onCustomAssetsChange([...customAssets, result.url]);
        toast({
          title: 'Asset Uploaded',
          description: 'Custom asset uploaded successfully',
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: result.error || 'Failed to upload asset',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Asset upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while uploading',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const handleRemoveAsset = (index: number) => {
    onCustomAssetsChange(customAssets.filter((_, i) => i !== index));
  };

  const handleAddAudience = (audience: string) => {
    if (audience && !targetAudiences.includes(audience)) {
      onTargetAudiencesChange([...targetAudiences, audience]);
      setAudienceInput('');
    }
  };

  const handleRemoveAudience = (index: number) => {
    onTargetAudiencesChange(targetAudiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Brand Information</CardTitle>
          </div>
          <CardDescription>
            Review and customize your brand details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand / Product Name</Label>
            <Input
              id="brand-name"
              value={brandAnalysis.brand_name}
              onChange={(e) =>
                onBrandAnalysisUpdate({
                  ...brandAnalysis,
                  brand_name: e.target.value,
                })
              }
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <Label htmlFor="brand-description">Product Description</Label>
            <Textarea
              id="brand-description"
              value={brandAnalysis.brand_description}
              onChange={(e) =>
                onBrandAnalysisUpdate({
                  ...brandAnalysis,
                  brand_description: e.target.value,
                })
              }
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Brief description of your product or service</span>
              <span>{brandAnalysis.brand_description.length}/1000</span>
            </div>
          </div>

          {/* Custom Assets */}
          <div className="space-y-3">
            <Label>Assets</Label>
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-yellow-500">⭐</span>
              Confirm the assets you want to use. Higher-quality clips and images result in better results.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {customAssets.map((asset, index) => (
                <div key={index} className="relative border rounded-lg overflow-hidden">
                  <img
                    src={asset}
                    alt={`Asset ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleRemoveAsset(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAsset}
                className="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors disabled:opacity-50"
              >
                {isUploadingAsset ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add assets</span>
                  </>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAssetUpload}
                className="hidden"
                disabled={isUploadingAsset}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-3">
            <Label htmlFor="target-audience">Target audience</Label>
            
            {/* Selected Audiences */}
            <div className="flex flex-wrap gap-2">
              {targetAudiences.map((audience, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveAudience(index)}
                >
                  {audience}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>

            {/* Add Custom Audience */}
            <div className="flex gap-2">
              <Input
                id="target-audience"
                placeholder="e.g. outdoor lover"
                value={audienceInput}
                onChange={(e) => setAudienceInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAudience(audienceInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddAudience(audienceInput)}
                disabled={!audienceInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
