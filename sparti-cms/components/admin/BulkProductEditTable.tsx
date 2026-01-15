import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelTable, { ColumnDef } from './ExcelTable';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface BulkProductRow {
  id?: number;
  product_id?: number;
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

// Helper to normalize truthy values to boolean
const toBoolean = (val: unknown): boolean =>
  val === true || val === 'true' || val === 1 || val === '1';

interface BulkProductEditTableProps {
  currentTenantId: string;
  onClose: () => void;
}

export default function BulkProductEditTable({
  currentTenantId,
  onClose,
}: BulkProductEditTableProps) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<BulkProductRow[]>([]);
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string>>({});

  // Fetch all products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', currentTenantId, 'all'],
    queryFn: async () => {
      if (!currentTenantId) {
        return [];
      }
      
      const response = await api.get(`/api/shop/products`, { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  // Fetch variants for all products
  const { data: allVariants = {}, isLoading: isLoadingVariants } = useQuery({
    queryKey: ['all-product-variants', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId || products.length === 0) {
        return {};
      }

      const variantsMap: Record<number, any[]> = {};
      
      // Fetch variants for each product
      await Promise.all(
        products.map(async (product: any) => {
          try {
            const response = await api.get(
              `/api/shop/products/${product.slug || product.product_id}/variants`,
              { tenantId: currentTenantId }
            );
            if (response.ok) {
              const result = await response.json();
              variantsMap[product.product_id] = result.data || [];
            }
          } catch (e) {
            console.warn(`[testing] Could not fetch variants for product ${product.product_id}:`, e);
            variantsMap[product.product_id] = [];
          }
        })
      );

      return variantsMap;
    },
    enabled: !!currentTenantId && products.length > 0,
  });

  // Build rows from products and variants
  useEffect(() => {
    if (products.length === 0 || isLoadingProducts || isLoadingVariants) {
      return;
    }

    const newRows: BulkProductRow[] = [];
    
    products.forEach((product: any) => {
      // Add product row
      newRows.push({
        id: product.product_id,
        product_id: product.product_id,
        type: 'product',
        name: product.name,
        slug: product.slug,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
        gallery_images: [],
      });

      // Add variant rows for this product
      const variants = allVariants[product.product_id] || [];
      variants.forEach((variant: any) => {
        newRows.push({
          id: variant.id,
          product_id: product.product_id,
          type: 'variant',
          sku: variant.sku,
          title: variant.title,
          price: variant.price,
          compare_at_price: variant.compare_at_price,
          inventory_quantity: variant.inventory_quantity,
          inventory_management: variant.inventory_management,
        });
      });
    });

    setRows(newRows);
  }, [products, allVariants, isLoadingProducts, isLoadingVariants]);

  // Parse attributes from variant titles (format: "Color: Red, Size: Large")
  const parseAttributes = (title: string): Record<string, string> => {
    const attributes: Record<string, string> = {};
    if (!title || title === 'Default') return attributes;
    
    const parts = title.split(',').map(p => p.trim());
    parts.forEach(part => {
      const match = part.match(/^(.+?):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        attributes[key.trim()] = value.trim();
      }
    });
    return attributes;
  };

  // Extract unique attribute names and values from all variants
  const attributeMetadata = useMemo(() => {
    const attributeMap: Record<string, Set<string>> = {};
    
    rows.forEach(row => {
      if (row.type === 'variant' && row.title) {
        const attrs = parseAttributes(row.title);
        Object.entries(attrs).forEach(([key, value]) => {
          if (!attributeMap[key]) {
            attributeMap[key] = new Set();
          }
          attributeMap[key].add(value);
        });
      }
    });

    // Convert Sets to sorted arrays
    const result: Record<string, string[]> = {};
    Object.entries(attributeMap).forEach(([key, values]) => {
      result[key] = Array.from(values).sort();
    });

    return result;
  }, [rows]);

  // Filter rows based on attribute filters
  const filteredRows = useMemo(() => {
    if (Object.keys(attributeFilters).length === 0) {
      return rows;
    }

    return rows.filter(row => {
      // Always show product rows
      if (row.type === 'product') {
        return true;
      }

      // For variant rows, check if they match all active filters
      if (row.type === 'variant' && row.title) {
        const attrs = parseAttributes(row.title);
        
        // Check if variant matches all selected filters
        return Object.entries(attributeFilters).every(([key, value]) => {
          if (!value || value === 'all') return true; // No filter selected
          return attrs[key] === value;
        });
      }

      return true;
    });
  }, [rows, attributeFilters]);

  const saveMutation = useMutation({
    mutationFn: async (updatedRows: BulkProductRow[]) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }

      // Group rows by product
      const productsMap = new Map<number, { product: BulkProductRow; variants: BulkProductRow[] }>();
      
      updatedRows.forEach(row => {
        if (row.type === 'product' && row.product_id) {
          if (!productsMap.has(row.product_id)) {
            productsMap.set(row.product_id, { product: row, variants: [] });
          }
        } else if (row.type === 'variant' && row.product_id) {
          if (!productsMap.has(row.product_id)) {
            // Create product entry if missing
            productsMap.set(row.product_id, { 
              product: updatedRows.find(r => r.product_id === row.product_id && r.type === 'product') || {} as BulkProductRow,
              variants: [] 
            });
          }
          productsMap.get(row.product_id)!.variants.push(row);
        }
      });

      // Update each product and its variants
      const results = [];
      for (const [productId, { product, variants }] of productsMap.entries()) {
        try {
          // Update product
          const productResponse = await api.put(
            `/api/shop/products/${productId}`,
            {
              name: product.name,
              slug: product.slug,
              price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
              description: product.description || '',
              image_url: product.image_url || null,
            },
            { tenantId: currentTenantId }
          );

          if (!productResponse.ok) {
            const errorData = await productResponse.json().catch(() => ({}));
            throw new Error(`Product ${productId}: ${errorData.error || 'Failed to update'}`);
          }

          // Update variants
          const identifier = product.slug || productId;
          const variantsResponse = await api.put(
            `/api/shop/products/${identifier}/variants`,
            { 
              variants: variants.map(v => ({
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
                inventory_management: toBoolean((v as any).inventory_management),
              }))
            },
            { tenantId: currentTenantId }
          );

          if (!variantsResponse.ok) {
            const errorData = await variantsResponse.json().catch(() => ({}));
            throw new Error(`Variants for product ${productId}: ${errorData.error || 'Failed to update'}`);
          }

          results.push({ productId, success: true });
        } catch (error: any) {
          results.push({ productId, success: false, error: error.message });
        }
      }

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        throw new Error(`Failed to update ${failed.length} product(s). First error: ${failed[0].error}`);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', currentTenantId] });
      queryClient.invalidateQueries({ queryKey: ['all-product-variants', currentTenantId] });
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });

  const handleDataChange = (newFilteredRows: BulkProductRow[]) => {
    // When data changes, we need to update the original rows array
    // Create a map of row identifiers to find original rows
    const rowMap = new Map<string, BulkProductRow>();
    rows.forEach(row => {
      const key = row.type === 'product' 
        ? `product-${row.product_id}` 
        : `variant-${row.id}`;
      rowMap.set(key, row);
    });

    // Update rows by matching IDs
    const newRows = rows.map(row => {
      const key = row.type === 'product' 
        ? `product-${row.product_id}` 
        : `variant-${row.id}`;
      
      // Find the updated row in the filtered rows
      const updatedRow = newFilteredRows.find(nr => {
        const nKey = nr.type === 'product' 
          ? `product-${nr.product_id}` 
          : `variant-${nr.id}`;
        return nKey === key;
      });

      return updatedRow || row;
    });

    setRows(newRows);
  };

  const handleAttributeFilterChange = (attributeName: string, value: string) => {
    setAttributeFilters(prev => {
      const newFilters = { ...prev };
      if (value === 'all' || !value) {
        delete newFilters[attributeName];
      } else {
        newFilters[attributeName] = value;
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setAttributeFilters({});
  };

  const handleSave = async () => {
    try {
      // Always save all rows, not just filtered ones
      await saveMutation.mutateAsync(rows);
      alert('All products saved successfully!');
      onClose();
    } catch (error: any) {
      console.error('[testing] Error saving products:', error);
      alert(error.message || 'Failed to save some products. Please check the console for details.');
    }
  };

  const createNewVariant = (): BulkProductRow => {
    // Find the last product_id from the rows to assign to new variant
    // Look for the most recent product row
    let lastProductId: number | undefined;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].type === 'product' && rows[i].product_id) {
        lastProductId = rows[i].product_id;
        break;
      }
    }

    // If no product found, use the first product's ID
    if (!lastProductId && rows.length > 0) {
      const firstProduct = rows.find(r => r.type === 'product');
      lastProductId = firstProduct?.product_id;
    }

    return {
      type: 'variant',
      product_id: lastProductId,
      sku: null,
      title: 'New Variant',
      price: 0,
      compare_at_price: null,
      inventory_quantity: 0,
      inventory_management: true,
    };
  };

  const columns: ColumnDef<BulkProductRow>[] = [
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
          return null;
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

  if (isLoadingProducts || isLoadingVariants) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading products and variants...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Bulk Edit Products</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              All Products ({products.length} products, {rows.filter(r => r.type === 'variant').length} variants)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Edit all products and their variants in one table. Product rows are highlighted in yellow.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Attribute Filters */}
            {Object.keys(attributeMetadata).length > 0 && (
              <div className="flex items-center gap-2 mr-4 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
                {Object.entries(attributeMetadata).map(([attrName, values]) => (
                  <div key={attrName} className="flex items-center gap-1">
                    <label className="text-xs text-gray-600 whitespace-nowrap">{attrName}:</label>
                    <Select
                      value={attributeFilters[attrName] || 'all'}
                      onValueChange={(value) => handleAttributeFilterChange(attrName, value)}
                    >
                      <SelectTrigger className="h-8 w-[120px] text-xs">
                        <SelectValue placeholder={`All ${attrName}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {attrName}</SelectItem>
                        {values.map(value => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {Object.keys(attributeFilters).length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
              {saveMutation.isPending ? 'Saving...' : 'Save All Products'}
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
          <ExcelTable
            data={filteredRows}
            columns={columns}
            onDataChange={handleDataChange}
            onRowAdd={createNewVariant}
            showRowNumbers={true}
            className="w-full"
          />
        </div>
        
        {Object.keys(attributeFilters).length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredRows.filter(r => r.type === 'product').length} products and {filteredRows.filter(r => r.type === 'variant').length} variants (filtered)
          </p>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          <span className="inline-block w-4 h-4 bg-yellow-200 border border-gray-400 mr-1 align-middle"></span>
          Product rows | 
          <span className="ml-2">Use horizontal scroll to see all columns</span>
        </p>
        
        {saveMutation.isError && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-200">
            <strong>Error:</strong> {saveMutation.error instanceof Error 
              ? saveMutation.error.message 
              : 'Failed to save products'}
          </div>
        )}
        
        {saveMutation.isSuccess && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm border border-green-200">
            All products saved successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}