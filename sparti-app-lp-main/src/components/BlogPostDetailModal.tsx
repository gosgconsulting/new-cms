import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface BlogPost {
  id: string;
  title: string;
  content?: string;
  meta_description?: string;
  meta_title?: string;
  keywords?: string[];
  featured_image?: string;
  status: string;
  author?: string;
  published_date?: string;
  excerpt?: string;
}

interface BlogPostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogPost: BlogPost | null;
}

const BlogPostDetailModal: React.FC<BlogPostDetailModalProps> = ({
  isOpen,
  onClose,
  blogPost,
}) => {
  if (!blogPost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{blogPost.title}</DialogTitle>
          <DialogDescription>
            {blogPost.meta_title && blogPost.meta_title !== blogPost.title && (
              <span className="block">Meta Title: {blogPost.meta_title}</span>
            )}
            {blogPost.author && <span className="block">Author: {blogPost.author}</span>}
            {blogPost.published_date && (
              <span className="block">Published: {new Date(blogPost.published_date).toLocaleDateString()}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Separator />
        
        <ScrollArea className="h-[600px] w-full">
          <div className="space-y-6">
            {/* Featured Image */}
            {blogPost.featured_image && (
              <div>
                <h3 className="font-semibold mb-2">Featured Image</h3>
                <img 
                  src={blogPost.featured_image} 
                  alt="Featured image"
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}

            {/* Meta Description */}
            {blogPost.meta_description && (
              <div>
                <h3 className="font-semibold mb-2">Meta Description</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {blogPost.meta_description}
                </p>
              </div>
            )}

            {/* Excerpt */}
            {blogPost.excerpt && (
              <div>
                <h3 className="font-semibold mb-2">Excerpt</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {blogPost.excerpt}
                </p>
              </div>
            )}

            {/* Keywords */}
            {blogPost.keywords && blogPost.keywords.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Focus Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {blogPost.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {blogPost.content && (
              <div>
                <h3 className="font-semibold mb-2">Article Content</h3>
                <div 
                  className="prose prose-sm max-w-none bg-muted p-4 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: blogPost.content }}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostDetailModal;