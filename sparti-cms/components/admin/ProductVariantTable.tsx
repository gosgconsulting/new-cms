import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelTable, { ColumnDef } from './ExcelTable';
import { api } from '../../utils/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export interface ProductVariant {
  id?: number;
  sku: string | null;
  title: string;
  price: number | string;
  compare_at_price: number | string | null;
  inventory_quantity: number;
  inventory_management: boolean;
}

interface ProductVariantTableProps {
  productId: number;
  productSlug: string;
  variants: ProductVariant[];
  currentTenantId: string;
  onVariantsChange?: (variants: ProductVariant[]) => void;
}

export default function ProductVariantTable({
  productId,
  productSlug,
  variants: initialVariants,
  currentTenantId,
  onVariantsChange,
}: ProductVariantTableProps) {
  const queryClient = useQueryClient();
  const [variants, setVariants] = React.useState<ProductVariant[]>(initialVariants);

  // Update local state when initialVariants change
  React.useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  const updateVariantsMutation = useMutation({
    mutationFn: async (updatedVariants: ProductVariant[]) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }

      // Prefer slug over productId for API calls (more reliable for mapping between tables)
      const identifier = productSlug || productId;
      const response = await api.put(
        `/api/shop/products/${identifier}/variants`,
        { variants: updatedVariants },
        { tenantId: currentTenantId }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update variants');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate variants query to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['product-variants', productId, productSlug, currentTenantId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['products', currentTenantId] 
      });
    },
  });

  const handleDataChange = (newVariants: ProductVariant[]) => {
    setVariants(newVariants);
    if (onVariantsChange) {
      onVariantsChange(newVariants);
    }
    // Auto-save on change (debounced could be added here)
  };

  const handleSave = async () => {
    try {
      await updateVariantsMutation.mutateAsync(variants);
    } catch (error: any) {
      console.error('[testing] Error saving variants:', error);
      alert(error.message || 'Failed to save variants. Please try again.');
    }
  };

  const createNewVariant = (): ProductVariant => {
    return {
      sku: null,
      title: 'New Variant',
      price: 0,
      compare_at_price: null,
      inventory_quantity: 0,
      inventory_management: true,
    };
  };

  const columns: ColumnDef<ProductVariant>[] = [
    {
      key: 'sku',
      label: 'SKU',
      type: 'string',
      width: '150px',
      validate: (value) => {
        // SKU validation is optional, no errors
        return null;
      },
    },
    {
      key: 'title',
      label: 'Title',
      type: 'string',
      width: '200px',
      validate: (value) => {
        if (!value || value.trim() === '') {
          return 'Title is required';
        }
        return null;
      },
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      width: '120px',
      format: (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '0.00' : num.toFixed(2);
      },
      parse: (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      },
      validate: (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num < 0) {
          return 'Price must be a positive number';
        }
        return null;
      },
    },
    {
      key: 'compare_at_price',
      label: 'Compare at Price',
      type: 'number',
      width: '150px',
      format: (value) => {
        if (value === null || value === undefined || value === '') {
          return '';
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '' : num.toFixed(2);
      },
      parse: (value) => {
        if (value === '' || value === null || value === undefined) {
          return null;
        }
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      },
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return null; // Optional field
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num < 0) {
          return 'Compare at price must be a positive number';
        }
        return null;
      },
    },
    {
      key: 'inventory_quantity',
      label: 'Inventory',
      type: 'number',
      width: '120px',
      format: (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '0' : Math.floor(num).toString();
      },
      parse: (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : Math.floor(num);
      },
      validate: (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
          return 'Inventory must be a non-negative integer';
        }
        return null;
      },
    },
    {
      key: 'inventory_management',
      label: 'Manage Stock',
      type: 'boolean',
      width: '120px',
      render: (value, row, isEditing) => {
        if (isEditing) {
          return (
            <div className="flex items-center justify-center h-full">
              <Checkbox
                checked={value === true || value === 'true' || value === 1}
                onCheckedChange={(checked) => {
                  const newVariants = [...variants];
                  const index = variants.indexOf(row);
                  if (index >= 0) {
                    newVariants[index] = { ...row, inventory_management: checked === true };
                    handleDataChange(newVariants);
                  }
                }}
              />
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center">
            {value ? '✓' : ''}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
        <Button
          type="button"
          onClick={handleSave}
          disabled={updateVariantsMutation.isPending}
          className="text-sm"
        >
          {updateVariantsMutation.isPending ? 'Saving...' : 'Save Variants'}
        </Button>
      </div>
      
      <ExcelTable
        data={variants}
        columns={columns}
        onDataChange={handleDataChange}
        onRowAdd={createNewVariant}
        showRowNumbers={true}
        className="w-full"
      />
      
      {updateVariantsMutation.isError && (
        <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-200">
          <strong>Error:</strong> {updateVariantsMutation.error instanceof Error 
            ? updateVariantsMutation.error.message 
            : 'Failed to save variants'}
        </div>
      )}
      
      {updateVariantsMutation.isSuccess && (
        <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm border border-green-200">
          Variants saved successfully!
        </div>
      )}
    </div>
  );
}
