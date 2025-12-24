// WordPress API Service
// This service handles all interactions with the WordPress REST API

// Base URL for the WordPress API
const WORDPRESS_API_URL = 'https://cms.gosgconsulting.com/wp-json/wp/v2';

// Types for WordPress API responses
export interface WordPressPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        sizes?: {
          medium_large?: {
            source_url: string;
          };
          large?: {
            source_url: string;
          };
        };
      };
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: 'category' | 'post_tag';
    }>>;
  };
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

// Fetch posts from WordPress API
export const getPosts = async (page = 1, perPage = 10, categoryId?: number): Promise<WordPressPost[]> => {
  try {
    let url = `${WORDPRESS_API_URL}/posts?page=${page}&per_page=${perPage}&_embed=1`;
    
    if (categoryId) {
      url += `&categories=${categoryId}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Fetch a single post by slug
export const getPostBySlug = async (slug: string): Promise<WordPressPost | null> => {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?slug=${slug}&_embed=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
};

// Fetch categories
export const getCategories = async (): Promise<WordPressCategory[]> => {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Fetch related posts
export const getRelatedPosts = async (categoryIds: number[], excludeId: number, limit = 3): Promise<WordPressPost[]> => {
  try {
    const categoryQuery = categoryIds.join(',');
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?categories=${categoryQuery}&exclude=${excludeId}&per_page=${limit}&_embed=1`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
};

// Helper function to get featured image URL
export const getFeaturedImageUrl = (post: WordPressPost, size: 'medium' | 'large' = 'medium'): string => {
  const defaultImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop';
  
  if (!post._embedded?.['wp:featuredmedia']?.[0]) {
    return defaultImage;
  }

  const media = post._embedded['wp:featuredmedia'][0];
  
  if (size === 'large' && media.media_details?.sizes?.large) {
    return media.media_details.sizes.large.source_url;
  }
  
  if (media.media_details?.sizes?.medium_large) {
    return media.media_details.sizes.medium_large.source_url;
  }
  
  return media.source_url || defaultImage;
};

// Helper function to calculate read time
export const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const wordCount = textContent.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
};

// Helper function to get post categories
export const getPostCategories = (post: WordPressPost): Array<{ id: number; name: string; slug: string }> => {
  if (!post._embedded?.['wp:term']?.[0]) {
    return [];
  }
  
  return post._embedded['wp:term'][0].filter(term => term.taxonomy === 'category');
};

// Helper function to get post tags
export const getPostTags = (post: WordPressPost): Array<{ id: number; name: string; slug: string }> => {
  if (!post._embedded?.['wp:term']?.[1]) {
    return [];
  }
  
  return post._embedded['wp:term'][1].filter(term => term.taxonomy === 'post_tag');
};
