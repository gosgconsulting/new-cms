import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, Edit, Trash2, X, Save, Search, ChevronDown, ChevronUp, FileJson } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProductCreationWizard from './ProductCreationWizard';
import ProductEditTable from './ProductEditTable';
import BulkProductEditTable from './BulkProductEditTable';
import ProductJsonViewer from './ProductJsonViewer';
import ProductVariantTable from './ProductVariantTable';

interface Product {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductsManagerProps {
  currentTenantId: string;
}

export default function ProductsManager({ currentTenantId }: ProductsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', currentTenantId, searchTerm],
    queryFn: async () => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }
      
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await api.get(`/api/shop/products?${params.toString()}`, { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }
      const response = await api.delete(`/api/shop/products/${productId}`, { tenantId: currentTenantId });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', currentTenantId] });
    },
  });

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    deleteMutation.mutate(productId);
  };

  const handleEdit = (productId: number) => {
    setEditingProductId(productId);
    setShowCreateForm(false);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingProductId(null);
    setShowBulkEdit(false);
  };

  const filteredProducts = products.filter((product: Product) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.slug.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          {!showBulkEdit && (
            <Button variant="outline" onClick={() => setShowBulkEdit(true)} disabled={showCreateForm || !!editingProductId}>
              Bulk Edit
            </Button>
          )}
          {!showCreateForm && !editingProductId && (
            <Button onClick={() => setShowCreateForm(true)} disabled={showBulkEdit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Product Creation Wizard */}
      {showCreateForm && (
        <ProductCreationWizard
          currentTenantId={currentTenantId}
          onSuccess={() => {
            setShowCreateForm(false);
            queryClient.invalidateQueries({ queryKey: ['products', currentTenantId] });
          }}
          onCancel={handleCancel}
        />
      )}

      {/* Bulk Edit Table */}
      {showBulkEdit && (
        <BulkProductEditTable
          currentTenantId={currentTenantId}
          onClose={handleCancel}
        />
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : filteredProducts.length === 0 && !showCreateForm ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products found</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product: Product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              isEditing={editingProductId === product.product_id}
              onEdit={() => handleEdit(product.product_id)}
              onDelete={() => handleDelete(product.product_id)}
              onCancel={handleCancel}
              currentTenantId={currentTenantId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  currentTenantId: string;
}

interface ProductVariant {
  id: number;
  sku: string | null;
  title: string;
  price: number | string; // Can be string from PostgreSQL numeric type
  compare_at_price: number | string | null; // Can be string from PostgreSQL numeric type
  inventory_quantity: number;
  inventory_management: boolean;
}

function ProductCard({ product, isEditing, onEdit, onDelete, onCancel, currentTenantId }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState(false);

  // Fetch variants when expanded
  const { data: variants = [], isLoading: isLoadingVariants, error: variantsError } = useQuery({
    queryKey: ['product-variants', product.product_id, product.slug, currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) {
        return [];
      }
      
      // Fetch variants - the endpoint now supports both ID and slug
      // Try with slug first (more reliable for mapping between tables)
      try {
        const response = await api.get(`/api/shop/products/${product.slug}/variants`, { tenantId: currentTenantId });
        if (response.ok) {
          const result = await response.json();
          return Array.isArray(result.data) ? result.data : [];
        }
      } catch (e) {
        // If slug fails, try with product_id
        try {
          const response = await api.get(`/api/shop/products/${product.product_id}/variants`, { tenantId: currentTenantId });
          if (response.ok) {
            const result = await response.json();
            return Array.isArray(result.data) ? result.data : [];
          }
        } catch (e2) {
          console.warn('[testing] Could not fetch variants:', e2);
        }
      }
      
      return [];
    },
    enabled: isExpanded && !!currentTenantId,
    retry: 1,
  });

  if (isEditing) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardContent className="p-6">
          {isLoadingVariants ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading product data...
            </div>
          ) : (
            <ProductEditTable
              product={product}
              variants={variants}
              currentTenantId={currentTenantId}
              onSuccess={onCancel}
              onCancel={onCancel}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-20 w-20 rounded-lg object-cover border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">/{product.slug}</p>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {isLoadingVariants ? (
                      <p className="text-sm text-gray-500">Loading variants...</p>
                    ) : variantsError ? (
                      <p className="text-sm text-red-500">Error loading variants</p>
                    ) : variants.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Product Variants</h4>
                        <div className="space-y-1">
                          {variants.map((variant: ProductVariant) => {
                            const price = parseFloat(String(variant.price || 0));
                            const comparePrice = variant.compare_at_price ? parseFloat(String(variant.compare_at_price)) : null;
                            
                            return (
                              <div
                                key={variant.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{variant.title}</span>
                                    {variant.sku && (
                                      <span className="text-xs text-gray-500">SKU: {variant.sku}</span>
                                    )}
                                  </div>
                                  {variant.inventory_management && (
                                    <span className="text-xs text-gray-500">
                                      Stock: {variant.inventory_quantity}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {comparePrice && comparePrice > price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      ${comparePrice.toFixed(2)}
                                    </span>
                                  )}
                                  <span className="text-sm font-semibold text-gray-900">
                                    ${price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No variants available</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJsonViewer(true)}
                  title="View complete product data as JSON"
                >
                  <FileJson className="h-4 w-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      More
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* JSON Viewer Dialog */}
      <ProductJsonViewer
        productId={product.product_id}
        productSlug={product.slug}
        currentTenantId={currentTenantId}
        open={showJsonViewer}
        onOpenChange={setShowJsonViewer}
      />
    </Card>
  );
}

interface ProductFormProps {
  product?: Product | null;
  currentTenantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function ProductForm({ product, currentTenantId, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [price, setPrice] = useState(product?.price?.toString() || '0');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Fetch variants when editing existing product
  const { data: variants = [], isLoading: isLoadingVariants } = useQuery({
    queryKey: ['product-variants', product?.product_id, product?.slug, currentTenantId],
    queryFn: async () => {
      if (!product || !currentTenantId) {
        return [];
      }
      
      try {
        // Try with slug first
        const response = await api.get(`/api/shop/products/${product.slug}/variants`, { tenantId: currentTenantId });
        if (response.ok) {
          const result = await response.json();
          return Array.isArray(result.data) ? result.data : [];
        }
      } catch (e) {
        // If slug fails, try with product_id
        try {
          const response = await api.get(`/api/shop/products/${product.product_id}/variants`, { tenantId: currentTenantId });
          if (response.ok) {
            const result = await response.json();
            return Array.isArray(result.data) ? result.data : [];
          }
        } catch (e2) {
          console.warn('[testing] Could not fetch variants:', e2);
        }
      }
      
      return [];
    },
    enabled: !!product && !!currentTenantId,
    retry: 1,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }
      
      const url = product
        ? `/api/shop/products/${product.product_id}`
        : '/api/shop/products';
      const method = product ? 'put' : 'post';
      
      const response = await api[method](url, data, { tenantId: currentTenantId });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', currentTenantId] });
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await saveMutation.mutateAsync({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price: parseFloat(price),
        description: description || '',
        image_url: imageUrl || null,
      });
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!product && !slug) {
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
              }
            }}
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from name"
            required
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            URL-friendly version of the product name
          </p>
        </div>

        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1"
          />
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-32 w-32 object-cover rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Variants Table - Only show when editing existing product */}
      {product && (
        <div className="md:col-span-2 pt-4 border-t">
          {isLoadingVariants ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading variants...
            </div>
          ) : (
            <ProductVariantTable
              productId={product.product_id}
              productSlug={product.slug}
              variants={variants}
              currentTenantId={currentTenantId}
            />
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}