/**
 * Type definitions for blog posts and API responses
 */

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  author?: string;
  image: string;
  slug: string;
  category: string;
  readTime?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPostListResponse {
  success: boolean;
  data: BlogPost[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

export interface BlogPostDetailResponse {
  success: boolean;
  data: BlogPost;
  meta?: {
    [key: string]: any;
  };
}

