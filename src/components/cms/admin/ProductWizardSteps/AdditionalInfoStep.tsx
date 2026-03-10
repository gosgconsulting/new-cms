import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductWizardData } from '../ProductCreationWizard';

interface AdditionalInfoStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
}

export default function AdditionalInfoStep({
  data,
  updateData,
}: AdditionalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Set additional product information including shipping details and
          publication status.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Shipping Information
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={data.weight}
                onChange={(e) => updateData({ weight: e.target.value })}
                className="mt-1"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="shippingClass">Shipping Class</Label>
              <Input
                id="shippingClass"
                value={data.shippingClass}
                onChange={(e) => updateData({ shippingClass: e.target.value })}
                className="mt-1"
                placeholder="e.g., standard, express"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">
            Dimensions (cm)
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                min="0"
                value={data.length}
                onChange={(e) => updateData({ length: e.target.value })}
                className="mt-1"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                min="0"
                value={data.width}
                onChange={(e) => updateData({ width: e.target.value })}
                className="mt-1"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                min="0"
                value={data.height}
                onChange={(e) => updateData({ height: e.target.value })}
                className="mt-1"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t space-y-4">
        <div>
          <Label htmlFor="status">Product Status</Label>
          <Select
            value={data.status}
            onValueChange={(value: 'draft' | 'publish') =>
              updateData({ status: value })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="publish">Published</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Draft products are not visible to customers
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="featured">Featured Product</Label>
            <p className="text-xs text-muted-foreground">
              Mark this product as featured
            </p>
          </div>
          <Switch
            id="featured"
            checked={data.featured}
            onCheckedChange={(checked) => updateData({ featured: checked })}
          />
        </div>
      </div>
    </div>
  );
}
