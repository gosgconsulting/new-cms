import React, { useState, useEffect } from 'react';
import './theme.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import { ContactFormDialog } from './components/ContactFormDialog';
import { useThemeSettings, useThemeBranding } from '../../hooks/useThemeSettings';
import { getSiteName, getLogoSrc, getFaviconSrc, applyFavicon } from './utils/settings';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

/**
 * ACATR Professional Business Services Landing Page Theme
 * Fetches settings from database via API, with fallback to default values
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'ACATR Business Services', 
  tenantSlug = 'landingpage',
  tenantId
}) => {
  // Get tenant ID from props or environment
  const effectiveTenantId = tenantId || (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) || null;
  
  // Log tenant ID for debugging
  if (effectiveTenantId) {
    console.log('[testing] Theme using tenant ID:', effectiveTenantId);
  }
  
  // Fetch branding settings from database
  // Pass tenantId (not tenantSlug) to the hook
  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding(tenantSlug, 'tenant-2960b682'); // TODO: fix this
  
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const handleContactClick = () => {
    setIsContactDialogOpen(true);
  };

  // Get settings from database with fallback to defaults using utility functions
  const siteName = getSiteName(branding, tenantName);
  const siteTagline = branding?.site_tagline || '';
  const siteDescription = branding?.site_description || '';
  const logoSrc = getLogoSrc(branding);
  const faviconSrc = getFaviconSrc(branding);
  const heroImageSrc = '/theme/landingpage/assets/hero-business.jpg';
  
  // Apply favicon when branding loads
  useEffect(() => {
    if (faviconSrc && !brandingLoading) {
      // Apply favicon immediately
      applyFavicon(faviconSrc);
      
      // Also apply after a short delay to ensure it persists (in case useSEO runs after)
      const timeoutId = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
        // Clean up observer if it exists
        if ((window as any).__faviconObserver) {
          (window as any).__faviconObserver.disconnect();
          delete (window as any).__faviconObserver;
        }
      };
    }
  }, [faviconSrc, brandingLoading]);
  
  // Show loading state if settings are being fetched
  if (brandingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Log any errors but continue with fallback values
  if (brandingError) {
    console.warn('[testing] Error loading branding settings, using defaults:', brandingError);
  }
  
  // Service images
  const serviceImages = [
    '/theme/landingpage/assets/incorporation-services.jpg',
    '/theme/landingpage/assets/accounting-dashboard.jpg',
    '/theme/landingpage/assets/corporate-secretarial.jpg'
  ];

  // Professional services data
  const services = [
    {
      title: 'Singapore Company Incorporation Services',
      subtitle: 'One-Time Fee: S$1,815 (S$1,115 for Locals)',
      description: 'Professional incorporation services for Singapore Pte. Ltd. companies, providing comprehensive setup and ongoing compliance support for local and international entrepreneurs. Includes professional fees (S$1,500) + government fees (S$315). Local clients pay only S$800 professional fee + S$315 government fee.',
      image: serviceImages[0],
      features: [
        'Company registration with ACRA',
        'Corporate secretary services included',
        'Company constitution and statutory documents',
        'Initial compliance setup',
        'Complete documentation for local & international clients',
        'Standard incorporation: 1 week timeline'
      ],
      highlight: 'Fast-track option available with complete documentation'
    },
    {
      title: 'Annual Ongoing Services',
      subtitle: 'S$4,300/year (varies by transaction volume)',
      description: 'Comprehensive annual compliance and support services to maintain your Singapore company in good standing. Includes corporate secretary fee (S$800), tax filing services (S$800), basic bookkeeping (S$200), and local director services (S$2,500). Accounting fees are variable based on transaction volume and can increase up to S$6,000/year for high-volume businesses.',
      image: serviceImages[1],
      features: [
        'Corporate Secretary Fee (S$800/year)',
        'Tax Filing Services (S$1,200/year)',
        'Basic Bookkeeping (S$900/year minimum)',
        'Local Director Services (S$4,500/year)',
        'Annual compliance filing',
        'Regulatory authority submissions'
      ],
      highlight: 'Local director fee waived if client provides their own'
    },
    {
      title: 'Additional Services & Support',
      subtitle: 'Enhanced Business Operations',
      description: 'Comprehensive additional services to support your Singapore business operations beyond basic incorporation and compliance. From registered address services to employment pass assistance, we provide end-to-end support for your business growth and operational needs in Singapore.',
      image: serviceImages[2],
      features: [
        'Registered address and mailroom services',
        'Enhanced bookkeeping (monthly/weekly)',
        'Payroll services',
        'GST registration and filing',
        'Employment pass visa assistance',
        'Banking account opening support'
      ],
      highlight: 'Streamlined process from setup to operations with professional oversight'
    }
  ];

  // Always render hardcoded content - no database checks
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        onContactClick={handleContactClick}
      />

      {/* Hero Section */}
      <HeroSection 
        tenantName={siteName}
        title="Singapore Business Setup In 24 Hours - ACRA Registered"
        description="ACRA-registered filing agents providing complete Singapore company incorporation, professional accounting services, and 100% compliance guarantee. Start your business today with expert guidance from day one."
        imageSrc={heroImageSrc}
        imageAlt="Professional business team collaboration"
        buttonText="Start Your Business Journey Today"
        features={[
          'Singapore Company Incorporation in 24 Hours',
          '100% ACRA & IRAS Compliance Guaranteed',
          'Professional Accounting & GST Filing'
        ]}
        onButtonClick={handleContactClick}
      />

      {/* Services Section */}
      <ServicesSection 
        title="Complete Singapore Business Solutions with ACRA Guarantee"
        subtitle="ACRA-registered filing agents providing 24-hour company incorporation, professional accounting services, and guaranteed compliance for Singapore businesses."
        services={services}
        onContactClick={handleContactClick}
      />

      {/* Testimonials Section */}
      <TestimonialsSection 
        title="Trusted by Businesses Worldwide"
        subtitle="Local and international businesses trust our ACRA-registered filing agents for 24-hour Singapore company incorporation, professional accounting services, and guaranteed compliance with zero penalties."
      />

      {/* FAQ Section */}
      <FAQSection 
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about our services, processes, and how we can help your business succeed."
      />

      {/* CTA Section */}
      <CTASection 
        title="Results You Can Count On"
        description="Our clients consistently experience accelerated growth, improved compliance, and valuable time savings thanks to our all-encompassing support. By providing end-to-end solutions from incorporation to regulatory management, we enable businesses to operate seamlessly and confidently."
        buttonText="Start Your Business Journey Today"
        onButtonClick={handleContactClick}
      />

      {/* Footer */}
      <Footer 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        companyDescription="Empowering businesses with professional, efficient, and scalable support. Your trusted partner for business success from day one."
      />

      {/* Contact Form Dialog */}
      <ContactFormDialog 
        isOpen={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
      >
        <div />
      </ContactFormDialog>
    </div>
  );
};

export default TenantLanding;

