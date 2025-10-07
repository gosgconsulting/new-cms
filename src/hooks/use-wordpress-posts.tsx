/**
 * Custom React hook for WordPress posts with error handling and caching
 * Provides a clean interface for consuming WordPress API data
 */

import { useQuery } from "@tanstack/react-query";
import { wordpressApi, WordPressPost, WordPressCategory } from "@/services/wordpressApi";

export interface UseWordPressPostsOptions {
  per_page?: number;
  page?: number;
  search?: string;
  categories?: number[];
  tags?: number[];
  author?: number;
  orderby?: 'date' | 'id' | 'include' | 'title' | 'slug';
  order?: 'asc' | 'desc';
  enabled?: boolean;
}

export interface UseWordPressPostsResult {
  posts: WordPressPost[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch multiple WordPress posts
 * @param options Query options for filtering posts
 * @returns UseWordPressPostsResult
 */
export function useWordPressPosts(options: UseWordPressPostsOptions = {}): UseWordPressPostsResult {
  const {
    per_page = 10,
    page = 1,
    search,
    categories,
    tags,
    author,
    orderby = 'date',
    order = 'desc',
    enabled = true
  } = options;

  const queryKey = ['wordpress-posts', {
    per_page,
    page,
    search,
    categories,
    tags,
    author,
    orderby,
    order
  }];

  const {
    data: posts,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      return await wordpressApi.getPosts({
        per_page,
        page,
        search,
        categories,
        tags,
        author,
        orderby,
        order
      });
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    posts,
    isLoading,
    error: error as Error | null,
    isError,
    refetch
  };
}

export interface UseWordPressPostOptions {
  slug?: string;
  id?: number;
  enabled?: boolean;
}

export interface UseWordPressPostResult {
  post: WordPressPost | null | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch a single WordPress post by slug or ID
 * @param options Options for fetching a single post
 * @returns UseWordPressPostResult
 */
export function useWordPressPost(options: UseWordPressPostOptions): UseWordPressPostResult {
  const { slug, id, enabled = true } = options;

  const queryKey = slug 
    ? ['wordpress-post-slug', slug] 
    : id 
    ? ['wordpress-post-id', id]
    : ['wordpress-post-none'];

  const {
    data: post,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (slug) {
        return await wordpressApi.getPostBySlug(slug);
      } else if (id) {
        return await wordpressApi.getPostById(id);
      }
      throw new Error('Either slug or id must be provided');
    },
    enabled: enabled && (!!slug || !!id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    post,
    isLoading,
    error: error as Error | null,
    isError,
    refetch
  };
}

/**
 * Hook to get the latest blog posts for preview sections
 * @param count Number of posts to fetch (default: 3)
 * @returns UseWordPressPostsResult
 */
export function useLatestWordPressPosts(count: number = 3): UseWordPressPostsResult {
  return useWordPressPosts({
    per_page: count,
    orderby: 'date',
    order: 'desc'
  });
}

export interface UseWordPressCategoriesResult {
  categories: WordPressCategory[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch WordPress categories
 * @returns UseWordPressCategoriesResult
 */
export function useWordPressCategories(): UseWordPressCategoriesResult {
  const {
    data: categories,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ['wordpress-categories'],
    queryFn: async () => {
      return await wordpressApi.getCategories({
        per_page: 100,
        orderby: 'name',
        order: 'asc'
      });
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    categories,
    isLoading,
    error: error as Error | null,
    isError,
    refetch
  };
}

export default {
  useWordPressPosts,
  useWordPressPost,
  useLatestWordPressPosts,
  useWordPressCategories
};
