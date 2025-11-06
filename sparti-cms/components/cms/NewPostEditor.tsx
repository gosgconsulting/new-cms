import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Calendar,
  User,
  Tag,
  FileText,
  Globe,
  Clock,
  X,
  Plus,
  ChevronDown,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '../auth/AuthProvider';
import TiptapEditor from './TiptapEditor';

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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    loadTags();
    loadUsers();
  }, []);

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

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/terms/taxonomy/category');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('[testing] Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await fetch('/api/terms/taxonomy/post_tag');
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

  const handleCategoryToggle = (categoryId: number) => {
    setPostData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleTagToggle = (tagId: number) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName,
          taxonomy: 'post_tag',
          description: `Tag for ${newTagName} content`
        })
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags(prev => [...prev, newTag]);
        setPostData(prev => ({ ...prev, tags: [...prev.tags, newTag.id] }));
        setNewTagName('');
        setShowAddTag(false);
        toast({
          title: "Tag Created",
          description: `"${newTagName}" tag has been created and added to this post.`
        });
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
        published_at: status === 'published' ? new Date().toISOString() : postData.published_at
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

  // Helper function to strip HTML tags for text analysis
  const stripHTML = (html: string): string => {
    if (!html) return '';
    if (typeof window === 'undefined') {
      // SSR fallback: simple regex to remove HTML tags
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    }
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getSelectedCategories = () => {
    return categories.filter(cat => postData.categories.includes(cat.id));
  };

  const getSelectedTags = () => {
    return tags.filter(tag => postData.tags.includes(tag.id));
  };

  const getAuthorName = () => {
    const author = users.find(u => u.id === postData.author_id);
    return author ? `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {initialData ? 'Edit Post' : 'Create New Post'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {postData.title || 'Untitled Post'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSave('draft')}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              size="sm"
              onClick={() => handleSave('published')}
              disabled={isSaving || !postData.title.trim()}
            >
              <Globe className="h-4 w-4 mr-2" />
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {!showPreview ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Title */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-base font-medium">
                        Post Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter your post title..."
                        value={postData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="text-lg font-medium mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="slug" className="text-sm font-medium text-muted-foreground">
                        URL Slug
                      </Label>
                      <Input
                        id="slug"
                        placeholder="post-url-slug"
                        value={postData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        URL: /blog/{postData.slug || 'post-slug'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="content">Post Content</Label>
                      <div className="mt-2">
                        <TiptapEditor
                          content={postData.content}
                          onChange={(html) => handleInputChange('content', html)}
                          placeholder="Write your post content here..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        placeholder="Brief summary of your post..."
                        value={postData.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used in post previews and meta descriptions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    SEO & Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="seo" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                      <TabsTrigger value="social">Social Media</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="seo" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <Input
                          id="meta_title"
                          placeholder="SEO title for search engines"
                          value={postData.meta_title}
                          onChange={(e) => handleInputChange('meta_title', e.target.value)}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {postData.meta_title.length}/60 characters
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea
                          id="meta_description"
                          placeholder="Description for search engine results"
                          value={postData.meta_description}
                          onChange={(e) => handleInputChange('meta_description', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {postData.meta_description.length}/160 characters
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="meta_keywords">Keywords</Label>
                        <Input
                          id="meta_keywords"
                          placeholder="keyword1, keyword2, keyword3"
                          value={postData.meta_keywords}
                          onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="social" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="og_title">Open Graph Title</Label>
                        <Input
                          id="og_title"
                          placeholder="Title for Facebook, LinkedIn, etc."
                          value={postData.og_title}
                          onChange={(e) => handleInputChange('og_title', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="og_description">Open Graph Description</Label>
                        <Textarea
                          id="og_description"
                          placeholder="Description for social media sharing"
                          value={postData.og_description}
                          onChange={(e) => handleInputChange('og_description', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label htmlFor="twitter_title">Twitter Title</Label>
                        <Input
                          id="twitter_title"
                          placeholder="Title for Twitter cards"
                          value={postData.twitter_title}
                          onChange={(e) => handleInputChange('twitter_title', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="twitter_description">Twitter Description</Label>
                        <Textarea
                          id="twitter_description"
                          placeholder="Description for Twitter cards"
                          value={postData.twitter_description}
                          onChange={(e) => handleInputChange('twitter_description', e.target.value)}
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4 mt-4">
                      <div className="text-sm text-muted-foreground">
                        Advanced SEO settings like canonical URLs, robots meta, and structured data will be available in future updates.
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Preview Mode */
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <article className="prose prose-lg max-w-none">
                    <h1 className="text-3xl font-bold mb-4">{postData.title || 'Untitled Post'}</h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                      <span>By {getAuthorName()}</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString()}</span>
                      <span>•</span>
                      <Badge variant="outline">{postData.status}</Badge>
                    </div>
                    
                    {postData.excerpt && (
                      <div className="bg-muted/50 p-4 rounded-lg mb-6">
                        <p className="text-muted-foreground italic">{postData.excerpt}</p>
                      </div>
                    )}
                    
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: postData.content || '<p class="text-muted-foreground">No content yet...</p>' 
                      }}
                    />
                    
                    {(getSelectedCategories().length > 0 || getSelectedTags().length > 0) && (
                      <div className="mt-8 pt-6 border-t">
                        {getSelectedCategories().length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-muted-foreground">Categories: </span>
                            {getSelectedCategories().map(cat => (
                              <Badge key={cat.id} variant="secondary" className="mr-2">
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {getSelectedTags().length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Tags: </span>
                            {getSelectedTags().map(tag => (
                              <Badge key={tag.id} variant="outline" className="mr-2">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border bg-muted/30 p-6 space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Settings className="h-4 w-4 mr-2" />
                Publish Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Author</Label>
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
              
              {postData.status === 'scheduled' && (
                <div>
                  <Label className="text-sm font-medium">Publish Date</Label>
                  <Input
                    type="datetime-local"
                    value={postData.published_at ? new Date(postData.published_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Tag className="h-4 w-4 mr-2" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`cat-${category.id}`}
                        checked={postData.categories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="rounded border-gray-300"
                      />
                      <Label 
                        htmlFor={`cat-${category.id}`} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddTag(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`tag-${tag.id}`}
                        checked={postData.tags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded border-gray-300"
                      />
                      <Label 
                        htmlFor={`tag-${tag.id}`} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Selected Tags Display */}
              {getSelectedTags().length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-1">
                    {getSelectedTags().map(tag => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        className="text-xs cursor-pointer"
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Word Count:</span>
                <span>{stripHTML(postData.content).split(/\s+/).filter(word => word.length > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Character Count:</span>
                <span>{stripHTML(postData.content).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reading Time:</span>
                <span>{Math.ceil(stripHTML(postData.content).split(/\s+/).length / 200)} min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add New Tag Dialog */}
      <Dialog open={showAddTag} onOpenChange={setShowAddTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to categorize your content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newTagName">Tag Name</Label>
              <Input
                id="newTagName"
                placeholder="Enter tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTag(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewTag} disabled={!newTagName.trim()}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewPostEditor;
