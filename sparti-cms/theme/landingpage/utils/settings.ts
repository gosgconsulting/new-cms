/**
 * Settings utility for landingpage theme
 * Provides helper functions to access and use theme settings
 */

import { ThemeBrandingSettings, ThemeLocalizationSettings } from '../../../hooks/useThemeSettings';

/**
 * Get site name with fallback
 */
export function getSiteName(
  branding: ThemeBrandingSettings | null | undefined,
  fallback: string = 'ACATR Business Services'
): string {
  return branding?.site_name || fallback;
}

/**
 * Get site tagline with fallback
 */
export function getSiteTagline(
  branding: ThemeBrandingSettings | null | undefined,
  fallback: string = ''
): string {
  return branding?.site_tagline || fallback;
}

/**
 * Get site description with fallback
 */
export function getSiteDescription(
  branding: ThemeBrandingSettings | null | undefined,
  fallback: string = ''
): string {
  return branding?.site_description || fallback;
}

/**
 * Get logo source with fallback
 */
export function getLogoSrc(
  branding: ThemeBrandingSettings | null | undefined,
  fallback: string = '/theme/landingpage/assets/752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png'
): string {
  return branding?.site_logo || fallback;
}

/**
 * Get favicon source with fallback
 */
export function getFaviconSrc(
  branding: ThemeBrandingSettings | null | undefined,
  fallback: string = '/theme/landingpage/assets/favicon.ico'
): string {
  return branding?.site_favicon || fallback;
}

/**
 * Get country from localization settings
 */
export function getCountry(
  localization: ThemeLocalizationSettings | null | undefined,
  fallback: string = 'SG'
): string {
  return localization?.country || fallback;
}

/**
 * Get timezone from localization settings
 */
export function getTimezone(
  localization: ThemeLocalizationSettings | null | undefined,
  fallback: string = 'Asia/Singapore'
): string {
  return localization?.timezone || fallback;
}

/**
 * Get language from localization settings
 */
export function getLanguage(
  localization: ThemeLocalizationSettings | null | undefined,
  fallback: string = 'en'
): string {
  return localization?.language || fallback;
}

/**
 * Apply favicon to document head
 * This function handles favicon application and ensures it persists even if other hooks remove it
 */
export function applyFavicon(faviconSrc: string): void {
  if (typeof document === 'undefined') return;
  
  // Determine favicon type based on file extension
  const getFaviconType = (src: string): string => {
    if (src.endsWith('.png')) return 'image/png';
    if (src.endsWith('.jpg') || src.endsWith('.jpeg')) return 'image/jpeg';
    if (src.endsWith('.svg')) return 'image/svg+xml';
    if (src.endsWith('.ico')) return 'image/x-icon';
    return 'image/png'; // Default to PNG
  };
  
  const faviconType = getFaviconType(faviconSrc);
  
  // Remove existing favicon links (including all variations)
  const existingLinks = document.querySelectorAll(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="mask-icon"]'
  );
  existingLinks.forEach(link => link.remove());
  
  // Add new favicon with proper type
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = faviconType;
  link.href = faviconSrc;
  
  // Add to head
  document.head.appendChild(link);
  
  // Also add as shortcut icon for older browsers
  const shortcutLink = document.createElement('link');
  shortcutLink.rel = 'shortcut icon';
  shortcutLink.type = faviconType;
  shortcutLink.href = faviconSrc;
  document.head.appendChild(shortcutLink);
  
  // Set up an observer to re-add favicon if it gets removed (e.g., by useSEO hook)
  // Use MutationObserver to watch for favicon removal
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            if (element.tagName === 'LINK' && 
                (element.getAttribute('rel') === 'icon' || 
                 element.getAttribute('rel') === 'shortcut icon')) {
              // Favicon was removed, re-add it
              setTimeout(() => {
                const currentFavicon = document.querySelector('link[rel="icon"]');
                if (!currentFavicon) {
                  const newLink = document.createElement('link');
                  newLink.rel = 'icon';
                  newLink.type = faviconType;
                  newLink.href = faviconSrc;
                  document.head.appendChild(newLink);
                }
              }, 100);
            }
          }
        });
      });
    });
    
    // Observe the head for changes
    observer.observe(document.head, {
      childList: true,
      subtree: false
    });
    
    // Store observer on window for cleanup if needed
    (window as any).__faviconObserver = observer;
  }
  
  console.log('[testing] Favicon applied:', faviconSrc, 'Type:', faviconType);
}

