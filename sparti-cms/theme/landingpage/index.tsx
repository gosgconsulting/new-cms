import React, { useState, useEffect, useMemo } from 'react';
import './theme.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import { ContactFormDialog } from './components/ContactFormDialog';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { usePageLayout, getComponentByType, hasLayoutComponents } from '../../hooks/usePageLayout';
import { ComponentSchema } from '../../types/schema';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
}

/**
 * Convert hex color to HSL format (H S% L%)
 * @param hex - Hex color string (e.g., "#8b5cf6" or "8b5cf6")
 * @returns HSL string in format "H S% L%" (e.g., "263 70% 59%")
 */
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

/**
 * Apply theme styles to CSS variables
 */
interface ThemeStyleSettings {
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  accent?: string;
  accentForeground?: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  destructive?: string;
  destructiveForeground?: string;
  typography?: {
    fontSans?: string;
    fontSerif?: string;
    fontMono?: string;
    baseFontSize?: string;
    headingScale?: string;
    lineHeight?: string;
  };
}

function applyThemeStyles(styles: ThemeStyleSettings) {
  if (!styles || typeof styles !== 'object') return;

  const root = document.documentElement;

  // Apply color styles (convert hex to HSL)
  if (styles.primary) {
    root.style.setProperty('--primary', hexToHsl(styles.primary));
  }
  if (styles.primaryForeground) {
    root.style.setProperty('--primary-foreground', hexToHsl(styles.primaryForeground));
  }
  if (styles.secondary) {
    root.style.setProperty('--secondary', hexToHsl(styles.secondary));
  }
  if (styles.secondaryForeground) {
    root.style.setProperty('--secondary-foreground', hexToHsl(styles.secondaryForeground));
  }
  if (styles.background) {
    root.style.setProperty('--background', hexToHsl(styles.background));
  }
  if (styles.foreground) {
    root.style.setProperty('--foreground', hexToHsl(styles.foreground));
  }
  if (styles.card) {
    root.style.setProperty('--card', hexToHsl(styles.card));
  }
  if (styles.cardForeground) {
    root.style.setProperty('--card-foreground', hexToHsl(styles.cardForeground));
  }
  if (styles.accent) {
    root.style.setProperty('--accent', hexToHsl(styles.accent));
  }
  if (styles.accentForeground) {
    root.style.setProperty('--accent-foreground', hexToHsl(styles.accentForeground));
  }
  if (styles.muted) {
    root.style.setProperty('--muted', hexToHsl(styles.muted));
  }
  if (styles.mutedForeground) {
    root.style.setProperty('--muted-foreground', hexToHsl(styles.mutedForeground));
  }
  if (styles.border) {
    root.style.setProperty('--border', hexToHsl(styles.border));
  }
  if (styles.input) {
    root.style.setProperty('--input', hexToHsl(styles.input));
  }
  if (styles.ring) {
    root.style.setProperty('--ring', hexToHsl(styles.ring));
  }
  if (styles.destructive) {
    root.style.setProperty('--destructive', hexToHsl(styles.destructive));
  }
  if (styles.destructiveForeground) {
    root.style.setProperty('--destructive-foreground', hexToHsl(styles.destructiveForeground));
  }

  // Apply typography styles
  if (styles.typography) {
    const typo = styles.typography;
    if (typo.fontSans) {
      root.style.setProperty('--font-sans', typo.fontSans);
      root.style.setProperty('font-family', typo.fontSans);
      // Also apply to body element
      if (document.body) {
        document.body.style.fontFamily = typo.fontSans;
      }
    }
    if (typo.fontSerif) {
      root.style.setProperty('--font-serif', typo.fontSerif);
    }
    if (typo.fontMono) {
      root.style.setProperty('--font-mono', typo.fontMono);
    }
    if (typo.baseFontSize) {
      root.style.setProperty('--font-base-size', typo.baseFontSize);
      root.style.setProperty('font-size', typo.baseFontSize);
      // Also apply to body element
      if (document.body) {
        document.body.style.fontSize = typo.baseFontSize;
      }
    }
    if (typo.headingScale) {
      root.style.setProperty('--font-heading-scale', typo.headingScale);
    }
    if (typo.lineHeight) {
      root.style.setProperty('--font-line-height', typo.lineHeight);
      root.style.setProperty('line-height', typo.lineHeight);
      // Also apply to body element
      if (document.body) {
        document.body.style.lineHeight = typo.lineHeight;
      }
    }
  }
}

/**
 * ACATR Professional Business Services Landing Page Theme
 * A sophisticated, multi-component landing page for business services
 * with dynamic content support and professional design
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'ACATR Business Services', 
  tenantSlug = 'landingpage' 
}) => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Fetch theme settings from database
  const { settings, loading: settingsLoading, error: settingsError } = useThemeSettings('landingpage', tenantSlug);
  
  // Fetch page layout from database (prioritize database content)
  const { data: pageData, loading: pageLoading, error: pageError } = usePageLayout({
    slug: '/',
    tenantId: tenantSlug,
    themeId: 'landingpage',
    mode: 'theme'
  });
  
  // Check if we have database content
  const hasDatabaseContent = hasLayoutComponents(pageData?.layout);

  const handleContactClick = () => {
    setIsContactDialogOpen(true);
  };

  // Get settings with fallbacks
  const branding = settings?.branding || {};
  const localization = settings?.localization || {};
  
  // Extract and parse theme styles from settings
  // Priority: settings.theme.theme_styles > settings.styles (if it's a styles object)
  const themeStyles = useMemo(() => {
    let styles: ThemeStyleSettings = {};
    
    // Priority 1: Check if theme_styles is in the theme category (this is where styles are saved)
    if (settings?.theme?.theme_styles) {
      const themeStylesValue = settings.theme.theme_styles;
      if (typeof themeStylesValue === 'string') {
        try {
          const parsed = JSON.parse(themeStylesValue) as ThemeStyleSettings;
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            styles = parsed;
            console.log('[testing] Loaded styles from settings.theme.theme_styles (parsed JSON)');
          }
        } catch (e) {
          console.error('[Theme] Error parsing theme_styles JSON:', e);
        }
      } else if (typeof themeStylesValue === 'object' && !Array.isArray(themeStylesValue)) {
        styles = themeStylesValue as ThemeStyleSettings;
        console.log('[testing] Loaded styles from settings.theme.theme_styles (object)');
      }
    }
    
    // Priority 2: Check if settings.styles exists and has color properties (already parsed)
    // This is a fallback for backward compatibility
    if (Object.keys(styles).length === 0 && settings?.styles && typeof settings.styles === 'object' && !Array.isArray(settings.styles)) {
      // Check if it's already a styles object (has color properties)
      if ('primary' in settings.styles || 'background' in settings.styles || 'typography' in settings.styles) {
        styles = settings.styles as ThemeStyleSettings;
        console.log('[testing] Loaded styles from settings.styles (object)');
      }
    }
    
    // Priority 3: If styles is a string (JSON), parse it
    if (Object.keys(styles).length === 0 && typeof settings?.styles === 'string') {
      try {
        const parsed = JSON.parse(settings.styles) as ThemeStyleSettings;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          styles = parsed;
          console.log('[testing] Loaded styles from settings.styles (parsed JSON)');
        }
      } catch (e) {
        console.error('[Theme] Error parsing styles JSON:', e);
      }
    }
    
    if (Object.keys(styles).length > 0) {
      console.log('[testing] Theme styles loaded:', {
        hasColors: !!(styles.primary || styles.background),
        hasTypography: !!styles.typography,
        keys: Object.keys(styles)
      });
    }
    
    return styles;
  }, [settings?.styles, settings?.theme?.theme_styles]);

  // Apply theme styles to CSS variables when settings are loaded
  useEffect(() => {
    if (themeStyles && Object.keys(themeStyles).length > 0) {
      applyThemeStyles(themeStyles);
    }
  }, [themeStyles]);

  // Use settings from database, fallback to defaults
  const siteName = branding.site_name || tenantName;
  const siteTagline = branding.site_tagline || '';
  const siteDescription = branding.site_description || '';
  const logoSrc = branding.site_logo || '/theme/landingpage/assets/752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png';
  const heroImageSrc = '/theme/landingpage/assets/hero-business.jpg';
  
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
        'Tax Filing Services (S$800/year)',
        'Basic Bookkeeping (S$200/year minimum)',
        'Local Director Services (S$2,500/year)',
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

  // Show loading state while fetching settings or page data
  if (settingsLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page content...</p>
        </div>
      </div>
    );
  }

  // Show error state if settings fail to load (but still render with defaults)
  if (settingsError) {
    console.warn('[Theme] Error loading settings, using defaults:', settingsError);
  }
  
  if (pageError) {
    console.warn('[Theme] Error loading page layout:', pageError);
  }

  // Get components from database layout
  // Support both old format (type-based) and new format (schema with items array)
  const components = hasDatabaseContent && pageData?.layout?.components ? pageData.layout.components : [];
  
  // Helper to find component by type (supports both old and new formats)
  const findComponentByType = (type: string | string[]): ComponentSchema | undefined => {
    const types = Array.isArray(type) ? type : [type];
    return components.find(comp => 
      types.includes(comp.type) || 
      types.includes(comp.key) ||
      (comp.type && types.some(t => comp.type.toLowerCase().includes(t.toLowerCase())))
    );
  };

  const headerComponent = hasDatabaseContent ? (findComponentByType(['header-main', 'Header']) || getComponentByType(pageData?.layout, 'header-main')) : null;
  const heroComponent = hasDatabaseContent ? (findComponentByType(['HeroSection', 'hero-main', 'Hero']) || getComponentByType(pageData?.layout, 'hero-main')) : null;
  const servicesComponent = hasDatabaseContent ? (findComponentByType(['ServicesShowcase', 'services-section', 'Services']) || getComponentByType(pageData?.layout, 'services-section')) : null;
  const testimonialsComponent = hasDatabaseContent ? (findComponentByType(['Testimonials', 'testimonials-section']) || getComponentByType(pageData?.layout, 'testimonials-section')) : null;
  const faqComponent = hasDatabaseContent ? (findComponentByType(['FAQAccordion', 'faq-section', 'FAQ']) || getComponentByType(pageData?.layout, 'faq-section')) : null;
  const ctaComponent = hasDatabaseContent ? (findComponentByType(['ContactForm', 'cta-section', 'Contact']) || getComponentByType(pageData?.layout, 'cta-section')) : null;
  const footerComponent = hasDatabaseContent ? (findComponentByType(['footer-main', 'Footer']) || getComponentByType(pageData?.layout, 'footer-main')) : null;

  // If database has content, only show sections that exist in database
  // If database has no content, show placeholder message
  if (hasDatabaseContent) {
    return (
      <div className="min-h-screen bg-background">
        {/* Only render sections that exist in database */}
        {headerComponent && (
          <Header 
            tenantName={siteName}
            tenantSlug={tenantSlug}
            logoSrc={logoSrc}
            onContactClick={handleContactClick}
            data={headerComponent}
          />
        )}

        {heroComponent && (
          <HeroSection 
            tenantName={siteName}
            title={siteTagline || "Singapore Business Setup In 24 Hours - ACRA Registered"}
            description={siteDescription || "ACRA-registered filing agents providing complete Singapore company incorporation, professional accounting services, and 100% compliance guarantee. Start your business today with expert guidance from day one."}
            imageSrc={heroImageSrc}
            imageAlt="Professional business team collaboration"
            buttonText="Start Your Business Journey Today"
            features={[
              'Singapore Company Incorporation in 24 Hours',
              '100% ACRA & IRAS Compliance Guaranteed',
              'Professional Accounting & GST Filing'
            ]}
            onButtonClick={handleContactClick}
            data={heroComponent}
          />
        )}

        {servicesComponent && (
          <ServicesSection 
            title="Complete Singapore Business Solutions with ACRA Guarantee"
            subtitle="ACRA-registered filing agents providing 24-hour company incorporation, professional accounting services, and guaranteed compliance for Singapore businesses."
            services={services}
            onContactClick={handleContactClick}
            data={servicesComponent}
          />
        )}

        {testimonialsComponent && (
          <TestimonialsSection 
            title="Trusted by Businesses Worldwide"
            subtitle="Local and international businesses trust our ACRA-registered filing agents for 24-hour Singapore company incorporation, professional accounting services, and guaranteed compliance with zero penalties."
            data={testimonialsComponent}
          />
        )}

        {faqComponent && (
          <FAQSection 
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our services, processes, and how we can help your business succeed."
            data={faqComponent}
          />
        )}

        {ctaComponent && (
          <CTASection 
            title="Results You Can Count On"
            description="Our clients consistently experience accelerated growth, improved compliance, and valuable time savings thanks to our all-encompassing support. By providing end-to-end solutions from incorporation to regulatory management, we enable businesses to operate seamlessly and confidently."
            buttonText="Start Your Business Journey Today"
            onButtonClick={handleContactClick}
            data={ctaComponent}
          />
        )}

        {footerComponent && (
          <Footer 
            tenantName={siteName}
            tenantSlug={tenantSlug}
            logoSrc={logoSrc}
            companyDescription={siteDescription || "Empowering businesses with professional, efficient, and scalable support. Your trusted partner for business success from day one."}
            data={footerComponent}
          />
        )}

        {/* Show message if no components are found in database */}
        {!headerComponent && !heroComponent && !servicesComponent && !testimonialsComponent && !faqComponent && !ctaComponent && !footerComponent && (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg max-w-md">
              <h2 className="text-2xl font-bold mb-4">No Database Content Found</h2>
              <p className="text-muted-foreground mb-4">
                This page has a layout in the database, but no components are configured yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Go to the CMS editor to add components to this page.
              </p>
            </div>
          </div>
        )}

        {/* Contact Form Dialog */}
        <ContactFormDialog 
          isOpen={isContactDialogOpen}
          onOpenChange={setIsContactDialogOpen}
        >
          <div />
        </ContactFormDialog>
      </div>
    );
  }

  // No database content - show placeholder message
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg max-w-md">
        <h2 className="text-2xl font-bold mb-4">Page Content Not Synced</h2>
        <p className="text-muted-foreground mb-4">
          This page does not have content in the database yet. Hardcoded content has been hidden.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          To enable this page:
        </p>
        <ul className="text-sm text-muted-foreground text-left list-disc list-inside space-y-2 mb-4">
          <li>Sync the page from the file system to the database</li>
          <li>Add components in the CMS editor</li>
          <li>Configure the page layout</li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Once content is synced, only database-synced sections will be displayed.
        </p>
      </div>

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

