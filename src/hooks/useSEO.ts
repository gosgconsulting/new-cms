import { useEffect, useState } from 'react';

interface SEOSettings {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_author?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_site?: string;
  twitter_image?: string;
  site_logo?: string;
  site_favicon?: string;
}

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  url?: string;
}

export const useSEO = (options: SEOOptions = {}) => {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch SEO settings from API
  useEffect(() => {
    const fetchSEOSettings = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173';
        const response = await fetch(`${API_BASE_URL}/api/seo`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch SEO settings');
        }
        
        const settings = await response.json();
        setSeoSettings(settings);
        console.log('[testing] SEO settings loaded:', settings);
      } catch (err) {
        console.error('[testing] Error loading SEO settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load SEO settings');
        
        // Fallback to default settings
        setSeoSettings({
          site_name: 'GO SG',
          site_tagline: 'Digital Marketing Agency',
          meta_title: 'GO SG - Digital Marketing Agency',
          meta_description: 'GO SG - We grow your revenue at the highest ROI through integrated digital marketing solutions.',
          meta_keywords: 'SEO, digital marketing, Singapore, organic traffic, search rankings',
          meta_author: 'GO SG',
          og_title: 'GO SG - Digital Marketing Agency',
          og_description: 'Integrated marketing solutions for SMEs and high-performing brands.',
          og_type: 'website',
          twitter_card: 'summary_large_image',
          twitter_site: '@gosgconsulting'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSEOSettings();
  }, []);

  // Update document meta tags
  useEffect(() => {
    if (loading || !seoSettings) return;

    const title = options.title || seoSettings.meta_title || seoSettings.site_name || 'GO SG';
    const description = options.description || seoSettings.meta_description || seoSettings.site_description || '';
    const keywords = options.keywords || seoSettings.meta_keywords || '';
    const image = options.image || seoSettings.og_image || '';
    const type = options.type || seoSettings.og_type || 'website';
    const url = options.url || window.location.href;

    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string, attribute: string = 'content') => {
      if (!content) return;
      
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (element) {
        element.setAttribute(attribute, content);
      } else {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          const property = selector.match(/property="([^"]+)"/)?.[1];
          if (property) element.setAttribute('property', property);
        } else if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) element.setAttribute('name', name);
        }
        element.setAttribute(attribute, content);
        document.head.appendChild(element);
      }
    };

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="keywords"]', keywords);
    updateMetaTag('meta[name="author"]', seoSettings.meta_author || '');

    // Update Open Graph meta tags
    updateMetaTag('meta[property="og:title"]', options.title || seoSettings.og_title || title);
    updateMetaTag('meta[property="og:description"]', options.description || seoSettings.og_description || description);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:url"]', url);
    if (image) {
      updateMetaTag('meta[property="og:image"]', image);
    }

    // Update Twitter Card meta tags
    updateMetaTag('meta[name="twitter:card"]', seoSettings.twitter_card || 'summary_large_image');
    updateMetaTag('meta[name="twitter:site"]', seoSettings.twitter_site || '');
    updateMetaTag('meta[name="twitter:title"]', options.title || seoSettings.og_title || title);
    updateMetaTag('meta[name="twitter:description"]', options.description || seoSettings.og_description || description);
    if (options.image || seoSettings.twitter_image || image) {
      updateMetaTag('meta[name="twitter:image"]', options.image || seoSettings.twitter_image || image);
    }

    // Update favicon if available
    if (seoSettings.site_favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = seoSettings.site_favicon;
      }
    }

    console.log('[testing] SEO meta tags updated:', {
      title,
      description,
      keywords,
      image,
      type,
      url
    });
  }, [seoSettings, options, loading]);

  return {
    seoSettings,
    loading,
    error,
    updateSEO: (newOptions: SEOOptions) => {
      // This would trigger a re-render with new options
      // For now, we'll just log it
      console.log('[testing] SEO update requested:', newOptions);
    }
  };
};

export default useSEO;
