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

interface PricingStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
}

export default function PricingStep({
  data,
  updateData,
  errors,
}: PricingStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {data.productType === 'variable'
            ? 'Set default pricing for variations. You can override these for individual variations in the next step.'
            : 'Set the pricing and inventory information for your product.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="regularPrice">
            Regular Price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="regularPrice"
            type="number"
            step="0.01"
            min="0"
            value={data.regularPrice}
            onChange={(e) => updateData({ regularPrice: e.target.value })}
            className={`mt-1 ${errors.regularPrice ? 'border-red-500' : ''}`}
            placeholder="0.00"
          />
          {errors.regularPrice && (
            <p className="text-sm text-red-500 mt-1">{errors.regularPrice}</p>
          )}
        </div>

        <div>
          <Label htmlFor="salePrice">Sale Price</Label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            min="0"
            value={data.salePrice}
            onChange={(e) => updateData({ salePrice: e.target.value })}
            className="mt-1"
            placeholder="0.00 (optional)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty if not on sale
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
        <Input
          id="sku"
          value={data.sku}
          onChange={(e) => updateData({ sku: e.target.value })}
          className="mt-1"
          placeholder="e.g., PROD-001"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Unique identifier for inventory tracking (optional)
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="manageStock">Manage Stock</Label>
            <p className="text-xs text-muted-foreground">
              Enable stock management for this product
            </p>
          </div>
          <Switch
            id="manageStock"
            checked={data.manageStock}
            onCheckedChange={(checked) =>
              updateData({ manageStock: checked })
            }
          />
        </div>

        {data.manageStock && (
          <>
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={data.stockQuantity}
                onChange={(e) =>
                  updateData({ stockQuantity: parseInt(e.target.value) || 0 })
                }
                className={`mt-1 ${
                  errors.stockQuantity ? 'border-red-500' : ''
                }`}
                placeholder="0"
              />
              {errors.stockQuantity && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.stockQuantity}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="backorders">Backorder Status</Label>
              <Select
                value={data.backorders}
                onValueChange={(value: 'no' | 'notify' | 'yes') =>
                  updateData({ backorders: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Do not allow</SelectItem>
                  <SelectItem value="notify">Allow, but notify customer</SelectItem>
                  <SelectItem value="yes">Allow</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                What to do when product is out of stock
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
