import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2,
  Pencil
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import NewPostEditor from './NewPostEditor';
import { useAuth } from '../auth/AuthProvider';
import api from '../../utils/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'private' | 'trash';
  post_type: string;
  author_id: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  terms: Array<{
    id: number;
    name: string;
    taxonomy: string;
  }>;
  author?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

const PostsManager: React.FC = () => {
  const { currentTenantId, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Array<{id: number; email: string; first_name?: string; last_name?: string}>>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (currentTenantId) {
      loadPosts();
      loadUsers();
    }
  }, [currentTenantId, user]);

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

  const loadPosts = async () => {
    if (!currentTenantId) return;
    try {
      setLoading(true);
      const response = await api.get(`/api/posts?tenantId=${currentTenantId}`, {
        headers: { 'X-Tenant-Id': currentTenantId }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load posts.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: any) => {
    try {
      const response = await api.post('/api/posts', postData);

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setShowNewPost(false);
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('[testing] Error creating post:', error);
      throw error;
    }
  };

  const handleUpdatePost = async (postData: any) => {
    if (!editingPost) return;

    try {
      const response = await api.put(`/api/posts/${editingPost.id}`, postData);

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p));
        setEditingPost(null);
        toast({
          title: "Success",
          description: "Post updated successfully!",
        });
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      console.error('[testing] Error updating post:', error);
      throw error;
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await api.delete(`/api/posts/${postId}?tenantId=${currentTenantId}`, {
        headers: { 'X-Tenant-Id': currentTenantId || '' },
      });

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast({
          title: "Success",
          description: "Post deleted successfully!",
        });
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('[testing] Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive"
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.terms?.some(term => term.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Also search by author name
    const author = users.find(u => u.id === post.author_id);
    if (author) {
      const authorName = `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email;
      if (authorName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
    }
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      private: "bg-gray-100 text-gray-800",
      trash: "bg-red-100 text-red-800"
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || statusColors.draft}`}>
        {status}
      </span>
    );
  };

  const getAuthorName = (authorId: number) => {
    const author = users.find(u => u.id === authorId);
    if (author) {
      return `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email;
    }
    return 'Unknown';
  };

  const getPostTags = (post: Post) => {
    return post.terms?.filter(t => t.taxonomy === 'post_tag').map(t => t.name) || [];
  };

  // Show New Post Editor
  if (showNewPost) {
    return (
      <NewPostEditor
        onBack={() => setShowNewPost(false)}
        onSave={handleCreatePost}
      />
    );
  }

  // Show Edit Post Editor
  if (editingPost) {
    return (
      <NewPostEditor
        onBack={() => setEditingPost(null)}
        onSave={handleUpdatePost}
        initialData={{
          title: editingPost.title,
          slug: editingPost.slug,
          content: editingPost.content,
          excerpt: editingPost.excerpt,
          status: ((editingPost.status === 'trash' ? 'draft' : editingPost.status) as 'published' | 'draft' | 'private' | 'scheduled'),
          author_id: editingPost.author_id,
          published_at: editingPost.published_at,
          categories: editingPost.terms?.filter(t => t.taxonomy === 'category').map(t => t.id) || [],
          tags: editingPost.terms?.filter(t => t.taxonomy === 'post_tag').map(t => t.id) || [],
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          og_title: '',
          og_description: '',
          twitter_title: '',
          twitter_description: '',
        }}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Posts</h2>
        <Button onClick={() => setShowNewPost(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title, author, or tag"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading posts...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first post.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowNewPost(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => {
            const tags = getPostTags(post);
            const authorName = getAuthorName(post.author_id);
            const tagText = tags.length > 0 ? ` - ${tags.join(', ')}` : '';
            
            return (
              <div key={post.id} className="bg-white rounded-lg border p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    by {authorName}{tagText}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPost(post)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostsManager;