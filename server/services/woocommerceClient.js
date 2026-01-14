/**
 * WooCommerce REST API Client
 * Handles authentication and API requests to WooCommerce stores
 */

export class WooCommerceClient {
  constructor(config) {
    if (!config.store_url || !config.consumer_key || !config.consumer_secret) {
      throw new Error('WooCommerce configuration requires store_url, consumer_key, and consumer_secret');
    }

    // Ensure store URL doesn't end with a slash
    this.storeUrl = config.store_url.replace(/\/$/, '');
    this.consumerKey = config.consumer_key;
    this.consumerSecret = config.consumer_secret;
    this.apiVersion = config.api_version || 'wc/v3';
    this.timeout = config.timeout || 30000; // 30 seconds default

    // Base API URL
    this.baseUrl = `${this.storeUrl}/wp-json/${this.apiVersion}`;
  }

  /**
   * Create Basic Auth header for WooCommerce REST API
   * WooCommerce uses HTTP Basic Authentication with Consumer Key and Secret
   */
  getAuthHeader() {
    const credentials = `${this.consumerKey}:${this.consumerSecret}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  /**
   * Make HTTP request to WooCommerce API
   */
  async request(method, endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters for GET requests
    if (method === 'GET' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    // Create AbortController for timeout (compatible with older Node.js versions)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const options = {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    };

    // Add body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(params).length > 0) {
      options.body = JSON.stringify(params);
    }

    try {
      const response = await fetch(url.toString(), options);
      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        console.warn(`[testing] WooCommerce rate limit hit. Retry after ${retryAfter} seconds`);
        throw new Error(`Rate limit exceeded. Please retry after ${retryAfter} seconds`);
      }

      // Handle authentication errors
      if (response.status === 401) {
        throw new Error('Invalid WooCommerce credentials. Please check your Consumer Key and Consumer Secret.');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden. Please check your API permissions.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `WooCommerce API error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. The WooCommerce store may be slow or unreachable.');
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check the store URL and your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Test connection to WooCommerce API
   */
  async testConnection() {
    try {
      // Try to fetch system status or a simple endpoint
      const data = await this.request('GET', '/system_status');
      return {
        success: true,
        store_name: data.environment?.site_url || this.storeUrl,
        api_version: this.apiVersion,
      };
    } catch (error) {
      // If system_status fails, try products endpoint
      try {
        await this.request('GET', '/products', { per_page: 1 });
        return {
          success: true,
          store_name: this.storeUrl,
          api_version: this.apiVersion,
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: error.message || 'Failed to connect to WooCommerce store',
        };
      }
    }
  }

  /**
   * Get products with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10, max: 100)
   * @param {object} filters - Additional filters (status, search, etc.)
   */
  async getProducts(page = 1, perPage = 10, filters = {}) {
    const params = {
      page: Math.max(1, page),
      per_page: Math.min(100, Math.max(1, perPage)),
      ...filters,
    };

    const data = await this.request('GET', '/products', params);
    return data;
  }

  /**
   * Get single product by ID
   */
  async getProduct(id) {
    const data = await this.request('GET', `/products/${id}`);
    return data;
  }

  /**
   * Get orders with pagination and filters
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10, max: 100)
   * @param {object} filters - Additional filters (status, customer, after, before, etc.)
   */
  async getOrders(page = 1, perPage = 10, filters = {}) {
    const params = {
      page: Math.max(1, page),
      per_page: Math.min(100, Math.max(1, perPage)),
      ...filters,
    };

    const data = await this.request('GET', '/orders', params);
    return data;
  }

  /**
   * Get single order by ID
   */
  async getOrder(id) {
    const data = await this.request('GET', `/orders/${id}`);
    return data;
  }

  /**
   * Get total count of products (for sync planning)
   */
  async getProductsCount(filters = {}) {
    const params = {
      per_page: 1,
      ...filters,
    };
    const response = await this.request('GET', '/products', params);
    // WooCommerce returns total count in headers
    // We'll need to make a request and check response headers
    // For now, we'll estimate based on first page
    return response.length || 0;
  }

  /**
   * Get total count of orders (for sync planning)
   */
  async getOrdersCount(filters = {}) {
    const params = {
      per_page: 1,
      ...filters,
    };
    const response = await this.request('GET', '/orders', params);
    return response.length || 0;
  }
}

/**
 * Create WooCommerce client from tenant integration config
 */
export async function createWooCommerceClient(tenantId, query) {
  // Get tenant integration config
  const result = await query(`
    SELECT config, is_active
    FROM tenant_integrations
    WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    LIMIT 1
  `, [tenantId]);

  if (result.rows.length === 0) {
    throw new Error('WooCommerce integration not configured for this tenant');
  }

  const integration = result.rows[0];
  
  if (!integration.is_active) {
    throw new Error('WooCommerce integration is not active for this tenant');
  }

  const config = integration.config;
  
  if (!config || !config.store_url || !config.consumer_key || !config.consumer_secret) {
    throw new Error('WooCommerce credentials are incomplete. Please configure store_url, consumer_key, and consumer_secret.');
  }

  return new WooCommerceClient(config);
}
