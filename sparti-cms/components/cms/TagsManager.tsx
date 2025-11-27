import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  Hash,
  TrendingUp,
  FileText,
  X
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
import { toast } from "@/components/ui/use-toast";

interface TagType {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  post_count: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

const TagsManager: React.FC = () => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [bulkTags, setBulkTags] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('[testing] Error loading tags:', error);
      toast({
        title: "Error",
        description: "Failed to load tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTag ? `/api/tags/${editingTag.id}` : '/api/tags';
      const method = editingTag ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingTag ? 'update' : 'create'} tag`);

      toast({
        title: "Success",
        description: `Tag ${editingTag ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      setEditingTag(null);
      resetForm();
      loadTags();
    } catch (error) {
      console.error('[testing] Error saving tag:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingTag ? 'update' : 'create'} tag. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkTags.trim()) return;

    try {
      const tagNames = bulkTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const promises = tagNames.map(async (tagName) => {
        const slug = generateSlug(tagName);
        return fetch('/api/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: tagName,
            slug,
            description: `Content related to ${tagName}`,
            meta_title: `${tagName} - GO SG Digital Marketing`,
            meta_description: `Learn about ${tagName} with GO SG's expert insights and strategies.`
          }),
        });
      });

      await Promise.all(promises);

      toast({
        title: "Success",
        description: `${tagNames.length} tags created successfully.`,
      });

      setBulkTags('');
      setShowBulkAdd(false);
      loadTags();
    } catch (error) {
      console.error('[testing] Error bulk creating tags:', error);
      toast({
        title: "Error",
        description: "Failed to create some tags. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      meta_title: tag.meta_title || '',
      meta_description: tag.meta_description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tag');

      toast({
        title: "Success",
        description: "Tag deleted successfully.",
      });

      loadTags();
    } catch (error) {
      console.error('[testing] Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
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

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      meta_title: '',
      meta_description: ''
    });
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort tags by usage count
  const sortedTags = filteredTags.sort((a, b) => (b.post_count || 0) - (a.post_count || 0));

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
              <Tag className="mr-2 h-6 w-6 text-brandPurple" />
              Tags Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage content tags for better content discovery and SEO
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowBulkAdd(!showBulkAdd)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Bulk Add
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-brandPurple hover:bg-brandPurple/90"
                  onClick={() => {
                    setEditingTag(null);
                    resetForm();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Tag
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTag ? 'Edit Tag' : 'Create New Tag'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTag 
                      ? 'Update the tag details below.' 
                      : 'Create a new tag to categorize your content.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Tag Name *</Label>
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
                      placeholder="Brief description of this tag..."
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
                      {editingTag ? 'Update Tag' : 'Create Tag'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bulk Add Section */}
        {showBulkAdd && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium mb-2">Bulk Add Tags</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Enter multiple tag names separated by commas. SEO fields will be auto-generated.
            </p>
            <div className="flex gap-2">
              <Textarea
                value={bulkTags}
                onChange={(e) => setBulkTags(e.target.value)}
                placeholder="SEO Tips, Digital Marketing, Content Strategy, Link Building..."
                rows={3}
                className="flex-1"
              />
              <div className="flex flex-col gap-2">
                <Button onClick={handleBulkAdd} disabled={!bulkTags.trim()}>
                  Add Tags
                </Button>
                <Button variant="outline" onClick={() => setShowBulkAdd(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTags.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No tags found</p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first tag
              </Button>
            </div>
          ) : (
            sortedTags.map((tag) => (
              <div key={tag.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground flex items-center">
                      <Hash className="mr-1 h-4 w-4 text-brandPurple" />
                      {tag.name}
                    </h3>
                    <code className="text-xs text-muted-foreground bg-gray-100 px-1 rounded">
                      /{tag.slug}
                    </code>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {tag.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {tag.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="mr-1 h-3 w-3" />
                    <span>{tag.post_count || 0} posts</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {tag.meta_title && (
                      <Badge variant="outline" className="text-xs">
                        SEO
                      </Badge>
                    )}
                    {(tag.post_count || 0) > 5 && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        <TrendingUp className="mr-1 h-2 w-2" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Tags</p>
                <p className="text-2xl font-bold text-blue-900">{tags.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Tagged Posts</p>
                <p className="text-2xl font-bold text-green-900">
                  {tags.reduce((sum, tag) => sum + (tag.post_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Popular Tags</p>
                <p className="text-2xl font-bold text-purple-900">
                  {tags.filter(tag => (tag.post_count || 0) > 5).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Hash className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">SEO Optimized</p>
                <p className="text-2xl font-bold text-orange-900">
                  {tags.filter(tag => tag.meta_title && tag.meta_description).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsManager;
