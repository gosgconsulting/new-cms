import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelTable, { ColumnDef } from './ExcelTable';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X } from 'lucide-react';

export interface ProductRow {
  id?: number;
  type: 'product' | 'variant';
  // Product fields
  name?: string;
  slug?: string;
  price?: number | string;
  description?: string;
  image_url?: string | null;
  gallery_images?: string[];
  // Variant fields
  sku?: string | null;
  title?: string;
  compare_at_price?: number | string | null;
  inventory_quantity?: number;
  inventory_management?: boolean;
}

interface ProductEditTableProps {
  product: {
    product_id: number;
    name: string;
    slug: string;
    price: number;
    description: string;
    image_url: string | null;
  };
  variants: Array<{
    id?: number;
    sku: string | null;
    title: string;
    price: number | string;
    compare_at_price: number | string | null;
    inventory_quantity: number;
    inventory_management: boolean;
  }>;
  currentTenantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductEditTable({
  product,
  variants: initialVariants,
  currentTenantId,
  onSuccess,
  onCancel,
}: ProductEditTableProps) {
  const queryClient = useQueryClient();
  
  // Convert product and variants to table rows
  const createInitialRows = (): ProductRow[] => {
    const rows: ProductRow[] = [
      {
        id: product.product_id,
        type: 'product',
        name: product.name,
        slug: product.slug,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
        gallery_images: [],
      },
      ...initialVariants.map(v => ({
        id: v.id,
        type: 'variant' as const,
        sku: v.sku,
        title: v.title,
        price: v.price,
        compare_at_price: v.compare_at_price,
        inventory_quantity: v.inventory_quantity,
        inventory_management: v.inventory_management,
      })),
    ];
    return rows;
  };

  const [rows, setRows] = useState<ProductRow[]>(createInitialRows());

  // Update rows when product or variants change
  useEffect(() => {
    setRows(createInitialRows());
  }, [product, initialVariants]);

  const saveMutation = useMutation({
    mutationFn: async (updatedRows: ProductRow[]) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }

      const productRow = updatedRows.find(r => r.type === 'product');
      const variantRows = updatedRows.filter(r => r.type === 'variant');

      if (!productRow) {
        throw new Error('Product row not found');
      }

      // Update product
      const productResponse = await api.put(
        `/api/shop/products/${product.product_id}`,
        {
          name: productRow.name,
          slug: productRow.slug,
          price: typeof productRow.price === 'string' ? parseFloat(productRow.price) : productRow.price,
          description: productRow.description || '',
          image_url: productRow.image_url || null,
        },
        { tenantId: currentTenantId }
      );

      if (!productResponse.ok) {
        const errorData = await productResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update product');
      }

      // Update variants
      const identifier = product.slug || product.product_id;
      const variantsResponse = await api.put(
        `/api/shop/products/${identifier}/variants`,
        { variants: variantRows.map(v => ({
          id: v.id,
          sku: v.sku,
          title: v.title || 'Default',
          price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
          compare_at_price: v.compare_at_price 
            ? (typeof v.compare_at_price === 'string' ? parseFloat(v.compare_at_price) : v.compare_at_price)
            : null,
          inventory_quantity: typeof v.inventory_quantity === 'string' 
            ? parseInt(v.inventory_quantity) 
            : (v.inventory_quantity || 0),
          inventory_management: v.inventory_management !== false && v.inventory_management !== 'false',
        })) },
        { tenantId: currentTenantId }
      );

      if (!variantsResponse.ok) {
        const errorData = await variantsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update variants');
      }

      return { product: await productResponse.json(), variants: await variantsResponse.json() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', currentTenantId] });
      queryClient.invalidateQueries({ 
        queryKey: ['product-variants', product.product_id, product.slug, currentTenantId] 
      });
      onSuccess();
    },
  });

  const handleDataChange = (newRows: ProductRow[]) => {
    setRows(newRows);
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(rows);
    } catch (error: any) {
      console.error('[testing] Error saving product:', error);
      alert(error.message || 'Failed to save. Please try again.');
    }
  };

  const createNewVariant = (): ProductRow => {
    return {
      type: 'variant',
      sku: null,
      title: 'New Variant',
      price: 0,
      compare_at_price: null,
      inventory_quantity: 0,
      inventory_management: true,
    };
  };

  const columns: ColumnDef<ProductRow>[] = [
    {
      key: 'name',
      label: 'Product Name',
      type: 'string',
      width: '200px',
      readonly: (row) => row.type === 'variant',
      validate: (value, row) => {
        if (row.type === 'product' && (!value || value.toString().trim() === '')) {
          return 'Product name is required';
        }
        return null;
      },
    },
    {
      key: 'slug',
      label: 'Slug (URL)',
      type: 'string',
      width: '180px',
      readonly: (row) => row.type === 'variant',
      validate: (value, row) => {
        if (row.type === 'product' && (!value || value.toString().trim() === '')) {
          return 'Slug is required';
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
        if (value === null || value === undefined || value === '') return '';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '0.00' : num.toFixed(2);
      },
      parse: (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      },
      validate: (value) => {
        if (value === null || value === undefined || value === '') return null;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num < 0) {
          return 'Price must be a positive number';
        }
        return null;
      },
    },
    {
      key: 'description',
      label: 'Description',
      type: 'string',
      width: '300px',
      readonly: (row) => row.type === 'variant',
      format: (value) => {
        if (!value) return '';
        // Show first 100 chars for display
        const str = value.toString();
        return str.length > 100 ? str.substring(0, 100) + '...' : str;
      },
    },
    {
      key: 'image_url',
      label: 'Product Image',
      type: 'string',
      width: '250px',
      readonly: (row) => row.type === 'variant',
      render: (value, row, isEditing) => {
        if (isEditing && row.type === 'product') {
          return null; // Will show input field
        }
        if (value && row.type === 'product') {
          return (
            <div className="flex items-center gap-2">
              <img
                src={value.toString()}
                alt="Product"
                className="h-12 w-12 object-cover rounded border border-gray-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {value.toString().substring(0, 30)}...
              </span>
            </div>
          );
        }
        if (row.type === 'product') {
          return <span className="text-gray-400 text-xs">No image</span>;
        }
        return <span className="text-gray-300 text-xs">-</span>;
      },
    },
    {
      key: 'gallery_images',
      label: 'Gallery Images',
      type: 'string',
      width: '250px',
      readonly: (row) => row.type === 'variant',
      format: (value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return '';
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value.toString();
      },
      parse: (value) => {
        if (!value) return [];
        return value.split(',').map(s => s.trim()).filter(s => s);
      },
    },
    {
      key: 'sku',
      label: 'SKU',
      type: 'string',
      width: '120px',
      readonly: (row) => row.type === 'product',
    },
    {
      key: 'title',
      label: 'Variant Title',
      type: 'string',
      width: '150px',
      readonly: (row) => row.type === 'product',
      validate: (value, row) => {
        if (row.type === 'variant' && (!value || value.toString().trim() === '')) {
          return 'Variant title is required';
        }
        return null;
      },
    },
    {
      key: 'compare_at_price',
      label: 'Compare at Price',
      type: 'number',
      width: '150px',
      readonly: (row) => row.type === 'product',
      format: (value) => {
        if (value === null || value === undefined || value === '') return '';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '' : num.toFixed(2);
      },
      parse: (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      },
      validate: (value) => {
        if (value === null || value === undefined || value === '') return null;
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
      readonly: (row) => row.type === 'product',
      format: (value) => {
        if (value === null || value === undefined || value === '') return '0';
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
      readonly: (row) => row.type === 'product',
      render: (value, row, isEditing) => {
        if (row.type === 'product') {
          return <span className="text-gray-400 text-xs">-</span>;
        }
        if (isEditing) {
          return (
            <div className="flex items-center justify-center h-full">
              <Checkbox
                checked={value === true || value === 'true' || value === 1}
                onCheckedChange={(checked) => {
                  const newRows = [...rows];
                  const index = rows.indexOf(row);
                  if (index >= 0) {
                    newRows[index] = { ...row, inventory_management: checked === true };
                    handleDataChange(newRows);
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
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saveMutation.isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
        <ExcelTable
          data={rows}
          columns={columns}
          onDataChange={handleDataChange}
          onRowAdd={createNewVariant}
          showRowNumbers={true}
          className="w-full"
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        <span className="inline-block w-4 h-4 bg-yellow-200 border border-gray-400 mr-1 align-middle"></span>
        Product row | 
        <span className="ml-2">Use horizontal scroll to see all columns</span>
      </p>
      
      {saveMutation.isError && (
        <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-200">
          <strong>Error:</strong> {saveMutation.error instanceof Error 
            ? saveMutation.error.message 
            : 'Failed to save'}
        </div>
      )}
      
      {saveMutation.isSuccess && (
        <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm border border-green-200">
          Product saved successfully!
        </div>
      )}
    </div>
  );
}
