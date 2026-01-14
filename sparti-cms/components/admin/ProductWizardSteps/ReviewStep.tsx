import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '../../../utils/api';
import { ProductWizardData } from '../ProductCreationWizard';

interface ReviewStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
  onSuccess: () => void;
}

export default function ReviewStep({
  data,
  currentTenantId,
  onSuccess,
}: ReviewStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await api.post('/api/shop/products', productData, {
        tenantId: currentTenantId,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', currentTenantId] });
      onSuccess();
    },
  });

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // Prepare product data for API
      const productData: any = {
        name: data.name,
        slug: data.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        description: data.description,
        short_description: data.shortDescription,
        price: parseFloat(data.regularPrice) || 0,
        sale_price: data.salePrice ? parseFloat(data.salePrice) : null,
        sku: data.sku || null,
        manage_stock: data.manageStock,
        stock_quantity: data.stockQuantity,
        backorders: data.backorders,
        image_url: data.mainImage || null,
        gallery_images: data.galleryImages,
        categories: data.categories,
        tags: data.tags,
        meta_title: data.metaTitle || null,
        meta_description: data.metaDescription || null,
        weight: data.weight || null,
        length: data.length || null,
        width: data.width || null,
        height: data.height || null,
        shipping_class: data.shippingClass || null,
        status: data.status,
        featured: data.featured,
        product_type: data.productType,
        attributes: data.attributes.map((attr) => ({
          name: attr.name,
          options: attr.values,
          variation: attr.usedForVariations,
        })),
        variations: data.variations.map((variation) => ({
          attributes: variation.attributes,
          sku: variation.sku || null,
          price: parseFloat(variation.price) || 0,
          regular_price: parseFloat(variation.price) || 0,
          sale_price: variation.compareAtPrice
            ? parseFloat(variation.compareAtPrice)
            : null,
          stock_quantity: variation.stockQuantity,
          image: variation.image || null,
          enabled: variation.enabled,
        })),
      };

      await createMutation.mutateAsync(productData);
      
      // Clear draft after successful creation
      const draftKey = `product_draft_${currentTenantId}`;
      localStorage.removeItem(draftKey);
    } catch (error: any) {
      console.error('[testing] Error creating product:', error);
      alert(error.message || 'Failed to create product. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getVariationLabel = (variation: typeof data.variations[0]): string => {
    const attrPairs = Object.entries(variation.attributes).map(
      ([key, value]) => `${key}: ${value}`
    );
    return attrPairs.length > 0 ? attrPairs.join(', ') : 'Default';
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Review all the information below before creating your product. You can
          go back to any step to make changes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {data.name || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Type:</span>{' '}
                {data.productType === 'simple' ? 'Simple Product' : 'Variable Product'}
              </div>
              <div>
                <span className="font-medium">Description:</span>{' '}
                {data.description ? (
                  <span className="text-muted-foreground">
                    {data.description.substring(0, 100)}
                    {data.description.length > 100 ? '...' : ''}
                  </span>
                ) : (
                  'Not set'
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attributes (Variable only) */}
        {data.productType === 'variable' && data.attributes.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Attributes</h3>
              <div className="space-y-2 text-sm">
                {data.attributes.map((attr, index) => (
                  <div key={index}>
                    <span className="font-medium">{attr.name}:</span>{' '}
                    {attr.values.join(', ')}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Variations (Variable only) */}
        {data.productType === 'variable' && data.variations.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Variations</h3>
              <div className="space-y-2 text-sm">
                {data.variations.map((variation, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{getVariationLabel(variation)}</div>
                    <div className="text-muted-foreground">
                      Price: ${parseFloat(variation.price || '0').toFixed(2)}
                      {variation.sku && ` | SKU: ${variation.sku}`}
                      {variation.stockQuantity > 0 &&
                        ` | Stock: ${variation.stockQuantity}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Pricing & Inventory</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Regular Price:</span> $
                {parseFloat(data.regularPrice || '0').toFixed(2)}
              </div>
              {data.salePrice && (
                <div>
                  <span className="font-medium">Sale Price:</span> $
                  {parseFloat(data.salePrice).toFixed(2)}
                </div>
              )}
              {data.sku && (
                <div>
                  <span className="font-medium">SKU:</span> {data.sku}
                </div>
              )}
              {data.manageStock && (
                <div>
                  <span className="font-medium">Stock Quantity:</span>{' '}
                  {data.stockQuantity}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Images</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Main Image:</span>{' '}
                {data.mainImage ? (
                  <span className="text-green-600">✓ Set</span>
                ) : (
                  <span className="text-red-600">✗ Not set</span>
                )}
              </div>
              {data.galleryImages.length > 0 && (
                <div>
                  <span className="font-medium">Gallery Images:</span>{' '}
                  {data.galleryImages.length} image(s)
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories & Tags */}
        {(data.categories.length > 0 ||
          data.tags.length > 0 ||
          data.metaTitle ||
          data.metaDescription) && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Categories & SEO</h3>
              <div className="space-y-2 text-sm">
                {data.categories.length > 0 && (
                  <div>
                    <span className="font-medium">Categories:</span>{' '}
                    {data.categories.length} selected
                  </div>
                )}
                {data.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span> {data.tags.join(', ')}
                  </div>
                )}
                {data.metaTitle && (
                  <div>
                    <span className="font-medium">Meta Title:</span> {data.metaTitle}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Additional Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Status:</span>{' '}
                {data.status === 'publish' ? 'Published' : 'Draft'}
              </div>
              <div>
                <span className="font-medium">Featured:</span>{' '}
                {data.featured ? 'Yes' : 'No'}
              </div>
              {(data.weight || data.length || data.width || data.height) && (
                <div>
                  <span className="font-medium">Shipping:</span>{' '}
                  {data.weight && `Weight: ${data.weight}kg`}
                  {(data.length || data.width || data.height) &&
                    ` | Dimensions: ${data.length || '0'} x ${data.width || '0'} x ${
                      data.height || '0'
                    } cm`}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          size="lg"
          className="min-w-[150px]"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Product
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
