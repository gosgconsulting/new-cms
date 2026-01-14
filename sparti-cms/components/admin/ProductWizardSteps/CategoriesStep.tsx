import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '../../../utils/api';
import { ProductWizardData } from '../ProductCreationWizard';

interface CategoriesStepProps {
  data: ProductWizardData;
  updateData: (updates: Partial<ProductWizardData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  currentTenantId: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategoriesStep({
  data,
  updateData,
  currentTenantId,
}: CategoriesStepProps) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['product-categories', currentTenantId],
    queryFn: async () => {
      const response = await api.get('/api/shop/categories', {
        tenantId: currentTenantId,
      });
      if (!response.ok) {
        return [];
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  const toggleCategory = (categoryId: number) => {
    const isSelected = data.categories.includes(categoryId);
    if (isSelected) {
      updateData({
        categories: data.categories.filter((id) => id !== categoryId),
      });
    } else {
      updateData({
        categories: [...data.categories, categoryId],
      });
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    updateData({ tags });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Organize your product with categories and tags for better
          discoverability and SEO.
        </p>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Product Categories
        </Label>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-3">
            No categories available. Create one below.
          </p>
        ) : (
          <div className="space-y-2 border rounded-lg p-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category_${category.id}`}
                  checked={data.categories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <Label
                  htmlFor={`category_${category.id}`}
                  className="font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="tags">Product Tags</Label>
        <Input
          id="tags"
          value={data.tags.join(', ')}
          onChange={handleTagsChange}
          className="mt-1"
          placeholder="tag1, tag2, tag3 (comma-separated)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate multiple tags with commas
        </p>
      </div>

      <div className="pt-4 border-t space-y-4">
        <Label className="text-base font-semibold">SEO Settings</Label>

        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={data.metaTitle}
            onChange={(e) => updateData({ metaTitle: e.target.value })}
            className="mt-1"
            placeholder="SEO-optimized title (optional)"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {data.metaTitle.length}/60 characters
          </p>
        </div>

        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Input
            id="metaDescription"
            value={data.metaDescription}
            onChange={(e) => updateData({ metaDescription: e.target.value })}
            className="mt-1"
            placeholder="SEO-optimized description (optional)"
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {data.metaDescription.length}/160 characters
          </p>
        </div>
      </div>
    </div>
  );
}
