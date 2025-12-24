import { useState, useEffect } from 'react';
import api from '../utils/api';

interface ComponentSchema {
  id?: string;
  type?: string;
  key?: string;
  items?: any[];
  props?: any;
  [key: string]: any;
}

interface PageLayout {
  components?: ComponentSchema[];
  [key: string]: any;
}

interface PageData {
  id: string;
  page_name: string;
  slug: string;
  layout?: PageLayout;
  [key: string]: any;
}

interface UsePageLayoutOptions {
  slug?: string;
  tenantId?: string;
  themeId?: string;
  mode?: 'tenants' | 'theme';
}

/**
 * Hook to fetch page layout from database
 * Returns page data with layout components, prioritizing database content
 */
export function usePageLayout(options: UsePageLayoutOptions = {}) {
  const { slug = '/', tenantId, themeId, mode = 'tenants' } = options;
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPageLayout = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine API endpoint based on mode
        let apiUrl: string;
        const slugEncoded = encodeURIComponent(slug);
        
        if (mode === 'theme' && themeId) {
          // Theme mode: need to find page by slug and themeId
          // First try to get page ID from content API
          // For theme mode, we'll query pages by theme and slug
          // The content API supports themeId in query params
          apiUrl = `/api/pages/theme/${themeId}`;
          
          // After getting pages list, find the one matching the slug
          const pagesResponse = await api.get(apiUrl);
          const pagesResult = await pagesResponse.json();
          
          if (pagesResult.success && pagesResult.pages) {
            const matchingPage = pagesResult.pages.find((p: any) => p.slug === slug);
            if (matchingPage) {
              // Now get the full page with layout
              apiUrl = `/api/pages/${matchingPage.id}?themeId=${themeId}`;
            } else {
              // No matching page found
              setData(null);
              setLoading(false);
              return;
            }
          } else {
            setData(null);
            setLoading(false);
            return;
          }
        } else if (tenantId) {
          // Tenant mode: use public API with slug (removes leading / for URL)
          const slugForUrl = slug.startsWith('/') ? slug.substring(1) : slug;
          apiUrl = `/api/v1/pages/${slugForUrl}?tenantId=${tenantId}`;
        } else {
          throw new Error('Either tenantId or themeId must be provided');
        }

        const response = await api.get(apiUrl);
        const result = await response.json();

        // Handle different response formats
        // Public API returns { success: true, data: {...} }
        // Content API returns { success: true, page: {...} }
        const pageData = result.data || result.page;

        if (result.success && pageData) {
          // Convert testimonials sections to proper items structure if needed
          if (pageData.layout && pageData.layout.components) {
            try {
              const { convertLayoutTestimonialsToItems } = await import('../utils/convertTestimonialsToItems.js');
              pageData.layout = convertLayoutTestimonialsToItems(pageData.layout);
            } catch (error) {
              console.log('[usePageLayout] Note: Could not convert testimonials structure:', error);
            }
          }

          setData(pageData);
        } else {
          // No page found in database
          setData(null);
        }
      } catch (err) {
        console.error('[usePageLayout] Error fetching page layout:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPageLayout();
  }, [slug, tenantId, themeId, mode]);

  return { data, loading, error };
}

/**
 * Get component by type from layout
 */
export function getComponentByType(layout: PageLayout | undefined, type: string): ComponentSchema | undefined {
  if (!layout || !layout.components || !Array.isArray(layout.components)) {
    return undefined;
  }

  return layout.components.find(
    (component) => 
      component.type === type || 
      component.id === type ||
      component.key === type
  );
}

/**
 * Check if layout has components
 */
export function hasLayoutComponents(layout: PageLayout | undefined): boolean {
  return !!(layout && layout.components && Array.isArray(layout.components) && layout.components.length > 0);
}

