import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Send,
  X,
  Plus,
  Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '../auth/AuthProvider';
import TiptapEditor from './TiptapEditor';
import api from '../../utils/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface PostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'private' | 'scheduled';
  author_id: number;
  published_at: string | null;
  categories: number[];
  tags: number[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  twitter_title: string;
  twitter_description: string;
}

interface NewPostEditorProps {
  onBack: () => void;
  onSave: (postData: PostData) => Promise<void>;
  initialData?: Partial<PostData>;
}

const NewPostEditor: React.FC<NewPostEditorProps> = ({ onBack, onSave, initialData }) => {
  const { user, currentTenantId } = useAuth();
  const [isSaving, setSaving] = useState(false);
  
  // Form data state
  const [postData, setPostData] = useState<PostData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    author_id: (typeof user?.id === 'number' ? user.id : 1),
    published_at: null,
    categories: [],
    tags: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    twitter_title: '',
    twitter_description: '',
    ...initialData
  });

  // Data states
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTagName, setNewTagName] = useState('');

  // Load data on component mount and when tenant changes
  useEffect(() => {
    if (currentTenantId) {
      loadTags();
      loadUsers();
    }
  }, [currentTenantId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (postData.title && !initialData?.slug) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setPostData(prev => ({ ...prev, slug }));
    }
  }, [postData.title, initialData?.slug]);

  // Auto-generate meta fields from content
  useEffect(() => {
    if (postData.title && !postData.meta_title) {
      setPostData(prev => ({ 
        ...prev, 
        meta_title: postData.title,
        og_title: postData.title,
        twitter_title: postData.title
      }));
    }
    
    if (postData.excerpt && !postData.meta_description) {
      setPostData(prev => ({ 
        ...prev, 
        meta_description: postData.excerpt,
        og_description: postData.excerpt,
        twitter_description: postData.excerpt
      }));
    }
  }, [postData.title, postData.excerpt]);

  const loadTags = async () => {
    if (!currentTenantId) return;
    try {
      const response = await api.get(`/api/tags?tenantId=${currentTenantId}`, {
        headers: { 'X-Tenant-Id': currentTenantId }
      });
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('[testing] Error loading tags:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('[testing] Error loading users:', error);
    }
  };

  const handleInputChange = (field: keyof PostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tagId: number) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleRemoveTag = (tagId: number) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(id => id !== tagId)
    }));
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    if (!currentTenantId) {
      toast({
        title: "Error",
        description: "Tenant ID is required to create tags.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if tag already exists
      const existingTag = tags.find(t => t.name.toLowerCase() === newTagName.toLowerCase());
      if (existingTag) {
        // Just add it to the post if not already added
        if (!postData.tags.includes(existingTag.id)) {
          setPostData(prev => ({ ...prev, tags: [...prev.tags, existingTag.id] }));
        }
        setNewTagName('');
        return;
      }

      // Generate slug from tag name
      const slug = newTagName
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const response = await api.post('/api/tags', {
        name: newTagName,
        slug: slug,
        description: `Tag for ${newTagName} content`,
        tenantId: currentTenantId
      }, {
        headers: { 'X-Tenant-Id': currentTenantId }
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags(prev => [...prev, newTag]);
        setPostData(prev => ({ ...prev, tags: [...prev.tags, newTag.id] }));
        setNewTagName('');
      } else {
        throw new Error('Failed to create tag');
      }
    } catch (error) {
      console.error('[testing] Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create new tag.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    setSaving(true);
    try {
      const saveData = { 
        ...postData, 
        status: status || postData.status,
        published_at: status === 'published' ? new Date().toISOString() : postData.published_at,
        // Explicitly include categories and tags
        categories: Array.isArray(postData.categories) ? postData.categories : [],
        tags: Array.isArray(postData.tags) ? postData.tags : [],
        // For super admins, include tenant ID to properly set the post tenant
        ...(user?.is_super_admin && (currentTenantId || user.tenant_id) ? {
          tenantId: currentTenantId || user.tenant_id
        } : {})
      };
      
      await onSave(saveData);
      
      toast({
        title: "Post Saved",
        description: `Post has been saved as ${status || postData.status}.`
      });
    } catch (error) {
      console.error('[testing] Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSelectedTags = () => {
    return tags.filter(tag => postData.tags.includes(tag.id));
  };

  const getAuthorName = () => {
    const author = users.find(u => u.id === postData.author_id);
    return author ? `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {initialData ? `Edit: ${postData.title || 'Untitled Post'}` : 'New Post'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Content and SEO */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Section */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={postData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <div className="mt-2">
                  <TiptapEditor
                    content={postData.content}
                    onChange={(html) => handleInputChange('content', html)}
                    placeholder="This is a sample post to get you started."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  placeholder="Enter meta title..."
                  value={postData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  placeholder="Enter meta description..."
                  value={postData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Publishing */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={postData.status} 
                  onValueChange={(value: any) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="publish_date">Publish date</Label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="publish_date"
                    type="date"
                    value={postData.published_at ? new Date(postData.published_at).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="pl-10"
                    placeholder="Pick a date"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="author">Author</Label>
                <Select 
                  value={postData.author_id.toString()} 
                  onValueChange={(value) => handleInputChange('author_id', parseInt(value))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.email
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add a tag and press Enter"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddNewTag}
                      disabled={!newTagName.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Selected Tags */}
                  {getSelectedTags().length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getSelectedTags().map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag.name}
                          <button
                            onClick={() => handleRemoveTag(tag.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                  className="flex-1"
                  variant="default"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => handleSave('published')}
                  disabled={isSaving || !postData.title.trim()}
                  className="flex-1"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Save & Publish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewPostEditor;
