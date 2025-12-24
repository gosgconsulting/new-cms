import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderTree, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

interface ProductCategoriesManagerProps {
  currentTenantId: string;
}

export default function ProductCategoriesManager({ currentTenantId }: ProductCategoriesManagerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', currentTenantId],
    queryFn: async () => {
      const response = await api.get('/api/shop/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await api.delete(`/api/shop/categories/${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentTenantId] });
    },
  });

  const toggleExpand = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category & { children?: Category[] }>();
    const rootCategories: Category[] = [];

    // First pass: create map of all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id === null) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(category);
        }
      }
    });

    return rootCategories;
  };

  const renderCategory = (category: Category & { children?: Category[] }, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="mb-1">
        <div
          className={`flex items-center justify-between p-2 rounded hover:bg-secondary ${
            level > 0 ? 'ml-6' : ''
          }`}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="mr-2 p-1 hover:bg-secondary rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <FolderTree className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{category.name}</span>
            <span className="ml-2 text-sm text-muted-foreground">({category.slug})</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCategory(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to delete this category?')) {
                  deleteMutation.mutate(category.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const categoryTree = buildCategoryTree(categories);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your products with categories</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading categories...</div>
      ) : categoryTree.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories found</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Category Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {categoryTree.map(category => renderCategory(category))}
            </div>
          </CardContent>
        </Card>
      )}

      {(showCreateDialog || editingCategory) && (
        <ProductCategoryDialog
          category={editingCategory}
          categories={categories}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingCategory(null);
          }}
          currentTenantId={currentTenantId}
        />
      )}
    </div>
  );
}

interface ProductCategoryDialogProps {
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  currentTenantId: string;
}

function ProductCategoryDialog({ category, categories, onClose, currentTenantId }: ProductCategoryDialogProps) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [parentId, setParentId] = useState<number | null>(category?.parent_id || null);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = category
        ? `/api/shop/categories/${category.id}`
        : '/api/shop/categories';
      const method = category ? 'put' : 'post';
      
      const response = await api[method](url, data);
      if (!response.ok) {
        throw new Error('Failed to save category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentTenantId] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await saveMutation.mutateAsync({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description: description || null,
        parent_id: parentId || null,
      });
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out current category and its children from parent options
  const availableParents = categories.filter(
    cat => !category || (cat.id !== category.id && cat.parent_id !== category.id)
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="parentId">Parent Category</Label>
            <select
              id="parentId"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="">None (Root Category)</option>
              {availableParents.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

