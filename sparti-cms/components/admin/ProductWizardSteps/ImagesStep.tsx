import React from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductWizardData } from '../ProductCreationWizard';

interface ImagesStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
}

export default function ImagesStep({
  data,
  updateData,
  errors,
}: ImagesStepProps) {
  const addGalleryImage = () => {
    updateData({
      galleryImages: [...data.galleryImages, ''],
    });
  };

  const removeGalleryImage = (index: number) => {
    updateData({
      galleryImages: data.galleryImages.filter((_, i) => i !== index),
    });
  };

  const updateGalleryImage = (index: number, url: string) => {
    const newGallery = [...data.galleryImages];
    newGallery[index] = url;
    updateData({ galleryImages: newGallery });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Add images for your product. The first image will be used as the main
          product image.
        </p>
      </div>

      <div>
        <Label htmlFor="mainImage">Main Product Image</Label>
        <Input
          id="mainImage"
          value={data.mainImage}
          onChange={(e) => updateData({ mainImage: e.target.value })}
          className={`mt-1 ${errors.mainImage ? 'border-red-500' : ''}`}
          placeholder="https://... (optional)"
        />
        {errors.mainImage && (
          <p className="text-sm text-red-500 mt-1">{errors.mainImage}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Main product image (optional)
        </p>
        {data.mainImage && (
          <div className="mt-3">
            <img
              src={data.mainImage}
              alt="Main product"
              className="h-48 w-48 object-cover rounded-lg border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Product Gallery</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGalleryImage}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>

        {data.galleryImages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No gallery images added. Click "Add Image" to add more product
            images.
          </p>
        )}

        <div className="space-y-3">
          {data.galleryImages.map((url, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border rounded-lg"
            >
              <div className="flex-1">
                <Input
                  value={url}
                  onChange={(e) => updateGalleryImage(index, e.target.value)}
                  placeholder="https://..."
                  className="mb-2"
                />
                {url && (
                  <div>
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="h-24 w-24 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGalleryImage(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {data.productType === 'variable' && data.variations.length > 0 && (
        <div className="pt-4 border-t">
          <Label className="text-base font-semibold mb-4 block">
            Variation Images
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Assign specific images to variations. These will be shown when
            customers select that variation.
          </p>
          <div className="space-y-3">
            {data.variations.map((variation) => {
              const variationLabel = Object.entries(variation.attributes)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ') || 'Default';
              return (
                <div key={variation.id} className="p-3 border rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">
                    {variationLabel}
                  </Label>
                  <Input
                    value={variation.image || ''}
                    onChange={(e) => {
                      const updatedVariations = data.variations.map((v) =>
                        v.id === variation.id
                          ? { ...v, image: e.target.value }
                          : v
                      );
                      updateData({ variations: updatedVariations });
                    }}
                    placeholder="https://... (optional)"
                    className="mb-2"
                  />
                  {variation.image && (
                    <div>
                      <img
                        src={variation.image}
                        alt={variationLabel}
                        className="h-24 w-24 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
