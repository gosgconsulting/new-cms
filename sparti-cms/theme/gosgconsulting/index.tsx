import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './theme.css';
import { DynamicPageRenderer } from './components/DynamicPageRenderer';
import { SEOHead } from './components/SEOHead';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import { PopupProvider, usePopup } from './contexts/PopupContext';
import { useThemeBranding, useThemeStyles } from '../../hooks/useThemeSettings';
import { applyThemeStyles } from '../../utils/applyThemeStyles';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  pageSlug?: string;
}

/**
 * Home/Front Page Content Component
 * 
 * Complete GOSG homepage with dynamic page rendering
 */
const GOSGContent: React.FC<TenantLandingProps> = ({ 
  tenantName = 'GO SG Consulting', 
  tenantSlug = 'gosgconsulting' 
}) => {
  const { contactModalOpen, setContactModalOpen, openPopup } = usePopup();
  
  // Load branding settings from database
  // Note: The API expects tenantId in the query string, but the hook uses tenantSlug
  // We need to pass 'tenant-gosg' as the tenantSlug parameter
  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding('gosgconsulting', 'tenant-gosg');
  
  // Load theme styles from database
  const { styles, loading: stylesLoading, error: stylesError } = useThemeStyles('gosgconsulting', 'tenant-gosg');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Add event listener for pricing card contact modal
    const handleOpenContactModal = () => {
      setContactModalOpen(true);
    };
    
    window.addEventListener('openContactModal', handleOpenContactModal);
    
    return () => {
      window.removeEventListener('openContactModal', handleOpenContactModal);
    };
  }, [setContactModalOpen]);
  
  // Apply theme styles when they load
  useEffect(() => {
    if (styles) {
      applyThemeStyles(styles);
      console.log('[testing] Applied theme styles from database');
    } else if (stylesError) {
      console.error('[testing] Error loading theme styles:', stylesError);
    }
    
    // Cleanup on unmount
    return () => {
      // Note: We don't remove styles on unmount as they should persist
      // If needed, we could call removeThemeStyles() here
    };
  }, [styles, stylesError]);
  
  // Extract branding values with fallbacks
  const siteName = branding?.site_name || tenantName;
  const logoSrc = branding?.site_logo || '/theme/gosgconsulting/assets/go-sg-logo-official.png';
  const favicon = branding?.site_favicon || null;
  
  // Log branding loading state for debugging
  useEffect(() => {
    if (brandingError) {
      console.error('[testing] Error loading branding settings:', brandingError);
    }
    if (branding) {
      console.log('[testing] Branding settings loaded:', branding);
    }
  }, [branding, brandingError]);
  
  // Complete homepage data with all GOSG sections
  const homepageData = {
    slug: 'home',
    meta: {
      title: 'GO SG Consulting - Full-Stack Digital Growth Solution',
      description: 'Helping brands grow their revenue and leads through comprehensive digital marketing services including SEO, SEM, Social Media Ads, Website Design, and Graphic Design.',
      keywords: 'digital marketing, SEO, SEM, social media ads, website design, graphic design, Singapore, full-stack',
    },
    components: [
      // Section 1 — Hero
      {
        key: "MainHeroSection",
        name: "Hero",
        type: "HomeHeroSection",
        items: [
          { key: "headingPrefix", type: "heading", level: 1, content: "Turn traffic into revenue with a" },
          { key: "headingEmphasis", type: "heading", level: 1, content: "Full‑Stack Growth Engine" }
        ]
      },

      // Section 2 — Challenge (animation left, problem layout right)
      {
        key: "ProblemSection",
        name: "Problem",
        type: "ChallengeSection",
        items: [
          { key: "hint", type: "text", content: "You have a great business but struggle online?" },
          { key: "heading", type: "heading", level: 2, content: "Your Business Works… Your Marketing Doesn't" },
          {
            key: "bullets",
            type: "array",
            items: [
              { key: "b1", type: "text", content: "You know your craft — but not SEO, ads, funnels", icon: "x" },
              { key: "b2", type: "text", content: "Leads don't grow month after month", icon: "sparkles" },
              { key: "b3", type: "text", content: "Ad money burns without profit", icon: "barChart3" }
            ]
          }
        ]
      },

      // Section 3 — Animated headline section
      {
        key: "AnimatedAboutSection",
        name: "Animated About",
        type: "AboutSection2",
        items: []
      },

      // Section 4 — Pricing Page section
      {
        key: "PricingPageSection",
        name: "Pricing",
        type: "PricingPage",
        items: []
      },

      // Section 5 — Gallery4 services section
      {
        key: "Gallery4Section",
        name: "Our Services",
        type: "Gallery4Section",
        items: []
      }
    ]
  };

  const handleContactClick = () => {
    setContactModalOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO metadata */}
      <SEOHead meta={homepageData.meta} />
      
      {/* Header */}
      <Header 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        onContactClick={handleContactClick}
      />
      
      {/* Main content: Dynamic page rendering */}
      <main className="flex-grow">
        <DynamicPageRenderer
          schema={homepageData}
          onContactClick={handleContactClick}
          onPopupOpen={openPopup}
        />
      </main>
      
      {/* Footer */}
      <Footer 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        companyDescription={branding?.site_description || "Full-stack digital growth solution helping brands grow their revenue and leads through comprehensive digital marketing services."}
        onContactClick={handleContactClick}
      />
      
      {/* Contact Modal */}
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

/**
 * GO SG Consulting Theme
 * Full-stack digital growth solution theme with blog functionality and e-commerce
 */
const GOSGTheme: React.FC<TenantLandingProps> = ({ 
  tenantName = 'GO SG Consulting', 
  tenantSlug = 'gosgconsulting',
  pageSlug
}) => {
  const location = useLocation();
  const params = useParams<{ pageSlug?: string; productname?: string }>();
  
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
    
    // Check for product route (special case: /product/:productname)
    if (params.productname) {
      return 'product';
    }
    
    // Otherwise, extract from pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    const themeIndex = pathParts.indexOf(tenantSlug);
    if (themeIndex >= 0 && themeIndex < pathParts.length - 1) {
      const nextPart = pathParts[themeIndex + 1];
      // Check if it's a product route
      if (nextPart === 'product' && themeIndex + 2 < pathParts.length) {
        return 'product';
      }
      return nextPart;
    }
    
    return ''; // Homepage
  }, [location.pathname, tenantSlug, params.pageSlug, params.productname, pageSlug]);

  // Extract product name for product page
  const getProductName = () => {
    if (currentPage === 'product') {
      // Try to get from params first
      if (params.productname) {
        return params.productname;
      }
      // Check if pageSlug contains product path
      if (pageSlug && pageSlug.startsWith('product/')) {
        return pageSlug.replace('product/', '');
      }
      // Otherwise extract from pathname
      const pathParts = location.pathname.split('/').filter(Boolean);
      const themeIndex = pathParts.indexOf(tenantSlug);
      if (themeIndex >= 0 && themeIndex + 2 < pathParts.length && pathParts[themeIndex + 1] === 'product') {
        return pathParts[themeIndex + 2];
      }
    }
    return null;
  };

  // Render the appropriate page component based on current route
  const renderPage = () => {
    switch (currentPage) {
      case '':
      case undefined:
        return <GOSGContent tenantName={tenantName} tenantSlug={tenantSlug} />;
      case 'shop':
        return <Shop />;
      case 'cart':
        return <Cart />;
      case 'product':
        // Product page needs the product name - it will extract from URL
        return <Product />;
      case 'checkout':
        return <Checkout />;
      default:
        return <NotFound />;
    }
  };

  // For shop pages, we need to wrap them with Header and Footer
  const needsLayout = ['shop', 'cart', 'product', 'checkout'].includes(currentPage || '');

  if (needsLayout) {
    return (
      <PopupProvider>
        <ShopPageLayout tenantName={tenantName} tenantSlug={tenantSlug}>
          {renderPage()}
        </ShopPageLayout>
      </PopupProvider>
    );
  }

  // Homepage uses GOSGContent which already has Header/Footer
  return (
    <PopupProvider>
      {renderPage()}
    </PopupProvider>
  );
};

// Layout component for shop pages
interface ShopPageLayoutProps {
  children: React.ReactNode;
  tenantName?: string;
  tenantSlug?: string;
}

const ShopPageLayout: React.FC<ShopPageLayoutProps> = ({ 
  children, 
  tenantName = 'GO SG Consulting',
  tenantSlug = 'gosgconsulting'
}) => {
  const { contactModalOpen, setContactModalOpen } = usePopup();
  const { branding } = useThemeBranding('gosgconsulting', 'tenant-gosg');
  
  const siteName = branding?.site_name || tenantName;
  const logoSrc = branding?.site_logo || '/theme/gosgconsulting/assets/go-sg-logo-official.png';

  const handleContactClick = () => {
    setContactModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        onContactClick={handleContactClick}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        companyDescription={branding?.site_description || "Full-stack digital growth solution helping brands grow their revenue and leads through comprehensive digital marketing services."}
        onContactClick={handleContactClick}
      />
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

export default GOSGTheme;