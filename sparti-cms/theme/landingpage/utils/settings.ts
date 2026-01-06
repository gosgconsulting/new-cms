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
 */
export function applyFavicon(faviconSrc: string): void {
  if (typeof document === 'undefined') return;
  
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingLinks.forEach(link => link.remove());
  
  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = faviconSrc;
  document.head.appendChild(link);
}

