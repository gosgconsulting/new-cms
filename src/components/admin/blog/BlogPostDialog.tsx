
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BlogPostForm from "./BlogPostForm";

type BlogPostStatus = 'draft' | 'published' | 'archived';

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

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  status: BlogPostStatus;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  categories: string[];
  tags: string[];
}

interface BlogPostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitLabel: string;
  categories: Category[];
  tags: Tag[];
}

const BlogPostDialog: React.FC<BlogPostDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  submitLabel,
  categories,
  tags,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <BlogPostForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          categories={categories}
          tags={tags}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostDialog;
