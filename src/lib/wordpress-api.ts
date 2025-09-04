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

  constructor(baseUrl: string = 'https://gosgconsulting.com') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async fetchApi<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
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

    console.log(`Fetching WordPress API: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Test connection method
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const posts = await this.fetchApi<WordPressPost[]>('/posts', { per_page: 1 });
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

// Create a singleton instance
export const wordpressApi = new WordPressAPI();

// Configure WordPress API base URL
export const configureWordPressAPI = (baseUrl: string) => {
  return new WordPressAPI(baseUrl);
};