import React, { useEffect } from 'react';
import { useThemeBranding } from '../../../hooks/useThemeSettings';
import { getSiteName, getSiteDescription, getLogoSrc, getFaviconSrc, applyFavicon } from '../utils/settings';
import { SEOHead } from './SEOHead';
import { GTM } from './GTM';
import { GoogleAnalytics } from './GoogleAnalytics';
import { useCustomCode } from '../hooks/useCustomCode';
import { STR_ASSETS } from '../config/assets';

interface PageWrapperProps {
  tenantName?: string;
  tenantId?: string;
  pageTitle?: string;
  pageDescription?: string;
  children: React.ReactNode;
}

/**
 * Shared wrapper component for all STR theme pages
 * Handles branding, SEO, GTM, GA, and favicon for all pages
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
  tenantName = 'STR',
  tenantId,
  pageTitle,
  pageDescription,
  children
}) => {
  // Load branding settings from database
  const { branding, loading: brandingLoading } = useThemeBranding('str', tenantId || undefined);
  
  // Load custom code settings (for GTM, GA, etc.)
  const { customCode } = useCustomCode(tenantId || undefined);
  
  // Get settings from database with fallback to defaults
  const siteName = getSiteName(branding, tenantName);
  const siteDescription = getSiteDescription(
    branding, 
    pageDescription || 'STR Fitness Club - Evidence-based strength training, personal training, physiotherapy, and group classes in Singapore.'
  );
  const logoSrc = getLogoSrc(branding, STR_ASSETS.logos.header);
  const faviconSrc = getFaviconSrc(branding);
  
  // Determine page meta
  const pageMeta = {
    title: pageTitle ? `${pageTitle} - ${siteName}` : siteName,
    description: siteDescription,
    keywords: 'STR Fitness, strength training, personal training, physiotherapy, group classes, Singapore, fitness, rehabilitation',
    url: typeof window !== 'undefined' ? window.location.href : '',
  };
  
  // Apply favicon when branding loads
  useEffect(() => {
    if (faviconSrc && !brandingLoading) {
      const timeoutId1 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 100);
      
      const timeoutId2 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 500);
      
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        if ((window as any).__faviconObserver) {
          (window as any).__faviconObserver.disconnect();
          delete (window as any).__faviconObserver;
        }
      };
    }
  }, [faviconSrc, brandingLoading]);

  return (
    <>
      {/* SEO metadata */}
      <SEOHead meta={pageMeta} favicon={faviconSrc || undefined} />
      
      {/* Google Tag Manager */}
      <GTM gtmId={customCode?.gtmId} />
      
      {/* Google Analytics */}
      <GoogleAnalytics gaId={customCode?.gaId} />
      
      {/* Render children with branding context */}
      {React.cloneElement(children as React.ReactElement, {
        siteName,
        logoSrc,
        faviconSrc,
      })}
    </>
  );
};
