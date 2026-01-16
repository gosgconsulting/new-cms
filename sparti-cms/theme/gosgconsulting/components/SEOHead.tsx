import React from 'react';

interface SEOHeadProps {
  meta: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
  };
  favicon?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ meta, favicon }) => {
  React.useEffect(() => {
    // Note: Favicons are now managed by applyFavicon() in utils/settings.ts
    // We don't remove them here to allow branding settings to control the favicon
    
    // If a favicon prop is provided, apply it
    if (favicon) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = favicon;
      link.type = favicon.endsWith('.png') ? 'image/png' : 
                   favicon.endsWith('.ico') ? 'image/x-icon' : 
                   favicon.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
      document.head.appendChild(link);
    }
    
    // Update document title
    if (meta.title) {
      document.title = meta.title;
    }

    // Update meta description
    if (meta.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', meta.description);
    }

    // Update meta keywords
    if (meta.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', meta.keywords);
    }

    // Update Open Graph tags
    if (meta.title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', meta.title);
    }

    if (meta.description) {
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', meta.description);
    }
  }, [meta, favicon]);

  return null; // This component doesn't render anything visible
};

export { SEOHead };
