import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProductWizardData } from '../ProductCreationWizard';

interface BasicInfoStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
}

export default function BasicInfoStep({
  data,
  updateData,
  errors,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
          placeholder="Enter product name"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="shortDescription">Short Description</Label>
        <Textarea
          id="shortDescription"
          value={data.shortDescription}
          onChange={(e) => updateData({ shortDescription: e.target.value })}
          className="mt-1"
          rows={3}
          placeholder="Brief description that appears in product listings"
        />
        <p className="text-xs text-muted-foreground mt-1">
          A brief summary of the product (optional)
        </p>
      </div>

      <div>
        <Label htmlFor="description">Full Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
          rows={8}
          placeholder="Detailed product description (optional)"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Full product description with details, features, and benefits (optional)
        </p>
      </div>

      <div>
        <Label>
          Product Type <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={data.productType}
          onValueChange={(value: 'simple' | 'variable') =>
            updateData({ productType: value })
          }
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="simple" id="simple" />
            <Label htmlFor="simple" className="font-normal cursor-pointer">
              Simple Product
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6 mb-2">
            A single product with no variations (e.g., a book, a t-shirt in one size)
          </p>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="variable" id="variable" />
            <Label htmlFor="variable" className="font-normal cursor-pointer">
              Variable Product
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            A product with variations (e.g., t-shirt in different sizes and colors)
          </p>
        </RadioGroup>
      </div>
    </div>
  );
}
