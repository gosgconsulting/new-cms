/**
 * Stub for gosgconsulting/services/wordpressApi when theme is excluded (VITE_SKIP_THEMES / Vercel CMS-only).
 * Blog and related pages get empty data so the build and runtime do not depend on the real theme.
 */

export interface WordPressPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: Record<string, unknown>;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
}

export const getPosts = async (): Promise<WordPressPost[]> => [];
export const getPostBySlug = async (): Promise<WordPressPost | null> => null;
export const getCategories = async (): Promise<WordPressCategory[]> => [];
export const getRelatedPosts = async (): Promise<WordPressPost[]> => [];
export const getFeaturedImageUrl = (): string => '';
export const calculateReadTime = (): string => '0 min read';
export const getPostCategories = (): Array<{ id: number; name: string; slug: string }> => [];
export const getPostTags = (): Array<{ id: number; name: string; slug: string }> => [];
