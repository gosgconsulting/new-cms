import React, { useState, useEffect } from 'react';
import './theme.css';
import { DynamicPageRenderer } from './components/DynamicPageRenderer';
import { SEOHead } from './components/SEOHead';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import { PopupProvider, usePopup } from './contexts/PopupContext';
import { useThemeBranding, useThemeStyles } from '../../hooks/useThemeSettings';
import { applyThemeStyles } from '../../utils/applyThemeStyles';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
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
  const favicon = branding?.site_favicon || '/favicon.png';
  
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
      <SEOHead meta={homepageData.meta} favicon={favicon} />
      
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
 * Full-stack digital growth solution theme with blog functionality
 */
const GOSGTheme: React.FC<TenantLandingProps> = ({ 
  tenantName = 'GO SG Consulting', 
  tenantSlug = 'gosgconsulting' 
}) => {
  return (
    <PopupProvider>
      <GOSGContent tenantName={tenantName} tenantSlug={tenantSlug} />
    </PopupProvider>
  );
};

export default GOSGTheme;
