import React, { useEffect } from 'react';

interface SEOHeadProps {
  meta: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
}

/**
 * SEOHead component
 * 
 * Updates document head with SEO metadata
 */
export const SEOHead: React.FC<SEOHeadProps> = ({ meta }) => {
  useEffect(() => {
    // Update document title
    if (meta.title) {
      document.title = meta.title;
    }
    
    // Update meta description
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta && meta.description) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    if (descriptionMeta && meta.description) {
      descriptionMeta.setAttribute('content', meta.description);
    }
    
    // Update meta keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta && meta.keywords) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    if (keywordsMeta && meta.keywords) {
      keywordsMeta.setAttribute('content', meta.keywords);
    }
    
    // Enforce removal of large image previews:
    // 1) Use a 1x1 transparent image for og:image
    const transparentPixel =
      'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImageMeta) {
      ogImageMeta = document.createElement('meta');
      ogImageMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.setAttribute('content', transparentPixel);

    // Also set og:image:width/height to 1x1 to further discourage previews
    let ogImageWidth = document.querySelector('meta[property="og:image:width"]');
    if (!ogImageWidth) {
      ogImageWidth = document.createElement('meta');
      ogImageWidth.setAttribute('property', 'og:image:width');
      document.head.appendChild(ogImageWidth);
    }
    ogImageWidth.setAttribute('content', '1');

    let ogImageHeight = document.querySelector('meta[property="og:image:height"]');
    if (!ogImageHeight) {
      ogImageHeight = document.createElement('meta');
      ogImageHeight.setAttribute('property', 'og:image:height');
      document.head.appendChild(ogImageHeight);
    }
    ogImageHeight.setAttribute('content', '1');

    // 2) Update Open Graph title/description
    let ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (!ogTitleMeta && meta.title) {
      ogTitleMeta = document.createElement('meta');
      ogTitleMeta.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleMeta);
    }
    if (ogTitleMeta && meta.title) {
      ogTitleMeta.setAttribute('content', meta.title);
    }
    
    let ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    if (!ogDescriptionMeta && meta.description) {
      ogDescriptionMeta = document.createElement('meta');
      ogDescriptionMeta.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescriptionMeta);
    }
    if (ogDescriptionMeta && meta.description) {
      ogDescriptionMeta.setAttribute('content', meta.description);
    }

    // 3) Force Twitter card to summary (no large image)
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary');

    // Remove any existing twitter:image to avoid image previews
    const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageMeta) {
      twitterImageMeta.remove();
    }

    // Cleanup function
    return () => {
      // No cleanup needed
    };
  }, [meta]);
  
  // This component doesn't render anything
  return null;
};

export default SEOHead;