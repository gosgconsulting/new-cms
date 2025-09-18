
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye } from "lucide-react";

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
}

interface BlogPostTableProps {
  posts: BlogPost[] | undefined;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const BlogPostTable: React.FC<BlogPostTableProps> = ({
  posts,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts?.map((post) => (
          <TableRow key={post.id}>
            <TableCell>
              <div>
                <div className="font-medium">{post.title}</div>
                <div className="text-sm text-muted-foreground">/{post.slug}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(post.status)}>
                {post.status}
              </Badge>
            </TableCell>
            <TableCell>{post.author}</TableCell>
            <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {post.status === 'published' && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/blog/${post.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onEdit(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDelete(post.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BlogPostTable;
