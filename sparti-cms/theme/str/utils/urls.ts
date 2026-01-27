/**
 * URL utility functions for STR theme
 * Generates URLs without /theme/str prefix when deployed
 */

/**
 * Determines if we're in a deployed environment (no /theme/str in pathname)
 */
export const isDeployed = (): boolean => {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname;
  return !pathname.includes('/theme/str');
};

/**
 * Gets the base path for the theme
 * Returns empty string for deployed, '/theme/str' for development
 */
export const getBasePath = (): string => {
  return isDeployed() ? '' : '/theme/str';
};

/**
 * Generates a URL for a page, removing /theme/str prefix when deployed
 * @param path - The path relative to the theme root (e.g., '/booking', '/packages', '#programmes', '/theme/str#programmes')
 * @returns The full URL path
 */
export const getThemeUrl = (path: string): string => {
  // If path starts with /theme/str, remove it first
  if (path.startsWith('/theme/str')) {
    path = path.replace('/theme/str', '');
  }
  
  // If path is empty or just '/', return homepage
  if (path === '' || path === '/') {
    return isDeployed() ? '/' : '/theme/str';
  }
  
  // For hash links (e.g., #programmes), always go to homepage with hash
  if (path.startsWith('#')) {
    return isDeployed() ? `/${path}` : `/theme/str${path}`;
  }
  
  // For regular paths, add base path if not deployed
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return isDeployed() ? cleanPath : `/theme/str${cleanPath}`;
};

/**
 * Generates a URL for the homepage
 */
export const getHomeUrl = (): string => {
  return getThemeUrl('/');
};

/**
 * Generates a URL for a specific page
 * @param page - The page slug (e.g., 'booking', 'packages', 'booking/classes')
 */
export const getPageUrl = (page: string): string => {
  return getThemeUrl(`/${page}`);
};
