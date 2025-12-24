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
  description: string;
  parent: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressMedia {
  id: number;
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
}

// Function to fetch posts with embedded featured media and terms (categories, tags)
export async function getPosts(page = 1, perPage = 10, categoryId?: number): Promise<WordPressPost[]> {
  try {
    let url = `${WORDPRESS_API_URL}/posts?_embed=wp:featuredmedia,wp:term&page=${page}&per_page=${perPage}`;
    
    if (categoryId) {
      url += `&categories=${categoryId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return [];
  }
}

// Function to fetch a single post by slug
export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?_embed=wp:featuredmedia,wp:term&slug=${slug}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }
    
    const posts = await response.json();
    
    // WordPress returns an array, but since we're querying by slug which is unique,
    // we should only get one post back
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error(`Error fetching WordPress post with slug "${slug}":`, error);
    return null;
  }
}

// Function to fetch all categories
export async function getCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching WordPress categories:', error);
    return [];
  }
}

// Function to fetch a featured media item
export async function getMedia(mediaId: number): Promise<WordPressMedia | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/media/${mediaId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching WordPress media with ID ${mediaId}:`, error);
    return null;
  }
}

// Function to fetch related posts by category IDs
export async function getRelatedPosts(categoryIds: number[], excludePostId: number, limit = 3): Promise<WordPressPost[]> {
  try {
    if (!categoryIds.length) return [];
    
    const categoryParam = categoryIds.join(',');
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?_embed=wp:featuredmedia&categories=${categoryParam}&exclude=${excludePostId}&per_page=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching related WordPress posts:', error);
    return [];
  }
}

// Helper function to estimate reading time
export function calculateReadTime(content: string): string {
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  return `${readTime} min read`;
}

// Helper function to get the best available featured image URL
export function getFeaturedImageUrl(post: WordPressPost, size: 'thumbnail' | 'medium' | 'large' = 'large'): string {
  if (!post._embedded || !post._embedded['wp:featuredmedia'] || !post._embedded['wp:featuredmedia'][0]) {
    return 'https://via.placeholder.com/800x500?text=No+Image+Available';
  }
  
  const media = post._embedded['wp:featuredmedia'][0];
  
  // Try to get the requested size
  if (media.media_details?.sizes) {
    if (size === 'large' && media.media_details.sizes.large) {
      return media.media_details.sizes.large.source_url;
    }
    if (size === 'medium' && media.media_details.sizes.medium_large) {
      return media.media_details.sizes.medium_large.source_url;
    }
  }
  
  // Fall back to the full-size image
  return media.source_url || 'https://via.placeholder.com/800x500?text=No+Image+Available';
}

// Helper function to get post categories
export function getPostCategories(post: WordPressPost): { id: number; name: string; slug: string }[] {
  if (!post._embedded || !post._embedded['wp:term']) {
    return [];
  }
  
  // wp:term[0] contains categories
  const categoryTerms = post._embedded['wp:term'][0] || [];
  return categoryTerms.filter(term => term.taxonomy === 'category');
}

// Helper function to get post tags
export function getPostTags(post: WordPressPost): { id: number; name: string; slug: string }[] {
  if (!post._embedded || !post._embedded['wp:term'] || post._embedded['wp:term'].length < 2) {
    return [];
  }
  
  // wp:term[1] contains tags
  const tagTerms = post._embedded['wp:term'][1] || [];
  return tagTerms.filter(term => term.taxonomy === 'post_tag');
}
