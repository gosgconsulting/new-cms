import React, { useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ProductWizardData, ProductVariation } from '../ProductCreationWizard';

interface VariationsStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
}

// Generate all combinations of attribute values
function generateVariations(attributes: { name: string; values: string[] }[]): Record<string, string>[] {
  if (attributes.length === 0) return [{}];
  
  const combinations: Record<string, string>[] = [];
  
  function generate(index: number, current: Record<string, string>) {
    if (index >= attributes.length) {
      combinations.push({ ...current });
      return;
    }
    
    const attr = attributes[index];
    attr.values.forEach((value) => {
      generate(index + 1, { ...current, [attr.name]: value });
    });
  }
  
  generate(0, {});
  return combinations;
}

export default function VariationsStep({
  data,
  updateData,
  errors,
}: VariationsStepProps) {
  // Generate variations from attributes when attributes change
  useEffect(() => {
    if (data.attributes.length > 0) {
      const attributeCombinations = generateVariations(
        data.attributes.filter((attr) => attr.usedForVariations)
      );
      
      // Create variations for new combinations
      const existingVariations = data.variations;
      const newVariations: ProductVariation[] = attributeCombinations.map((combo) => {
        // Check if variation already exists
        const existing = existingVariations.find((v) =>
          Object.keys(combo).every(
            (key) => v.attributes[key] === combo[key]
          )
        );
        
        if (existing) {
          return existing;
        }
        
        return {
          id: `var_${Date.now()}_${Math.random()}`,
          attributes: combo,
          price: data.regularPrice || '0',
          compareAtPrice: data.salePrice || '',
          stockQuantity: data.stockQuantity || 0,
          enabled: true,
        };
      });
      
      // Remove variations that no longer match any combination
      const validVariations = newVariations.filter((newVar) => {
        return attributeCombinations.some((combo) =>
          Object.keys(combo).every(
            (key) => newVar.attributes[key] === combo[key]
          )
        );
      });
      
      updateData({ variations: validVariations });
    } else if (data.variations.length === 0) {
      // If no attributes, create a default variation
      updateData({
        variations: [
          {
            id: `var_${Date.now()}`,
            attributes: {},
            price: data.regularPrice || '0',
            compareAtPrice: data.salePrice || '',
            stockQuantity: data.stockQuantity || 0,
            enabled: true,
          },
        ],
      });
    }
  }, [JSON.stringify(data.attributes), data.regularPrice, data.salePrice, data.stockQuantity]);

  const updateVariation = (id: string, updates: Partial<ProductVariation>) => {
    updateData({
      variations: data.variations.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  };

  const getVariationLabel = (variation: ProductVariation): string => {
    const attrPairs = Object.entries(variation.attributes).map(
      ([key, value]) => `${key}: ${value}`
    );
    return attrPairs.length > 0 ? attrPairs.join(', ') : 'Default';
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Configure each variation with its own price, SKU, stock, and image.
          Variations are automatically generated from your attributes.
        </p>
      </div>

      {errors.variations && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.variations}</p>
        </div>
      )}

      <div className="space-y-4">
        {data.variations.map((variation) => (
          <div
            key={variation.id}
            className="p-4 border rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <h4 className="font-semibold">{getVariationLabel(variation)}</h4>
                {Object.keys(variation.attributes).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Default variation
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`enabled_${variation.id}`} className="text-sm">
                  Enabled
                </Label>
                <Switch
                  id={`enabled_${variation.id}`}
                  checked={variation.enabled}
                  onCheckedChange={(checked) =>
                    updateVariation(variation.id, { enabled: checked })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`sku_${variation.id}`}>SKU</Label>
                <Input
                  id={`sku_${variation.id}`}
                  value={variation.sku || ''}
                  onChange={(e) =>
                    updateVariation(variation.id, { sku: e.target.value })
                  }
                  className="mt-1"
                  placeholder="e.g., VAR-001"
                />
              </div>

              <div>
                <Label htmlFor={`price_${variation.id}`}>
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`price_${variation.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={variation.price}
                  onChange={(e) =>
                    updateVariation(variation.id, { price: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor={`comparePrice_${variation.id}`}>
                  Compare at Price
                </Label>
                <Input
                  id={`comparePrice_${variation.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={variation.compareAtPrice || ''}
                  onChange={(e) =>
                    updateVariation(variation.id, {
                      compareAtPrice: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor={`stock_${variation.id}`}>Stock Quantity</Label>
                <Input
                  id={`stock_${variation.id}`}
                  type="number"
                  min="0"
                  value={variation.stockQuantity}
                  onChange={(e) =>
                    updateVariation(variation.id, {
                      stockQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`image_${variation.id}`}>Variation Image URL</Label>
              <Input
                id={`image_${variation.id}`}
                value={variation.image || ''}
                onChange={(e) =>
                  updateVariation(variation.id, { image: e.target.value })
                }
                className="mt-1"
                placeholder="https://..."
              />
              {variation.image && (
                <div className="mt-2">
                  <img
                    src={variation.image}
                    alt={getVariationLabel(variation)}
                    className="h-24 w-24 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.variations.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            No variations available. Please add attributes in the previous step.
          </p>
        </div>
      )}
    </div>
  );
}
