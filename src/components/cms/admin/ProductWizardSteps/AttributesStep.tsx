import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductWizardData, ProductAttribute } from '../ProductCreationWizard';

interface AttributesStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
}

export default function AttributesStep({
  data,
  updateData,
  errors,
}: AttributesStepProps) {
  const addAttribute = () => {
    const newAttribute: ProductAttribute = {
      id: `attr_${Date.now()}`,
      name: '',
      values: [],
      usedForVariations: true,
    };
    updateData({
      attributes: [...data.attributes, newAttribute],
    });
  };

  const removeAttribute = (id: string) => {
    updateData({
      attributes: data.attributes.filter((attr) => attr.id !== id),
    });
  };

  const updateAttribute = (id: string, updates: Partial<ProductAttribute>) => {
    updateData({
      attributes: data.attributes.map((attr) =>
        attr.id === id ? { ...attr, ...updates } : attr
      ),
    });
  };

  const updateAttributeValues = (id: string, valuesString: string) => {
    const values = valuesString
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    updateAttribute(id, { values });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Define attributes for your variable product (e.g., Size, Color, Material).
          These will be used to generate product variations.
        </p>
      </div>

      {errors.attributes && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.attributes}</p>
        </div>
      )}

      <div className="space-y-4">
        {data.attributes.map((attribute, index) => (
          <div
            key={attribute.id}
            className="p-4 border rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Attribute {index + 1}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttribute(attribute.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor={`attr_${attribute.id}_name`}>
                Attribute Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`attr_${attribute.id}_name`}
                value={attribute.name}
                onChange={(e) =>
                  updateAttribute(attribute.id, { name: e.target.value })
                }
                className={`mt-1 ${
                  errors[`attribute_${index}_name`] ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Size, Color, Material"
              />
              {errors[`attribute_${index}_name`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`attribute_${index}_name`]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor={`attr_${attribute.id}_values`}>
                Attribute Values <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`attr_${attribute.id}_values`}
                value={attribute.values.join(', ')}
                onChange={(e) =>
                  updateAttributeValues(attribute.id, e.target.value)
                }
                className={`mt-1 ${
                  errors[`attribute_${index}_values`] ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Small, Medium, Large (comma-separated)"
              />
              {errors[`attribute_${index}_values`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`attribute_${index}_values`]}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple values with commas
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addAttribute}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Attribute
      </Button>

      {data.attributes.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Preview: Variation Combinations
          </p>
          <p className="text-xs text-blue-700">
            {data.attributes.length > 0
              ? `This will generate ${data.attributes.reduce(
                  (total, attr) => total * Math.max(attr.values.length, 1),
                  1
                )} variation${data.attributes.reduce(
                  (total, attr) => total * Math.max(attr.values.length, 1),
                  1
                ) > 1 ? 's' : ''}`
              : 'Add attributes to see preview'}
          </p>
        </div>
      )}
    </div>
  );
}
