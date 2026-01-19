import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Send,
  X,
  Plus,
  Calendar,
  Image as ImageIcon,
  FileText,
  Video,
  Quote,
  Link as LinkIcon,
  Music,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Clock,
  Layout,
  Megaphone,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '../auth/AuthProvider';
import RichTextEditor from './RichTextEditor';
import FeaturedImageSelector from './FeaturedImageSelector';
import ExpandableCard from '../ui/ExpandableCard';
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
  featured_image_id?: number;
  featured_image_url?: string;
  featured_image_alt?: string;
  featured_image_meta?: string;
  post_format?: 'standard' | 'aside' | 'image' | 'video' | 'quote' | 'link' | 'audio';
  visibility?: 'public' | 'password' | 'private';
  template?: string;
  promotion?: boolean;
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
    post_format: 'standard',
    visibility: 'public',
    template: 'default',
    promotion: false,
    ...initialData
  });

  // Data states
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);

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
      const existingTag = tags.find(t => t.name.toLowerCase() === newTagName.toLowerCase());
      if (existingTag) {
        if (!postData.tags.includes(existingTag.id)) {
          setPostData(prev => ({ ...prev, tags: [...prev.tags, existingTag.id] }));
        }
        setNewTagName('');
        return;
      }

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
        categories: Array.isArray(postData.categories) ? postData.categories : [],
        tags: Array.isArray(postData.tags) ? postData.tags : [],
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

  const formatOptions = [
    { value: 'standard', label: 'Standard', icon: FileText },
    { value: 'aside', label: 'Aside', icon: FileText },
    { value: 'image', label: 'Image', icon: ImageIcon },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'quote', label: 'Quote', icon: Quote },
    { value: 'link', label: 'Link', icon: LinkIcon },
    { value: 'audio', label: 'Audio', icon: Music },
  ];

  const renderEditButton = (field: string) => (
    <button
      type="button"
      onClick={() => setEditingField(editingField === field ? null : field)}
      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
    >
      Edit
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData ? `Edit: ${postData.title || 'Untitled Post'}` : 'Add New Post'}
          </h1>
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-2" />
            Dismiss
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <Input
                placeholder="Legend Of X, Part 3"
                value={postData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-2xl font-semibold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Add Media Button */}
            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Media
              </Button>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <RichTextEditor
                content={postData.content}
                onChange={(html) => handleInputChange('content', html)}
                placeholder="Start writing or type / to choose a block"
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publish Card */}
            <ExpandableCard title="Publish" defaultExpanded={true}>
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status: </span>
                    <span className="text-sm text-gray-600 capitalize">{postData.status}</span>
                  </div>
                  {renderEditButton('status')}
                </div>
                {editingField === 'status' && (
                  <Select 
                    value={postData.status} 
                    onValueChange={(value: any) => {
                      handleInputChange('status', value);
                      setEditingField(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Visibility */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Visibility: </span>
                    <span className="text-sm text-gray-600 capitalize">{postData.visibility || 'Public'}</span>
                  </div>
                  {renderEditButton('visibility')}
                </div>
                {editingField === 'visibility' && (
                  <Select 
                    value={postData.visibility || 'public'} 
                    onValueChange={(value: any) => {
                      handleInputChange('visibility', value);
                      setEditingField(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="password">Password Protected</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Schedule */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Schedule: </span>
                    <span className="text-sm text-gray-600">
                      {postData.published_at ? new Date(postData.published_at).toLocaleDateString() : 'Off'}
                    </span>
                  </div>
                  {renderEditButton('schedule')}
                </div>
                {editingField === 'schedule' && (
                  <Input
                    type="datetime-local"
                    value={postData.published_at ? new Date(postData.published_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      handleInputChange('published_at', e.target.value ? new Date(e.target.value).toISOString() : null);
                      setEditingField(null);
                    }}
                  />
                )}

                {/* Template */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Template: </span>
                    <span className="text-sm text-gray-600 capitalize">{postData.template || 'Default'}</span>
                  </div>
                  {renderEditButton('template')}
                </div>
                {editingField === 'template' && (
                  <Select 
                    value={postData.template || 'default'} 
                    onValueChange={(value: any) => {
                      handleInputChange('template', value);
                      setEditingField(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Promotion */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Promotion: </span>
                    <span className="text-sm text-gray-600">{postData.promotion ? 'On' : 'Off'}</span>
                  </div>
                  {renderEditButton('promotion')}
                </div>
                {editingField === 'promotion' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={postData.promotion || false}
                      onCheckedChange={(checked) => {
                        handleInputChange('promotion', checked);
                        setEditingField(null);
                      }}
                    />
                    <Label>Enable promotion</Label>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleSave('draft')}
                    disabled={isSaving}
                    variant="cms-secondary"
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSave('published')}
                    disabled={isSaving || !postData.title.trim()}
                    variant="cms-primary"
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </ExpandableCard>

            {/* Format Card */}
            <ExpandableCard title="Format" defaultExpanded={true}>
              <RadioGroup
                value={postData.post_format || 'standard'}
                onValueChange={(value: any) => handleInputChange('post_format', value)}
              >
                <div className="space-y-2">
                  {formatOptions.map((format) => {
                    const Icon = format.icon;
                    return (
                      <div key={format.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={format.value} id={format.value} />
                        <Label htmlFor={format.value} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          <span>{format.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </ExpandableCard>

            {/* Featured Image Card */}
            <ExpandableCard title="Image Settings" defaultExpanded={true}>
              <FeaturedImageSelector
                imageUrl={postData.featured_image_url}
                imageId={postData.featured_image_id}
                altText={postData.featured_image_alt || ''}
                metaDescription={postData.featured_image_meta || ''}
                onImageChange={(url, imageId) => {
                  handleInputChange('featured_image_url', url);
                  if (imageId) handleInputChange('featured_image_id', imageId);
                }}
                onAltTextChange={(altText) => handleInputChange('featured_image_alt', altText)}
                onMetaDescriptionChange={(meta) => handleInputChange('featured_image_meta', meta)}
              />
            </ExpandableCard>

            {/* Page Attributes Card */}
            <ExpandableCard title="Page Attributes" defaultExpanded={false}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Select 
                    value={postData.author_id.toString()} 
                    onValueChange={(value) => handleInputChange('author_id', parseInt(value))}
                  >
                    <SelectTrigger>
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
                        placeholder="Add a tag"
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
              </div>
            </ExpandableCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPostEditor;