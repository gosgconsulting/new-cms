import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

import "./theme.css";

import HomePage from "./pages/HomePage";
import PricingPage from "./pages/PricingPage";
import GalleryPage from "./pages/GalleryPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import FindUsPage from "./pages/FindUsPage";
import LegalPlaceholderPage from "./pages/LegalPlaceholderPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFoundPage from "./pages/NotFoundPage";
import { ThankYouPage } from "./components/ThankYouPage";
import { useThemeBranding } from '../../hooks/useThemeSettings';
import { getSiteName, getSiteDescription, getLogoSrc, getFaviconSrc, applyFavicon } from './utils/settings';
import { SEOHead } from './components/SEOHead';

interface NailQueenThemeProps {
  basePath?: string;
  pageSlug?: string;
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

const normalizeSlug = (slug?: string) => {
  if (!slug) return "";
  return String(slug)
    .split("?")[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
};

const NailQueenTheme: React.FC<NailQueenThemeProps> = ({
  basePath,
  pageSlug,
  tenantSlug,
  tenantName = "Nail Queen",
  tenantId = "tenant-nail-queen",
}) => {
  const location = useLocation();

  const themeSlug = tenantSlug || "nail-queen";
  const resolvedBasePath = basePath || `/theme/${themeSlug}`;

  // Load branding settings from database
  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding('nail-queen', tenantId);
  
  // Get settings from database with fallback to defaults
  const siteName = getSiteName(branding, tenantName);
  const siteDescription = getSiteDescription(branding, 'Nail Queen - Premium nail care services in Singapore. Expert manicure, pedicure, nail art, and beauty treatments.');
  const logoSrc = getLogoSrc(branding);
  const faviconSrc = getFaviconSrc(branding);
  
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
  
  // Log branding loading state for debugging
  useEffect(() => {
    if (brandingError) {
      console.error('[testing] Error loading branding settings:', brandingError);
    }
    if (branding) {
      console.log('[testing] Branding settings loaded:', branding);
    }
  }, [branding, brandingError]);

  const normalized = normalizeSlug(pageSlug);
  const slugParts = normalized.split("/").filter(Boolean);
  const topLevel = slugParts[0] || "";

  // Determine current page meta data
  const pageMeta = useMemo(() => {
    const baseMeta = {
      title: siteName,
      description: siteDescription,
      keywords: 'nail queen, nail care, manicure, pedicure, nail art, beauty treatments, Singapore, nail salon',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (topLevel === 'pricing') {
      return { ...baseMeta, title: `Pricing - ${siteName}`, description: 'View our pricing for premium nail care services.' };
    }
    if (topLevel === 'gallery') {
      return { ...baseMeta, title: `Gallery - ${siteName}`, description: 'Browse our gallery of beautiful nail art and designs.' };
    }
    if (topLevel === 'about') {
      return { ...baseMeta, title: `About Us - ${siteName}`, description: 'Learn more about our team and services.' };
    }
    if (topLevel === 'blog') {
      return { ...baseMeta, title: `Blog - ${siteName}`, description: 'Read our latest articles and nail care tips.' };
    }
    if (topLevel === 'find-us') {
      return { ...baseMeta, title: `Find Us - ${siteName}`, description: 'Visit our salon and get in touch with us.' };
    }

    return baseMeta;
  }, [siteName, siteDescription, topLevel]);

  const renderRoute = () => {
    switch (topLevel) {
      case "":
        return <HomePage basePath={resolvedBasePath} tenantId={tenantId} />;
      case "pricing":
        return <PricingPage basePath={resolvedBasePath} tenantId={tenantId} />;
      case "gallery":
        return <GalleryPage basePath={resolvedBasePath} tenantId={tenantId} />;
      case "about":
        return <AboutPage basePath={resolvedBasePath} tenantId={tenantId} />;
      case "blog":
        // Check if there's a second part (blog post slug)
        if (slugParts.length > 1) {
          const postSlug = slugParts.slice(1).join("/");
          return <BlogPostPage basePath={resolvedBasePath} slug={postSlug} tenantId={tenantId} />;
        }
        return <BlogPage basePath={resolvedBasePath} tenantId={tenantId} />;
      case "find-us":
        return <FindUsPage basePath={resolvedBasePath} tenantId={tenantId} />;
      case "thank-you":
        return (
          <ThankYouPage
            basePath={resolvedBasePath}
            tenantName={siteName}
            tenantSlug={tenantSlug}
            tenantId={tenantId}
          />
        );
      case "privacy":
        return (
          <PrivacyPolicy
            basePath={resolvedBasePath}
            tenantId={tenantId}
          />
        );
      case "terms":
        return (
          <TermsAndConditions
            basePath={resolvedBasePath}
            tenantId={tenantId}
          />
        );
      default:
        return <NotFoundPage basePath={resolvedBasePath} path={location.pathname} />;
    }
  };

  return (
    <div className="nail-queen-theme">
      {/* SEO metadata */}
      <SEOHead meta={pageMeta} favicon={faviconSrc || undefined} />
      
      {/* Keeping the tenantName prop available for future integration */}
      <div data-theme-slug={themeSlug} data-tenant-name={siteName}>
        {renderRoute()}
      </div>
    </div>
  );
};

export default NailQueenTheme;