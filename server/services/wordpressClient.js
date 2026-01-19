/**
 * WordPress REST API Client
 * Handles authentication and API requests to WordPress sites
 * Supports Application Password authentication (WordPress 5.6+)
 */

export class WordPressClient {
  constructor(config) {
    if (!config.wordpress_url || !config.username || !config.application_password) {
      throw new Error('WordPress configuration requires wordpress_url, username, and application_password');
    }

    // Ensure WordPress URL doesn't end with a slash
    this.wordpressUrl = config.wordpress_url.replace(/\/$/, '');
    this.username = config.username;
    this.applicationPassword = config.application_password;
    this.timeout = config.timeout || 30000; // 30 seconds default

    // Base API URL for WordPress REST API
    this.baseUrl = `${this.wordpressUrl}/wp-json/wp/v2`;
  }

  /**
   * Create Basic Auth header for WordPress REST API
   * WordPress uses HTTP Basic Authentication with username and application password
   */
  getAuthHeader() {
    const credentials = `${this.username}:${this.applicationPassword}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  /**
   * Make HTTP request to WordPress API
   */
  async request(method, endpoint, params = {}, options = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters for GET requests
    if (method === 'GET' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // WordPress API accepts comma-separated arrays
            url.searchParams.append(key, value.join(','));
          } else {
            url.searchParams.append(key, value);
          }
        }
      });
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions = {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(params).length > 0) {
      requestOptions.body = JSON.stringify(params);
    }

    try {
      const response = await fetch(url.toString(), requestOptions);
      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        console.warn(`[testing] WordPress rate limit hit. Retry after ${retryAfter} seconds`);
        throw new Error(`Rate limit exceeded. Please retry after ${retryAfter} seconds`);
      }

      // Handle authentication errors
      if (response.status === 401) {
        throw new Error('Invalid WordPress credentials. Please check your username and application password.');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden. Please check your API permissions.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `WordPress API error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
          if (errorData.code) {
            errorMessage = `${errorMessage} (code: ${errorData.code})`;
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      
      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Test WordPress connection
   */
  async testConnection() {
    try {
      // Try to fetch current user info
      const response = await this.request('GET', '/users/me');
      return {
        success: true,
        user: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get posts from WordPress
   */
  async getPosts(options = {}) {
    const {
      page = 1,
      per_page = 10,
      status = 'publish',
      orderby = 'date',
      order = 'desc',
      search,
      categories,
      tags,
      _embed = true,
    } = options;

    const params = {
      page,
      per_page,
      status,
      orderby,
      order,
      ...(search && { search }),
      ...(categories && { categories }),
      ...(tags && { tags }),
      ...(_embed && { _embed: '1' }),
    };

    return this.request('GET', '/posts', params);
  }

  /**
   * Get a single post by ID
   */
  async getPostById(id) {
    return this.request('GET', `/posts/${id}`, { _embed: '1' });
  }

  /**
   * Get a single post by slug
   */
  async getPostBySlug(slug) {
    const posts = await this.request('GET', '/posts', { slug, _embed: '1' });
    return posts && posts.length > 0 ? posts[0] : null;
  }

  /**
   * Create a new post in WordPress
   */
  async createPost(postData) {
    const {
      title,
      content,
      excerpt,
      slug,
      status = 'publish',
      date,
      categories = [],
      tags = [],
      featured_media,
    } = postData;

    const params = {
      title,
      content,
      excerpt,
      slug,
      status,
      ...(date && { date }),
      ...(categories.length > 0 && { categories }),
      ...(tags.length > 0 && { tags }),
      ...(featured_media && { featured_media }),
    };

    return this.request('POST', '/posts', params);
  }

  /**
   * Update an existing post in WordPress
   */
  async updatePost(id, postData) {
    const {
      title,
      content,
      excerpt,
      slug,
      status,
      date,
      categories,
      tags,
      featured_media,
    } = postData;

    const params = {};
    if (title !== undefined) params.title = title;
    if (content !== undefined) params.content = content;
    if (excerpt !== undefined) params.excerpt = excerpt;
    if (slug !== undefined) params.slug = slug;
    if (status !== undefined) params.status = status;
    if (date !== undefined) params.date = date;
    if (categories !== undefined) params.categories = categories;
    if (tags !== undefined) params.tags = tags;
    if (featured_media !== undefined) params.featured_media = featured_media;

    return this.request('POST', `/posts/${id}`, params);
  }

  /**
   * Delete a post in WordPress
   */
  async deletePost(id, force = false) {
    const params = force ? { force: true } : {};
    return this.request('DELETE', `/posts/${id}`, params);
  }

  /**
   * Get categories
   */
  async getCategories(options = {}) {
    const { per_page = 100, search, hide_empty = false } = options;
    const params = {
      per_page,
      hide_empty,
      ...(search && { search }),
    };
    return this.request('GET', '/categories', params);
  }

  /**
   * Get tags
   */
  async getTags(options = {}) {
    const { per_page = 100, search, hide_empty = false } = options;
    const params = {
      per_page,
      hide_empty,
      ...(search && { search }),
    };
    return this.request('GET', '/tags', params);
  }

  /**
   * Get media by ID
   */
  async getMediaById(id) {
    return this.request('GET', `/media/${id}`);
  }

  /**
   * Upload media to WordPress
   */
  async uploadMedia(fileUrl, filename, title) {
    // Note: This is a simplified version. Full implementation would require
    // downloading the file, converting to base64 or FormData, etc.
    // For now, we'll just return the URL as featured_media ID would need to be set separately
    throw new Error('Media upload not yet implemented. Use featured_media ID instead.');
  }
}

/**
 * Helper function to create WordPress client from tenant integration config
 */
export function createWordPressClientFromConfig(config) {
  if (!config || !config.wordpress_url || !config.username || !config.application_password) {
    throw new Error('Invalid WordPress configuration. Missing required fields.');
  }

  return new WordPressClient({
    wordpress_url: config.wordpress_url,
    username: config.username,
    application_password: config.application_password,
    timeout: config.timeout || 30000,
  });
}
