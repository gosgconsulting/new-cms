import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderTree,
  Hash,
  Globe,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '../auth/AuthProvider';
import api from '../../utils/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent_id: number | null;
  count: number;
  post_count: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

const CategoriesManager: React.FC = () => {
  const { currentTenantId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    parent_id: null as number | null
  });

  useEffect(() => {
    if (currentTenantId) {
      loadCategories();
    }
  }, [currentTenantId]);

  const loadCategories = async () => {
    if (!currentTenantId) return;
    try {
      setLoading(true);
      const response = await api.get(`/api/categories?tenantId=${currentTenantId}`, {
        headers: { 'X-Tenant-Id': currentTenantId }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('[testing] Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const data = {
        ...formData,
        tenantId: currentTenantId
      };
      
      const response = editingCategory 
        ? await api.put(url, data, { headers: { 'X-Tenant-Id': currentTenantId } })
        : await api.post(url, data, { headers: { 'X-Tenant-Id': currentTenantId } });

      if (!response.ok) throw new Error(`Failed to ${editingCategory ? 'update' : 'create'} category`);

      toast({
        title: "Success",
        description: `Category ${editingCategory ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        parent_id: null
      });
      loadCategories();
    } catch (error) {
      console.error('[testing] Error saving category:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingCategory ? 'update' : 'create'} category. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      meta_title: category.meta_title || '',
      meta_description: category.meta_description || '',
      parent_id: category.parent_id
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    if (!currentTenantId) return;

    try {
      const response = await api.delete(`/api/categories/${categoryId}?tenantId=${currentTenantId}`, {
        headers: { 'X-Tenant-Id': currentTenantId }
      });

      if (!response.ok) throw new Error('Failed to delete category');

      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });

      loadCategories();
    } catch (error) {
      console.error('[testing] Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
      meta_title: prev.meta_title || `${name} - GO SG Digital Marketing`
    }));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              <FolderTree className="mr-2 h-6 w-6 text-brandPurple" />
              Categories Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your content with categories for better navigation and SEO
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-brandPurple hover:bg-brandPurple/90"
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    meta_title: '',
                    meta_description: '',
                    parent_id: null
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Update the category details below.' 
                    : 'Create a new category to organize your content.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., SEO Tips"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="seo-tips"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="meta_title">SEO Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO-optimized title for search engines"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">SEO Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO meta description (150-160 characters recommended)"
                    rows={2}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-brandPurple hover:bg-brandPurple/90">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>SEO Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <FolderTree className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No categories found</p>
                      <Button variant="outline" className="mt-2" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first category
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        /{category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {category.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{category.post_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {category.meta_title && (
                          <Badge variant="outline" className="text-xs">
                            <Hash className="mr-1 h-3 w-3" />
                            Title
                          </Badge>
                        )}
                        {category.meta_description && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="mr-1 h-3 w-3" />
                            Desc
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FolderTree className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Categories</p>
                <p className="text-2xl font-bold text-blue-900">{categories.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Posts</p>
                <p className="text-2xl font-bold text-green-900">
                  {categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">SEO Optimized</p>
                <p className="text-2xl font-bold text-purple-900">
                  {categories.filter(cat => cat.meta_title && cat.meta_description).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;
