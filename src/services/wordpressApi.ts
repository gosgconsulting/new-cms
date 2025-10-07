/**
 * WordPress REST API Service
 * Connects to the WordPress blog at cms.gosgconsulting.com
 */

const WORDPRESS_BASE_URL = 'https://cms.gosgconsulting.com/wp-json/wp/v2';

export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any[];
  categories: number[];
  tags: number[];
  _links: any;
  // Enhanced fields that might be available from _embedded
  yoast_head?: string;
  yoast_head_json?: any;
  featured_image_url?: string;
  author_name?: string;
}

export interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: any[];
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    image_meta: any;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
  };
  source_url: string;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [key: string]: string;
  };
  meta: any[];
}

export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: any[];
}

class WordPressApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = WORDPRESS_BASE_URL;
  }

  /**
   * Fetch published blog posts from WordPress
   */
  async getPosts(params: {
    per_page?: number;
    page?: number;
    search?: string;
    categories?: number[];
    tags?: number[];
    author?: number;
    orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'modified';
    order?: 'asc' | 'desc';
    slug?: string;
  } = {}): Promise<WordPressPost[]> {
    const searchParams = new URLSearchParams();

    // Defaults
    searchParams.append('status', 'publish');
    searchParams.append('_embed', 'true');

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${this.baseUrl}/posts?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    const posts: any[] = await response.json();
    return posts.map((post) => this.enhancePostData(post));
  }

  /**
   * Fetch a single post by slug
   */
  async getPostBySlug(slug: string): Promise<WordPressPost | null> {
    const posts = await this.getPosts({ slug, per_page: 1 });
    return posts.length > 0 ? posts[0] : null;
  }

  /**
   * Fetch a single post by ID
   */
  async getPostById(id: number): Promise<WordPressPost | null> {
    const response = await fetch(`${this.baseUrl}/posts/${id}?_embed=true`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }
    const post: any = await response.json();
    return this.enhancePostData(post);
  }

  /**
   * Fetch media by ID
   */
  async getMediaById(id: number): Promise<WordPressMedia | null> {
    const response = await fetch(`${this.baseUrl}/media/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as WordPressMedia;
  }

  /**
   * Fetch all categories
   */
  async getCategories(params: {
    per_page?: number;
    page?: number;
    orderby?: 'count' | 'name' | 'slug';
    order?: 'asc' | 'desc';
  } = {}): Promise<WordPressCategory[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/categories?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }
    
    return (await response.json()) as WordPressCategory[];
  }

  /**
   * Enhance post with embedded author and image
   */
  private enhancePostData(post: any): WordPressPost {
    const enhanced: WordPressPost = { ...post } as WordPressPost;

    if (post._embedded?.author?.[0]?.name) {
      (enhanced as any).author_name = post._embedded.author[0].name;
    }

    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      (enhanced as any).featured_image_url = post._embedded['wp:featuredmedia'][0].source_url;
    }

    return enhanced;
  }

  /**
   * Strip HTML tags from a string (browser only)
   */
  stripHtml(htmlContent: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Generate an excerpt from HTML content
   */
  generateExcerpt(content: string, length: number = 200): string {
    const plainText = this.stripHtml(content);
    if (plainText.length <= length) return plainText;
    return plainText.substring(0, length).trim() + '...';
  }

  /**
   * Format an ISO date string for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

export const wordpressApi = new WordPressApiService();
export default wordpressApi;
