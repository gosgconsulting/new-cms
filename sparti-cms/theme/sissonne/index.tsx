import React, { useMemo } from 'react';
import { useLocation, useParams } from "react-router-dom";
import './theme.css';
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Programs from "./pages/Programs";
import Faculty from "./pages/Faculty";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Baskerville from "./pages/Baskerville";
import EbGaramond from "./pages/EbGaramond";
import Lora from "./pages/Lora";
import AmalfiAvenir from "./pages/AmalfiAvenir";

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  pageSlug?: string;
}

/**
 * Sissonne Dance Academy Theme
 * A sophisticated dance academy theme with multiple pages, programs showcase,
 * faculty profiles, gallery, and comprehensive dance education content.
 * 
 * Uses the parent app's router - routes are determined by the current location path.
 * Handles both /theme/sissonne (homepage) and /theme/sissonne/:pageSlug (sub-pages).
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Sissonne Dance Academy', 
  tenantSlug = 'sissonne',
  tenantId,
  pageSlug
}) => {
  const location = useLocation();
  const params = useParams<{ pageSlug?: string }>();
  
  // Determine which page to render
  // Priority: 1) pageSlug prop, 2) params.pageSlug, 3) extract from pathname, 4) homepage
  const currentPage = useMemo(() => {
    // Check pageSlug prop first (passed from TenantLandingPage)
    if (pageSlug) {
      return pageSlug;
    }
    
    // Check if we have a pageSlug param (from /theme/:tenantSlug/:pageSlug route)
    if (params.pageSlug) {
      return params.pageSlug;
    }
    
    // Otherwise, extract from pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    const themeIndex = pathParts.indexOf(tenantSlug);
    if (themeIndex >= 0 && themeIndex < pathParts.length - 1) {
      return pathParts[themeIndex + 1];
    }
    
    return ''; // Homepage
  }, [location.pathname, tenantSlug, params.pageSlug, pageSlug]);

  // Render the appropriate page component based on current route
  const renderPage = () => {
    switch (currentPage) {
      case '':
      case undefined:
        return <Index />;
      case 'programs':
        return <Programs />;
      case 'faculty':
        return <Faculty />;
      case 'gallery':
        return <Gallery />;
      case 'about':
        return <About />;
      case 'baskerville':
        return <Baskerville />;
      case 'eb-garamond':
        return <EbGaramond />;
      case 'lora':
        return <Lora />;
      case 'amalfi-avenir':
        return <AmalfiAvenir />;
      default:
        return <NotFound />;
    }
  };

  return (
    <Layout tenantSlug={tenantSlug}>
      {renderPage()}
    </Layout>
  );
};

export default TenantLanding;
