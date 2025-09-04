export interface WordPressPage {
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
  parent: number;
  menu_order: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: any[];
  acf?: any; // Advanced Custom Fields
  _links: any;
}

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
  categories: number[];
  tags: number[];
  meta: any[];
  acf?: any; // Advanced Custom Fields
  _links: any;
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
  _links: any;
}

export interface WordPressTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  meta: any[];
  _links: any;
}

class WordPressAPI {
  private baseUrl: string;
  private useEdgeFunction: boolean;

  constructor(baseUrl: string = 'https://gosgconsulting.com', useEdgeFunction: boolean = true) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.useEdgeFunction = useEdgeFunction;
  }

  private async fetchApi<T>(endpoint: string, params?: Record<string, any>, requireAuth: boolean = false): Promise<T> {
    if (this.useEdgeFunction) {
      // Use Supabase edge function for authenticated requests or when configured
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('wordpress-api', {
        body: {
          method: 'GET',
          endpoint,
          params,
          baseUrl: this.baseUrl,
          requireAuth
        }
      });

      if (error) {
        console.error('WordPress API edge function error:', error);
        throw new Error(`WordPress API error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(`WordPress API error: ${data.error}`);
      }

      return data.data;
    } else {
      // Direct API call (public endpoints only)
      const url = new URL(`${this.baseUrl}/wp-json/wp/v2${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(key, String(v)));
            } else {
              url.searchParams.append(key, String(value));
            }
          }
        });
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    }
  }

  // Test connection method
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const posts = await this.fetchApi<WordPressPost[]>('/posts', { per_page: 1, status: 'publish' });
      return {
        success: true,
        message: `Successfully connected to WordPress site: ${this.baseUrl}`,
        data: {
          siteName: this.baseUrl,
          postsFound: posts.length > 0,
          samplePost: posts[0]?.title?.rendered || 'No posts found'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect to WordPress site: ${error.message}`,
      };
    }
  }

  // Pages
  async getPages(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    slug?: string;
    status?: string;
    parent?: number;
  }): Promise<WordPressPage[]> {
    return this.fetchApi<WordPressPage[]>('/pages', params);
  }

  async getPage(id: number | string): Promise<WordPressPage> {
    const endpoint = typeof id === 'string' ? `/pages?slug=${id}` : `/pages/${id}`;
    const result = await this.fetchApi<WordPressPage[] | WordPressPage>(endpoint);
    
    if (Array.isArray(result)) {
      if (result.length === 0) {
        throw new Error(`Page not found: ${id}`);
      }
      return result[0];
    }
    
    return result;
  }

  // Posts
  async getPosts(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    categories?: number[];
    tags?: number[];
    status?: string;
    orderby?: string;
    order?: 'asc' | 'desc';
  }): Promise<WordPressPost[]> {
    return this.fetchApi<WordPressPost[]>('/posts', params);
  }

  async getPost(id: number | string): Promise<WordPressPost> {
    const endpoint = typeof id === 'string' ? `/posts?slug=${id}` : `/posts/${id}`;
    const result = await this.fetchApi<WordPressPost[] | WordPressPost>(endpoint);
    
    if (Array.isArray(result)) {
      if (result.length === 0) {
        throw new Error(`Post not found: ${id}`);
      }
      return result[0];
    }
    
    return result;
  }

  // Categories
  async getCategories(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    slug?: string;
  }): Promise<WordPressCategory[]> {
    return this.fetchApi<WordPressCategory[]>('/categories', params);
  }

  // Tags
  async getTags(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    slug?: string;
  }): Promise<WordPressTag[]> {
    return this.fetchApi<WordPressTag[]>('/tags', params);
  }

  // Media
  async getMedia(id: number): Promise<any> {
    return this.fetchApi(`/media/${id}`);
  }
}

// Create a singleton instance with default configuration
export const wordpressApi = new WordPressAPI();

// Configure WordPress API base URL and authentication method
export const configureWordPressAPI = (baseUrl: string, useEdgeFunction: boolean = true) => {
  return new WordPressAPI(baseUrl, useEdgeFunction);
};

// Create an authenticated WordPress API instance
export const createAuthenticatedWordPressAPI = (baseUrl: string = 'https://gosgconsulting.com') => {
  return new WordPressAPI(baseUrl, true);
};