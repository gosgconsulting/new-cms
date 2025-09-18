import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BlogPostTable from "./blog/BlogPostTable";
import BlogPostDialog from "./blog/BlogPostDialog";
import CategoryManager from "./blog/CategoryManager";
import TagManager from "./blog/TagManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

type BlogPostStatus = 'draft' | 'published' | 'archived';

const BlogManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image: "",
    status: "draft" as BlogPostStatus,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    categories: [] as string[],
    tags: [] as string[],
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Tag[];
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const postData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image: data.featured_image,
        status: data.status,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        published_at: data.status === 'published' ? new Date().toISOString() : null,
      };
      
      const { data: newPost, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();
      
      if (error) throw error;

      // Handle categories
      if (data.categories.length > 0) {
        const categoryRelations = data.categories.map(categoryId => ({
          post_id: newPost.id,
          category_id: categoryId
        }));
        
        const { error: categoryError } = await supabase
          .from('blog_post_categories')
          .insert(categoryRelations);
        
        if (categoryError) throw categoryError;
      }

      // Handle tags
      if (data.tags.length > 0) {
        const tagRelations = data.tags.map(tagId => ({
          post_id: newPost.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('blog_post_tags')
          .insert(tagRelations);
        
        if (tagError) throw tagError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Blog post created successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating post", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const postData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image: data.featured_image,
        status: data.status,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        published_at: data.status === 'published' && !editingPost?.published_at 
          ? new Date().toISOString() 
          : editingPost?.published_at,
      };
      
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);
      
      if (error) throw error;

      // Update categories
      await supabase.from('blog_post_categories').delete().eq('post_id', id);
      if (data.categories.length > 0) {
        const categoryRelations = data.categories.map(categoryId => ({
          post_id: id,
          category_id: categoryId
        }));
        
        const { error: categoryError } = await supabase
          .from('blog_post_categories')
          .insert(categoryRelations);
        
        if (categoryError) throw categoryError;
      }

      // Update tags
      await supabase.from('blog_post_tags').delete().eq('post_id', id);
      if (data.tags.length > 0) {
        const tagRelations = data.tags.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('blog_post_tags')
          .insert(tagRelations);
        
        if (tagError) throw tagError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      setIsEditDialogOpen(false);
      setEditingPost(null);
      resetForm();
      toast({ title: "Blog post updated successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating post", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: "Blog post deleted successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting post", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featured_image: "",
      status: "draft" as BlogPostStatus,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      categories: [],
      tags: [],
    });
  };

  const handleEdit = async (post: BlogPost) => {
    setEditingPost(post);
    
    // Fetch post categories and tags
    const [categoriesRes, tagsRes] = await Promise.all([
      supabase
        .from('blog_post_categories')
        .select('category_id')
        .eq('post_id', post.id),
      supabase
        .from('blog_post_tags')
        .select('tag_id')
        .eq('post_id', post.id)
    ]);

    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      featured_image: post.featured_image || "",
      status: post.status,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      meta_keywords: post.meta_keywords || "",
      categories: categoriesRes.data?.map(c => c.category_id) || [],
      tags: tagsRes.data?.map(t => t.tag_id) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createPostMutation.mutate(formData);
    }
  };

  if (isLoading) return <div>Loading blog posts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Manager</h1>
          <p className="text-muted-foreground">Create and manage your blog posts, categories, and tags</p>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                Manage your blog posts, edit content, and change publication status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogPostTable
                posts={posts}
                onEdit={handleEdit}
                onDelete={(id) => deletePostMutation.mutate(id)}
                isDeleting={deletePostMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="tags">
          <TagManager />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <BlogPostDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Create New Blog Post"
        description="Fill in the details to create a new blog post."
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={createPostMutation.isPending}
        submitLabel="Create Post"
        categories={categories || []}
        tags={tags || []}
      />

      {/* Edit Dialog */}
      <BlogPostDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Blog Post"
        description="Update the blog post details."
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={updatePostMutation.isPending}
        submitLabel="Update Post"
        categories={categories || []}
        tags={tags || []}
      />
    </div>
  );
};

export default BlogManager;
