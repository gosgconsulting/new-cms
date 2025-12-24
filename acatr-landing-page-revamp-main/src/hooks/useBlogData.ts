/**
 * Hook to fetch and manage blog post data from CMS API
 */

import { useQuery } from "@tanstack/react-query";
import { BlogPost, BlogPostListResponse, BlogPostDetailResponse } from "@/types/blog";

interface UseBlogPostsOptions {
  apiUrl?: string;
}

interface UseBlogPostOptions {
  slug: string;
  apiUrl?: string;
}

/**
 * Fetch list of blog posts from API
 * GET /api/v1/blog/posts
 */
async function fetchBlogPosts(
  apiUrl?: string
): Promise<BlogPost[]> {
  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || "https://cms.sparti.ai/api/v1";
  
  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const url = `${cleanBaseUrl}/blog/posts`;
  
  const headers: HeadersInit = {};
  const apiKey = import.meta.env.VITE_BACKEND_API_KEY || '37f64aed-76fc-4ef4-9bc5-5052b3177799';
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
  }

  const data: BlogPostListResponse = await response.json();
  
  if (!data.success) {
    throw new Error("API returned unsuccessful response");
  }

  return data.data || [];
}

/**
 * Fetch individual blog post by slug
 * GET /api/v1/blog/posts/:slug
 */
async function fetchBlogPost(
  slug: string,
  apiUrl?: string
): Promise<BlogPost> {
  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || "https://cms.sparti.ai/api/v1";
  
  // Remove trailing slash if present and clean slug
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanSlug = slug.replace(/^\//, '').replace(/\/$/, '');
  const url = `${cleanBaseUrl}/blog/posts/${cleanSlug}`;
  
  const headers: HeadersInit = {};
  const apiKey = import.meta.env.VITE_BACKEND_API_KEY || '37f64aed-76fc-4ef4-9bc5-5052b3177799';
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog post: ${response.statusText}`);
  }

  const data: BlogPostDetailResponse = await response.json();
  
  if (!data.success) {
    throw new Error("API returned unsuccessful response");
  }

  return data.data;
}

/**
 * Hook to fetch list of blog posts with React Query
 */
export function useBlogPosts(options: UseBlogPostsOptions = {}) {
  const { apiUrl = 'https://cms.sparti.ai/api/v1' } = options;

  return useQuery({
    queryKey: ["blogPosts"],
    queryFn: () => fetchBlogPosts(apiUrl),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch individual blog post by slug with React Query
 */
export function useBlogPost(options: UseBlogPostOptions) {
  const { slug, apiUrl = 'https://cms.sparti.ai/api/v1' } = options;

  return useQuery({
    queryKey: ["blogPost", slug],
    queryFn: () => fetchBlogPost(slug, apiUrl),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!slug, // Only fetch if slug is provided
  });
}

