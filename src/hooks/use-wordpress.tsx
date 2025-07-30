import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { wordpressApi, WordPressPage, WordPressPost, WordPressCategory, WordPressTag } from '@/lib/wordpress-api';

// Pages hooks
export const useWordPressPages = (params?: {
  per_page?: number;
  page?: number;
  search?: string;
  slug?: string;
  status?: string;
  parent?: number;
}) => {
  return useQuery({
    queryKey: ['wordpress-pages', params],
    queryFn: () => wordpressApi.getPages(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useWordPressPage = (
  id: number | string,
  options?: Omit<UseQueryOptions<WordPressPage>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['wordpress-page', id],
    queryFn: () => wordpressApi.getPage(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Posts hooks
export const useWordPressPosts = (params?: {
  per_page?: number;
  page?: number;
  search?: string;
  categories?: number[];
  tags?: number[];
  status?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['wordpress-posts', params],
    queryFn: () => wordpressApi.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useWordPressPost = (
  id: number | string,
  options?: Omit<UseQueryOptions<WordPressPost>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['wordpress-post', id],
    queryFn: () => wordpressApi.getPost(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Categories hooks
export const useWordPressCategories = (params?: {
  per_page?: number;
  page?: number;
  search?: string;
  slug?: string;
}) => {
  return useQuery({
    queryKey: ['wordpress-categories', params],
    queryFn: () => wordpressApi.getCategories(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Tags hooks
export const useWordPressTags = (params?: {
  per_page?: number;
  page?: number;
  search?: string;
  slug?: string;
}) => {
  return useQuery({
    queryKey: ['wordpress-tags', params],
    queryFn: () => wordpressApi.getTags(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Utility hooks
export const useWordPressPageBySlug = (slug: string) => {
  return useWordPressPage(slug, {
    enabled: !!slug,
  });
};

export const useWordPressPostBySlug = (slug: string) => {
  return useWordPressPost(slug, {
    enabled: !!slug,
  });
};