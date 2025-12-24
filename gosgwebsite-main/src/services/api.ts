/**
 * API client for fetching page content and schemas
 */

// Types for page schemas
export interface PageSchema {
  id?: number;
  slug: string;
  meta: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
  };
  components: ComponentSchema[];
  created_at?: string;
  updated_at?: string;
}

export interface ComponentSchema {
  key: string;
  name: string;
  type: string;
  items: any[];
  wrapper?: {
    className?: string;
  };
}

/**
 * Fetch page content by slug
 * @param slug - The page slug to fetch
 * @returns The page schema
 */
export const fetchPageContent = async (slug: string): Promise<PageSchema> => {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URL || '';
    
    let endpoint;
    
    // For home page, use the dedicated endpoint
    if (slug === 'home') {
      console.log('Fetching home page content from API');
      endpoint = `${baseUrl}/api/home-content`;
    } else {
      endpoint = `${baseUrl}/api/page-content/${slug}`;
    }
    
    console.log('Fetching from endpoint:', endpoint);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page content: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Ensure components is an array
    if (data && typeof data.components === 'string') {
      try {
        data.components = JSON.parse(data.components);
      } catch (e) {
        console.error('Failed to parse components JSON:', e);
        data.components = [];
      }
    }
    
    // Check if components has a 'components' property (nested structure)
    if (data && data.components && !Array.isArray(data.components) && 
        typeof data.components === 'object' && data.components.components) {
      console.log('Found nested components structure, extracting components array');
      data.components = data.components.components;
    }
    
    // Ensure components is always an array
    if (data && !Array.isArray(data.components)) {
      console.log('Components is not an array, converting to array');
      if (data.components && typeof data.components === 'object') {
        data.components = [data.components];
      } else {
        data.components = [];
      }
    }
    
    console.log('Final data structure:', {
      slug: data.slug,
      componentsType: typeof data.components,
      isArray: Array.isArray(data.components),
      componentCount: Array.isArray(data.components) ? data.components.length : 'N/A'
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
};

/**
 * Fetch all available page schemas
 * @returns List of available page schemas
 */
export const fetchPageSchemas = async (): Promise<Array<{id: number, page_name: string, slug: string}>> => {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URL || '';
    const response = await fetch(`${baseUrl}/api/page-schemas`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page schemas: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching page schemas:', error);
    throw error;
  }
};

/**
 * Update page content
 * @param slug - The page slug to update
 * @param data - The updated page data
 * @returns The updated page schema
 */
export const updatePageContent = async (
  slug: string, 
  data: { meta?: PageSchema['meta'], components?: ComponentSchema[] }
): Promise<PageSchema> => {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URL || '';
    const response = await fetch(`${baseUrl}/api/page-content/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update page content: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating page content:', error);
    throw error;
  }
};

/**
 * Interface for site schema data
 */
export interface SiteSchema {
  key: string;
  data: any;
}

/**
 * Fetch site schema by key (header, footer, etc.)
 * @param key - The schema key to fetch
 * @returns The site schema data
 */
export const fetchSiteSchema = async (key: string): Promise<SiteSchema> => {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URL || '';
    const response = await fetch(`${baseUrl}/api/site-schema/${key}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch site schema: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching site schema for key ${key}:`, error);
    throw error;
  }
};