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
import { getSiteName, getSiteTagline, getSiteDescription, getLogoSrc, getFaviconSrc, applyFavicon } from './utils/settings';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import NotFound from './pages/NotFound';
import { ThankYouPage } from './components/ThankYouPage';
import Blog from './components/Blog';

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
  tenantSlug = 'gosgconsulting',
  pageSlug
}) => {
  const { contactModalOpen, setContactModalOpen, openPopup, initialEmail, setInitialEmail } = usePopup();
  
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
  
  // Get settings from database with fallback to defaults using utility functions
  const siteName = getSiteName(branding, tenantName);
  const siteTagline = getSiteTagline(branding, 'Full-Stack Digital Growth Solution');
  const siteDescription = getSiteDescription(branding, 'Helping brands grow their revenue and leads through comprehensive digital marketing services including SEO, SEM, Social Media Ads, Website Design, and Graphic Design.');
  const logoSrc = getLogoSrc(branding);
  const faviconSrc = getFaviconSrc(branding);
  
  // Apply favicon when branding loads
  // Use a longer delay to ensure SEOHead has finished running first
  useEffect(() => {
    if (faviconSrc && !brandingLoading) {
      // Apply favicon after a delay to ensure it runs after SEOHead
      const timeoutId1 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 100);
      
      // Also apply after a longer delay to ensure it persists
      const timeoutId2 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 500);
      
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        // Clean up observer if it exists
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

  // Apply branding colors as CSS variables (similar to MasterTheme)
  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      const brandingColors = branding as any;

      // Helper function to adjust color brightness
      const adjustColorBrightness = (hex: string, percent: number): string => {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
      };

      if (brandingColors.color_primary) {
        const primaryColor = String(brandingColors.color_primary);
        root.style.setProperty("--brand-primary", primaryColor);
        const darker = adjustColorBrightness(primaryColor, -10);
        root.style.setProperty("--brand-primary-dark", darker);
        const lighter = adjustColorBrightness(primaryColor, 20);
        root.style.setProperty("--brand-primary-light", lighter);
      }

      if (brandingColors.color_secondary) {
        const secondaryColor = String(brandingColors.color_secondary);
        root.style.setProperty("--brand-secondary", secondaryColor);
        const darker = adjustColorBrightness(secondaryColor, -10);
        root.style.setProperty("--brand-secondary-dark", darker);
        const lighter = adjustColorBrightness(secondaryColor, 20);
        root.style.setProperty("--brand-secondary-light", lighter);
      }

      if (brandingColors.color_accent) {
        const accentColor = String(brandingColors.color_accent);
        root.style.setProperty("--brand-accent", accentColor);
        const darker = adjustColorBrightness(accentColor, -10);
        root.style.setProperty("--brand-accent-dark", darker);
        const lighter = adjustColorBrightness(accentColor, 20);
        root.style.setProperty("--brand-accent-light", lighter);
      }

      if (brandingColors.color_text) {
        root.style.setProperty("--brand-text", String(brandingColors.color_text));
      }

      if (brandingColors.color_background) {
        root.style.setProperty(
          "--brand-background",
          String(brandingColors.color_background)
        );
      }

      if (brandingColors.color_gradient_start) {
        root.style.setProperty(
          "--brand-gradient-start",
          String(brandingColors.color_gradient_start)
        );
      }

      if (brandingColors.color_gradient_end) {
        root.style.setProperty(
          "--brand-gradient-end",
          String(brandingColors.color_gradient_end)
        );
      }
    }
  }, [branding]);

  const handleContactClick = () => {
    setContactModalOpen(true);
  };

  // Global handler to intercept #contact links and open modal
  useEffect(() => {
    const handleContactLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href="#contact"], a[href*="#contact"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        handleContactClick();
        return false;
      }
    };

    document.addEventListener('click', handleContactLinkClick, true);
    return () => {
      document.removeEventListener('click', handleContactLinkClick, true);
    };
  }, [handleContactClick]);

  // Complete homepage data with all GOSG sections
  // Use dynamic site name and tagline from branding settings
  const homepageData = {
    slug: 'home',
    meta: {
      title: siteTagline ? `${siteName} - ${siteTagline}` : siteName,
      description: siteDescription,
      keywords: 'digital marketing, SEO, SEM, social media ads, website design, graphic design, Singapore, full-stack',
    },
    components: [
      // Section 1 — Hero (Modern Hero Section)
      {
        key: "MainHeroSection",
        name: "Hero",
        type: "flowbite-banner-section",
        items: [
          { 
            key: "title", 
            type: "heading", 
            level: 1, 
            content: "Turn Every Visitor Into Revenue — Starting Day 1" 
          },
          { 
            key: "description", 
            type: "text", 
            content: "Our dedicated team works inside your brand, crafting high-converting pages and campaigns that turn traffic into sales. We handle the full funnel — from acquisition to conversion — so every visitor has a clear path to revenue. See results immediately, not months from now." 
          },
          { 
            key: "emailPlaceholder", 
            type: "text", 
            content: "Enter your email" 
          },
          {
            key: "personImage",
            type: "image",
            src: "/theme/gosgconsulting/assets/hero-person.png",
            alt: "Team member"
          }
        ]
      },
      // Section 2 — Our Services (using MasterTheme OurServicesSection design)
      {
        key: "OurServicesSection",
        name: "Our Services",
        type: "OurServicesSection",
        items: []
      },
      // Section 3 — Results Carousel
      {
        key: "ResultsCarouselSection",
        name: "Results",
        type: "ResultsCarouselSection",
        items: [
          {
            key: "caseStudies",
            type: "array",
            items: [
              {
                key: "case1",
                type: "caseStudy",
                items: [
                  { key: "companyName", type: "text", content: "Selenightco" },
                  {
                    key: "tags",
                    type: "array",
                    items: [
                      { key: "tag1", type: "text", content: "META ADS" },
                      { key: "tag2", type: "text", content: "FACEBOOK" },
                      { key: "tag3", type: "text", content: "INSTAGRAM" },
                      { key: "tag4", type: "text", content: "PERFORMANCE" },
                      { key: "tag5", type: "text", content: "ROAS" },
                      { key: "tag6", type: "text", content: "6 MONTHS" },
                    ],
                  },
                  {
                    key: "description",
                    type: "text",
                    content:
                      "Selenightco generated 60k revenue with a ROI of x60. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS, with comprehensive A/B testing on creatives and key messages to ensure peak performance.",
                  },
                  {
                    key: "metrics",
                    type: "array",
                    items: [
                      {
                        key: "metric1",
                        type: "metric",
                        value: "60x",
                        label1: "ROAS",
                        label2: "Return",
                        color: "cyan",
                      },
                      {
                        key: "metric2",
                        type: "metric",
                        value: "60k",
                        label1: "Revenue",
                        label2: "Generated",
                        color: "teal",
                      },
                      {
                        key: "metric3",
                        type: "metric",
                        value: "1k",
                        label1: "Ad",
                        label2: "Spend",
                        color: "orange",
                      },
                    ],
                  },
                  {
                    key: "screenshot",
                    type: "image",
                    src: "/theme/gosgconsulting/assets/selenightco-meta-ads-results.png",
                    alt: "Selenightco Meta Ads performance results",
                  },
                ],
              },
              {
                key: "case2",
                type: "caseStudy",
                items: [
                  { key: "companyName", type: "text", content: "Elizabeth Little" },
                  {
                    key: "tags",
                    type: "array",
                    items: [
                      { key: "tag1", type: "text", content: "META ADS" },
                      { key: "tag2", type: "text", content: "FACEBOOK" },
                      { key: "tag3", type: "text", content: "INSTAGRAM" },
                      { key: "tag4", type: "text", content: "PERFORMANCE" },
                      { key: "tag5", type: "text", content: "ROAS" },
                      { key: "tag6", type: "text", content: "2 MONTHS" },
                    ],
                  },
                  {
                    key: "description",
                    type: "text",
                    content:
                      "Elizabeth Little achieved 19.9k revenue from 2.8k ad spend, delivering a ROAS of 7. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS and efficient budget allocation.",
                  },
                  {
                    key: "metrics",
                    type: "array",
                    items: [
                      {
                        key: "metric1",
                        type: "metric",
                        value: "7x",
                        label1: "ROAS",
                        label2: "Return",
                        color: "cyan",
                      },
                      {
                        key: "metric2",
                        type: "metric",
                        value: "19.9k",
                        label1: "Revenue",
                        label2: "Generated",
                        color: "teal",
                      },
                      {
                        key: "metric3",
                        type: "metric",
                        value: "2.8k",
                        label1: "Ad",
                        label2: "Spend",
                        color: "orange",
                      },
                    ],
                  },
                  {
                    key: "screenshot",
                    type: "image",
                    src: "/theme/gosgconsulting/assets/elizabeth-little-meta-ads-results.png",
                    alt: "Elizabeth Little Meta Ads performance results",
                  },
                ],
              },
            ],
          },
        ],
      },
      // Section 4 — Full-stack growth package (replaced PricingPageSection)
      {
        key: "GrowthPackageSection",
        name: "Growth Package",
        type: "flowbite-whats-included-section",
        items: [
          {
            key: "badge",
            type: "text",
            content: "Services",
          },
          {
            key: "title",
            type: "heading",
            level: 2,
            content: "Increase your revenue with a full‑stack growth package",
          },
          {
            key: "description",
            type: "text",
            content: "A focused breakdown of the core areas driving results, each tailored to your goals.",
          },
          {
            key: "features",
            type: "array",
            items: [
              {
                key: "s1",
                type: "feature",
                items: [
                  { key: "title", type: "heading", level: 3, content: "Website & Conversion" },
                  {
                    key: "description",
                    type: "text",
                    content: "High‑converting landing pages, A/B test ideas, and conversion tracking.",
                  },
                ],
              },
              {
                key: "s2",
                type: "feature",
                items: [
                  { key: "title", type: "heading", level: 3, content: "Acquisition" },
                  {
                    key: "description",
                    type: "text",
                    content: "SEM + social ads, plus smart retargeting that doesn't waste spend.",
                  },
                ],
              },
              {
                key: "s3",
                type: "feature",
                items: [
                  { key: "title", type: "heading", level: 3, content: "Creative & Content" },
                  {
                    key: "description",
                    type: "text",
                    content: "Creative assets and copy that match your brand and convert.",
                  },
                ],
              },
            ],
          },
          {
            key: "cta",
            type: "button",
            content: "Get free consultation",
            link: "#contact",
          },
        ],
      },
      // Section 5 — Gallery4 services
      { key: "Gallery4Section", name: "Our Services", type: "Gallery4Section", items: [] },
      // FAQ (using MasterTheme FlowbiteFAQSection design)
      {
        key: "FAQSection",
        name: "FAQ",
        type: "flowbite-faq-section",
        items: [
          {
            key: "title",
            type: "heading",
            level: 2,
            content: "Frequently Asked Questions"
          },
          {
            key: "faq1",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "What does 'full‑stack growth' mean?"
              },
              {
                key: "answer",
                type: "text",
                content: "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue."
              }
            ]
          },
          {
            key: "faq2",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "How fast will I see results?"
              },
              {
                key: "answer",
                type: "text",
                content: "Paid ads can generate leads quickly, while SEO compounds over time. We'll align the plan to your goals and share clear performance reporting month-to-month."
              }
            ]
          },
          {
            key: "faq3",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "Do you work with my existing website?"
              },
              {
                key: "answer",
                type: "text",
                content: "Yes. We can optimize your current site for conversions and SEO, or rebuild key pages where needed—without disrupting your brand."
              }
            ]
          },
          {
            key: "faq4",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "Is this a good fit for small businesses?"
              },
              {
                key: "answer",
                type: "text",
                content: "Yes. We tailor scopes to your stage—whether you need a consistent lead pipeline, better conversion rates, or a complete growth system."
              }
            ]
          }
        ]
      },
      // Pre-footer CTA banner (using MasterTheme FlowbiteCTASection design)
      {
        key: "PreFooterCTA",
        name: "CTA",
        type: "flowbite-cta-section",
        items: [
          {
            key: "title",
            type: "heading",
            level: 2,
            content: "Ready to turn traffic into revenue?"
          },
          {
            key: "description",
            type: "text",
            content: "Get a clear growth plan tailored to your business in a free strategy call."
          },
          {
            key: "cta",
            type: "button",
            content: "Get free consultation",
            link: "#contact"
          }
        ]
      }
    ]
  };

  // SEO page schema override
  const seoData = {
    slug: 'seo',
    meta: homepageData.meta,
    components: [
      // Hero (same component, SEO copy)
      {
        key: "MainHeroSection",
        name: "Hero",
        type: "HomeHeroSection",
        items: [
          { key: "headingPrefix", type: "heading", level: 1, content: "Rank higher every month" },
          { key: "headingEmphasis", type: "heading", level: 1, content: "Traffic that converts" },
          // hero labels for SEO
          { key: "badges", type: "array", items: ["SEO", "Content", "Backlinks", "Keywords", "Rankings", "Traffic", "Authority"] }
        ]
      },
      // Challenge (same component, SEO-specific hooks)
      {
        key: "ProblemSection",
        name: "Problem",
        type: "ChallengeSection",
        items: [
          { key: "hint", type: "text", content: "Search visibility unlocked" },
          { key: "heading", type: "heading", level: 2, content: "Authority Google trusts" },
          {
            key: "bullets",
            type: "array",
            items: [
              { key: "b1", type: "text", content: "Content built to rank", icon: "fileText" },
              { key: "b2", type: "text", content: "Backlinks that matter", icon: "link" },
              { key: "b3", type: "text", content: "Results you can track", icon: "barChart3" }
            ]
          }
        ]
      },
      // About
      { key: "AnimatedAboutSection", name: "Animated About", type: "AboutSection2", items: [
        { key: "variant", type: "text", content: "seo" },
        { key: "taglineTitle", type: "text", content: "We Are Your SEO Growth Team And We Will" },
        { key: "taglineAccent", type: "text", content: "TAKE YOU FURTHER" }
      ] },
      // Pricing (override for SEO offer)
      {
        key: "PricingPageSection",
        name: "Pricing",
        type: "PricingPage",
        items: [
          {
            planName: "SEO Service",
            price: "$600 SGD",
            priceDescription: "per month",
            features: [
              "Strategic articles designed to capture high intent searches",
              "Quality backlinks that strengthen domain authority steadily",
              "Transparent monthly reports showing rankings, traffic and impact",
              "Process: SEO Audit > Keywords research > Topics suggestions > Approval > Writing"
            ],
            buttonText: "Start SEO",
            pageTitle: "SEO Service",
            pageDescription: "Long term SEO system built for consistent lead generation"
          }
        ]
      },
      // Gallery4Section
      {
        key: "Gallery4Section",
        name: "What's Included",
        type: "Gallery4Section",
        items: [
          {
            id: "blog-articles",
            title: "Blog Articles",
            description: "Strategic articles designed to capture high intent searches",
            bullets: [
              "12 blog articles per month",
              "Keyword-led topics and outlines",
              "SEO-optimized content"
            ],
            image: "/assets/seo/content-that-ranks.svg"
          },
          {
            id: "backlinks",
            title: "Backlinks",
            description: "Quality backlinks that strengthen domain authority steadily",
            bullets: [
              "10 external backlinks per month",
              "Relevant placements from trusted sites",
              "Natural anchor strategy"
            ],
            image: "/assets/seo/authority-that-grows.svg"
          },
          {
            id: "monthly-report",
            title: "Monthly Report",
            description: "Transparent monthly reports showing rankings, traffic and impact",
            bullets: [
              "Monthly performance report",
              "Insights and recommendations",
              "Next‑month plan"
            ],
            image: "/assets/seo/data-you-trust.svg"
          }
        ]
      },
      // FAQ
      {
        key: "FAQSection",
        name: "FAQ",
        type: "FAQSection",
        items: [
          {
            question: "How long does SEO take to work?",
            answer: "SEO compounds. You may see early movement in weeks, but meaningful growth typically builds over 3–6 months depending on competition and your starting point."
          },
          {
            question: "What's included in your monthly SEO service?",
            answer: "Keyword research, topic planning, content production, link building, on-page improvements, and a transparent monthly report with next steps."
          },
          {
            question: "Do you guarantee #1 rankings?",
            answer: "No one can honestly guarantee exact rankings. We focus on the work that reliably increases visibility and qualified traffic—then we measure outcomes with clear reporting."
          },
          {
            question: "Can you target local searches in Singapore?",
            answer: "Yes. We optimize for local intent, service areas, and high-value keywords, and we structure content to capture leads—not just traffic."
          }
        ]
      },
      // Pre-footer CTA banner
      {
        key: "PreFooterCTA",
        name: "CTA",
        type: "CTASection",
        items: [
          {
            heading: "Want SEO that compounds every month?",
            description: "Let's map out your keywords, content plan, and backlink strategy in a free consultation.",
            primaryLabel: "Get free SEO consultation"
          }
        ]
      }
    ]
  };

  const pageData = pageSlug === 'seo' ? seoData : homepageData;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      {/* SEO metadata */}
      <SEOHead meta={pageData.meta} favicon={faviconSrc || undefined} />
      
      {/* Header */}
      <Header 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        onContactClick={handleContactClick}
      />
      
      {/* Main content: Dynamic page rendering */}
      <main className="grow w-full">
        <DynamicPageRenderer
          schema={pageData}
          onContactClick={handleContactClick}
          onPopupOpen={openPopup}
          tenantSlug={tenantSlug}
        />
      </main>
      
      {/* Footer */}
      <Footer 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        companyDescription={getSiteDescription(branding, "Full-stack digital growth solution helping brands grow their revenue and leads through comprehensive digital marketing services.")}
        onContactClick={handleContactClick}
      />
      
      {/* Contact Modal */}
      <ContactModal 
        open={contactModalOpen} 
        onOpenChange={(open) => {
          setContactModalOpen(open);
          if (!open) {
            setInitialEmail(null); // Clear initial email when modal closes
          }
        }}
        initialEmail={initialEmail}
      />
    </div>
  );
};

/**
 * Helper function to map GOSG homepage content to MasterTheme schemas
 */
const mapHomepageToMasterSchemas = (homepageComponents: any[]): {
  heroSchema?: any;
  challengeSchema?: any;
  aboutSchema?: any;
  servicesSchema?: any;
  faqSchema?: any;
  ctaSchema?: any;
} => {
  const schemas: any = {};

  // Find and map hero section
  const heroComponent = homepageComponents.find(c => c.type === 'HomeHeroSection');
  if (heroComponent) {
    const headingPrefix = heroComponent.items?.find((i: any) => i.key === 'headingPrefix')?.content || '';
    const headingEmphasis = heroComponent.items?.find((i: any) => i.key === 'headingEmphasis')?.content || '';
    schemas.heroSchema = {
      type: "banner-section",
      props: {
        backgroundColor: "#2A2C2E",
        backgroundImage: `/theme/gosgconsulting/assets/placeholder.svg`,
      },
      items: [
        {
          key: "title",
          type: "heading",
          level: 1,
          content: `${headingPrefix} ${headingEmphasis}`.trim(),
        },
        {
          key: "description",
          type: "text",
          content: "We craft high‑performance pages using Flowbite components, strong messaging, and conversion-first UX — so every visit has a clear path to revenue.",
        },
        {
          key: "cta",
          type: "button",
          content: "Get Started",
          link: "#contact",
        },
      ],
    };
  }

  // Find and map challenge section
  const challengeComponent = homepageComponents.find(c => c.type === 'ChallengeSection');
  if (challengeComponent) {
    const hint = challengeComponent.items?.find((i: any) => i.key === 'hint')?.content || '';
    const heading = challengeComponent.items?.find((i: any) => i.key === 'heading')?.content || '';
    const bullets = challengeComponent.items?.find((i: any) => i.key === 'bullets')?.items || [];
    
    schemas.challengeSchema = {
      type: "flowbite-pain-point-section",
      props: {},
      items: [
        {
          key: "hint",
          type: "text",
          content: hint,
        },
        {
          key: "heading",
          type: "heading",
          level: 2,
          content: heading,
        },
        {
          key: "bullets",
          type: "array",
          items: bullets.map((b: any, idx: number) => ({
            key: `b${idx + 1}`,
            type: "text",
            content: b.content || '',
            icon: b.icon || 'x',
          })),
        },
      ],
    };
  }

  // Find and map services section (flowbite-whats-included-section)
  const servicesComponent = homepageComponents.find(c => c.type === 'flowbite-whats-included-section');
  if (servicesComponent) {
    schemas.servicesSchema = {
      type: "flowbite-whats-included-section",
      props: {},
      items: servicesComponent.items || [],
    };
  }

  // Find and map FAQ section
  const faqComponent = homepageComponents.find(c => c.type === 'FAQSection');
  if (faqComponent && faqComponent.items) {
    const faqItems = faqComponent.items.filter((item: any) => item.question && item.answer);
    schemas.faqSchema = {
      type: "flowbite-faq-section",
      props: {},
      items: [
        {
          key: "title",
          type: "heading",
          level: 2,
          content: "Frequently Asked Questions",
        },
        ...faqItems.map((item: any, idx: number) => ({
          key: `faq${idx}`,
          type: "array",
          items: [
            {
              key: "question",
              type: "text",
              content: item.question,
            },
            {
              key: "answer",
              type: "text",
              content: item.answer,
            },
          ],
        })),
      ],
    };
  }

  // Find and map CTA section
  const ctaComponent = homepageComponents.find(c => c.type === 'CTASection');
  if (ctaComponent && ctaComponent.items && ctaComponent.items[0]) {
    const ctaItem = ctaComponent.items[0];
    schemas.ctaSchema = {
      type: "flowbite-cta-section",
      props: {
        ctaVariant: "primary",
        ctaFullWidth: false,
      },
      items: [
        {
          key: "title",
          type: "heading",
          level: 2,
          content: ctaItem.heading || "Ready to turn traffic into revenue?",
        },
        {
          key: "description",
          type: "text",
          content: ctaItem.description || "Get a clear growth plan tailored to your business in a free strategy call.",
        },
        {
          key: "cta",
          type: "button",
          content: ctaItem.primaryLabel || "Get free consultation",
          link: "#contact",
        },
      ],
    };
  }

  return schemas;
};

/**
 * Paid Ads Page Component
 * Uses DynamicPageRenderer to render GOSG homepage content with custom components
 */
interface PaidAdsPageProps {
  tenantName?: string;
  tenantId?: string;
  tenantSlug?: string;
}

const PaidAdsPage: React.FC<PaidAdsPageProps> = ({
  tenantName = 'GO SG Consulting',
  tenantId = 'tenant-gosg',
  tenantSlug = 'gosgconsulting',
}) => {
  const { contactModalOpen, setContactModalOpen, openPopup, initialEmail, setInitialEmail } = usePopup();
  
  // Load branding settings from database
  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding('gosgconsulting', tenantId);
  
  // Load theme styles from database
  const { styles, loading: stylesLoading, error: stylesError } = useThemeStyles('gosgconsulting', tenantId);
  
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
    };
  }, [styles, stylesError]);

  // Get settings from database with fallback to defaults using utility functions
  const siteName = getSiteName(branding, tenantName);
  const siteTagline = getSiteTagline(branding, 'Full-Stack Digital Growth Solution');
  const siteDescription = getSiteDescription(branding, 'Helping brands grow their revenue and leads through comprehensive digital marketing services including SEO, SEM, Social Media Ads, Website Design, and Graphic Design.');
  const logoSrc = getLogoSrc(branding);
  const faviconSrc = getFaviconSrc(branding);
  
  // Apply favicon when branding loads
  useEffect(() => {
    if (faviconSrc && !brandingLoading) {
      // Apply favicon after a delay to ensure it runs after SEOHead
      const timeoutId1 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 100);
      
      // Also apply after a longer delay to ensure it persists
      const timeoutId2 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 500);
      
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        // Clean up observer if it exists
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

  // Apply branding colors as CSS variables (similar to MasterTheme)
  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      const brandingColors = branding as any;

      // Helper function to adjust color brightness
      const adjustColorBrightness = (hex: string, percent: number): string => {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
      };

      if (brandingColors.color_primary) {
        const primaryColor = String(brandingColors.color_primary);
        root.style.setProperty("--brand-primary", primaryColor);
        const darker = adjustColorBrightness(primaryColor, -10);
        root.style.setProperty("--brand-primary-dark", darker);
        const lighter = adjustColorBrightness(primaryColor, 20);
        root.style.setProperty("--brand-primary-light", lighter);
      }

      if (brandingColors.color_secondary) {
        const secondaryColor = String(brandingColors.color_secondary);
        root.style.setProperty("--brand-secondary", secondaryColor);
        const darker = adjustColorBrightness(secondaryColor, -10);
        root.style.setProperty("--brand-secondary-dark", darker);
        const lighter = adjustColorBrightness(secondaryColor, 20);
        root.style.setProperty("--brand-secondary-light", lighter);
      }

      if (brandingColors.color_accent) {
        const accentColor = String(brandingColors.color_accent);
        root.style.setProperty("--brand-accent", accentColor);
        const darker = adjustColorBrightness(accentColor, -10);
        root.style.setProperty("--brand-accent-dark", darker);
        const lighter = adjustColorBrightness(accentColor, 20);
        root.style.setProperty("--brand-accent-light", lighter);
      }

      if (brandingColors.color_text) {
        root.style.setProperty("--brand-text", String(brandingColors.color_text));
      }

      if (brandingColors.color_background) {
        root.style.setProperty(
          "--brand-background",
          String(brandingColors.color_background)
        );
      }

      if (brandingColors.color_gradient_start) {
        root.style.setProperty(
          "--brand-gradient-start",
          String(brandingColors.color_gradient_start)
        );
      }

      if (brandingColors.color_gradient_end) {
        root.style.setProperty(
          "--brand-gradient-end",
          String(brandingColors.color_gradient_end)
        );
      }
    }
  }, [branding]);

  const handleContactClick = () => {
    setContactModalOpen(true);
  };

  // Global handler to intercept #contact links and open modal
  useEffect(() => {
    const handleContactLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href="#contact"], a[href*="#contact"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        handleContactClick();
        return false;
      }
    };

    document.addEventListener('click', handleContactLinkClick, true);
    return () => {
      document.removeEventListener('click', handleContactLinkClick, true);
    };
  }, [handleContactClick]);

  // Recreate homepageData structure using MasterTheme Flowbite components with gosgconsulting content
  const homepageData = {
    slug: 'home',
    meta: {
      title: siteTagline ? `${siteName} - ${siteTagline}` : siteName,
      description: siteDescription,
      keywords: 'digital marketing, SEO, SEM, social media ads, website design, graphic design, Singapore, full-stack',
    },
    components: [
      // Section 1 — Hero (Modern Hero Section)
      {
        key: "MainHeroSection",
        name: "Hero",
        type: "flowbite-banner-section",
        items: [
          { 
            key: "title", 
            type: "heading", 
            level: 1, 
            content: "Turn Every Visitor Into Revenue — Starting Day 1" 
          },
          { 
            key: "description", 
            type: "text", 
            content: "Our dedicated team works inside your brand, crafting high-converting pages and campaigns that turn traffic into sales. We handle the full funnel — from acquisition to conversion — so every visitor has a clear path to revenue. See results immediately, not months from now." 
          },
          { 
            key: "emailPlaceholder", 
            type: "text", 
            content: "Enter your email" 
          },
          {
            key: "personImage",
            type: "image",
            src: "/theme/gosgconsulting/assets/hero-person.png",
            alt: "Team member"
          }
        ]
      },
      // Section 2 — Our Services (using MasterTheme OurServicesSection design)
      {
        key: "OurServicesSection",
        name: "Our Services",
        type: "OurServicesSection",
        items: []
      },
      // Section 3 — Results Carousel
      {
        key: "ResultsCarouselSection",
        name: "Results",
        type: "ResultsCarouselSection",
        items: [
          {
            key: "caseStudies",
            type: "array",
            items: [
              {
                key: "case1",
                type: "caseStudy",
                items: [
                  { key: "companyName", type: "text", content: "Selenightco" },
                  {
                    key: "tags",
                    type: "array",
                    items: [
                      { key: "tag1", type: "text", content: "META ADS" },
                      { key: "tag2", type: "text", content: "FACEBOOK" },
                      { key: "tag3", type: "text", content: "INSTAGRAM" },
                      { key: "tag4", type: "text", content: "PERFORMANCE" },
                      { key: "tag5", type: "text", content: "ROAS" },
                      { key: "tag6", type: "text", content: "6 MONTHS" },
                    ],
                  },
                  {
                    key: "description",
                    type: "text",
                    content:
                      "Selenightco generated 60k revenue with a ROI of x60. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS, with comprehensive A/B testing on creatives and key messages to ensure peak performance.",
                  },
                  {
                    key: "metrics",
                    type: "array",
                    items: [
                      {
                        key: "metric1",
                        type: "metric",
                        value: "60x",
                        label1: "ROAS",
                        label2: "Return",
                        color: "cyan",
                      },
                      {
                        key: "metric2",
                        type: "metric",
                        value: "60k",
                        label1: "Revenue",
                        label2: "Generated",
                        color: "teal",
                      },
                      {
                        key: "metric3",
                        type: "metric",
                        value: "1k",
                        label1: "Ad",
                        label2: "Spend",
                        color: "orange",
                      },
                    ],
                  },
                  {
                    key: "screenshot",
                    type: "image",
                    src: "/theme/gosgconsulting/assets/selenightco-meta-ads-results.png",
                    alt: "Selenightco Meta Ads performance results",
                  },
                ],
              },
              {
                key: "case2",
                type: "caseStudy",
                items: [
                  { key: "companyName", type: "text", content: "Elizabeth Little" },
                  {
                    key: "tags",
                    type: "array",
                    items: [
                      { key: "tag1", type: "text", content: "META ADS" },
                      { key: "tag2", type: "text", content: "FACEBOOK" },
                      { key: "tag3", type: "text", content: "INSTAGRAM" },
                      { key: "tag4", type: "text", content: "PERFORMANCE" },
                      { key: "tag5", type: "text", content: "ROAS" },
                      { key: "tag6", type: "text", content: "2 MONTHS" },
                    ],
                  },
                  {
                    key: "description",
                    type: "text",
                    content:
                      "Elizabeth Little achieved 19.9k revenue from 2.8k ad spend, delivering a ROAS of 7. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS and efficient budget allocation.",
                  },
                  {
                    key: "metrics",
                    type: "array",
                    items: [
                      {
                        key: "metric1",
                        type: "metric",
                        value: "7x",
                        label1: "ROAS",
                        label2: "Return",
                        color: "cyan",
                      },
                      {
                        key: "metric2",
                        type: "metric",
                        value: "19.9k",
                        label1: "Revenue",
                        label2: "Generated",
                        color: "teal",
                      },
                      {
                        key: "metric3",
                        type: "metric",
                        value: "2.8k",
                        label1: "Ad",
                        label2: "Spend",
                        color: "orange",
                      },
                    ],
                  },
                  {
                    key: "screenshot",
                    type: "image",
                    src: "/theme/gosgconsulting/assets/elizabeth-little-meta-ads-results.png",
                    alt: "Elizabeth Little Meta Ads performance results",
                  },
                ],
              },
            ],
          },
        ],
      },
      // Section 4 — About (using MasterTheme FlowbiteContentSection design)
      {
        key: "AnimatedAboutSection",
        name: "About",
        type: "flowbite-content-section",
        items: [
          {
            key: "title",
            type: "heading",
            level: 2,
            content: "We Are Your Growth Team And We Will Take You Further"
          },
          {
            key: "content",
            type: "text",
            content: "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue.\n\nOur proven systems generate leads and revenue month after month, while you stay focused on running the business."
          },
          {
            key: "button",
            type: "button",
            content: "Get Started",
            link: "#contact"
          }
        ]
      },
      // Section 5 — Full-stack growth package
      {
        key: "GrowthPackageSection",
        name: "Growth Package",
        type: "flowbite-whats-included-section",
        items: [
          {
            key: "badge",
            type: "text",
            content: "Services",
          },
          {
            key: "title",
            type: "heading",
            level: 2,
            content: "Increase your revenue with a full‑stack growth package",
          },
          {
            key: "description",
            type: "text",
            content: "A focused breakdown of the core areas driving results, each tailored to your goals.",
          },
          {
            key: "features",
            type: "array",
            items: [
              {
                key: "s1",
                type: "feature",
                items: [
                  { key: "title", type: "heading", level: 3, content: "Website & Conversion" },
                  {
                    key: "description",
                    type: "text",
                    content: "High‑converting landing pages, A/B test ideas, and conversion tracking.",
                  },
                ],
              },
              {
                key: "s2",
                type: "feature",
                items: [
                  { key: "title", type: "heading", level: 3, content: "Acquisition" },
                  {
                    key: "description",
                    type: "text",
                    content: "SEM + social ads, plus smart retargeting that doesn't waste spend.",
                  },
                ],
              },
              {
                key: "s3",
                type: "feature",
                items: [
                  { key: "title", type: "heading", level: 3, content: "Creative & Content" },
                  {
                    key: "description",
                    type: "text",
                    content: "Creative assets and copy that match your brand and convert.",
                  },
                ],
              },
            ],
          },
          {
            key: "cta",
            type: "button",
            content: "Get free consultation",
            link: "#contact",
          },
        ],
      },
      // FAQ (using MasterTheme FlowbiteFAQSection design)
      {
        key: "FAQSection",
        name: "FAQ",
        type: "flowbite-faq-section",
        items: [
          {
            key: "title",
            type: "heading",
            level: 2,
            content: "Frequently Asked Questions"
          },
          {
            key: "faq1",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "What does 'full‑stack growth' mean?"
              },
              {
                key: "answer",
                type: "text",
                content: "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue."
              }
            ]
          },
          {
            key: "faq2",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "How fast will I see results?"
              },
              {
                key: "answer",
                type: "text",
                content: "Paid ads can generate leads quickly, while SEO compounds over time. We'll align the plan to your goals and share clear performance reporting month-to-month."
              }
            ]
          },
          {
            key: "faq3",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "Do you work with my existing website?"
              },
              {
                key: "answer",
                type: "text",
                content: "Yes. We can optimize your current site for conversions and SEO, or rebuild key pages where needed—without disrupting your brand."
              }
            ]
          },
          {
            key: "faq4",
            type: "array",
            items: [
              {
                key: "question",
                type: "text",
                content: "Is this a good fit for small businesses?"
              },
              {
                key: "answer",
                type: "text",
                content: "Yes. We tailor scopes to your stage—whether you need a consistent lead pipeline, better conversion rates, or a complete growth system."
              }
            ]
          }
        ]
      },
      // Pre-footer CTA banner (using MasterTheme FlowbiteCTASection design)
      {
        key: "PreFooterCTA",
        name: "CTA",
        type: "flowbite-cta-section",
        items: [
          {
            key: "title",
            type: "heading",
            level: 2,
            content: "Ready to turn traffic into revenue?"
          },
          {
            key: "description",
            type: "text",
            content: "Get a clear growth plan tailored to your business in a free strategy call."
          },
          {
            key: "cta",
            type: "button",
            content: "Get free consultation",
            link: "#contact"
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      {/* SEO metadata */}
      <SEOHead meta={homepageData.meta} favicon={faviconSrc || undefined} />
      
      {/* Header */}
      <Header 
        tenantName={siteName}
        tenantSlug="gosgconsulting"
        logoSrc={logoSrc}
        onContactClick={handleContactClick}
      />
      
      {/* Main content: Dynamic page rendering */}
      <main className="grow w-full">
        <DynamicPageRenderer
          schema={homepageData}
          onContactClick={handleContactClick}
          onPopupOpen={openPopup}
          tenantSlug={tenantSlug}
        />
      </main>
      
      {/* Footer */}
      <Footer 
        tenantName={siteName}
        tenantSlug="gosgconsulting"
        logoSrc={logoSrc}
        companyDescription={getSiteDescription(branding, "Full-stack digital growth solution helping brands grow their revenue and leads through comprehensive digital marketing services.")}
        onContactClick={handleContactClick}
      />
      
      {/* Contact Modal */}
      <ContactModal 
        open={contactModalOpen} 
        onOpenChange={(open) => {
          setContactModalOpen(open);
          if (!open) {
            setInitialEmail(null); // Clear initial email when modal closes
          }
        }}
        initialEmail={initialEmail}
      />
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
  tenantId,
  pageSlug
}) => {
  const location = useLocation();
  const params = useParams<{ pageSlug?: string; productname?: string }>();
  
  // Determine which page to render
  // Priority: 1) pageSlug prop, 2) params.pageSlug, 3) extract from pathname, 4) homepage
  const currentPage = useMemo(() => {
    // Check for checkout/success route first (special nested route)
    if (location.pathname.includes('/checkout/success')) {
      return 'checkout/success';
    }
    
    // Check pageSlug prop first (passed from TenantLandingPage)
    // This handles cases like "product/test" from /theme/gosgconsulting/product/test
    if (pageSlug) {
      // If pageSlug starts with "product/", it's a product page
      if (pageSlug.startsWith('product/')) {
        return 'product';
      }
      return pageSlug;
    }
    
    // Check if we have a pageSlug param (from /theme/:tenantSlug/:pageSlug route)
    if (params.pageSlug) {
      // If pageSlug starts with "product/", it's a product page
      if (params.pageSlug.startsWith('product/')) {
        return 'product';
      }
      return params.pageSlug;
    }
    
    // Check for product route (special case: /product/:productname)
    if (params.productname) {
      return 'product';
    }
    
    // Otherwise, extract from pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    const themeIndex = pathParts.indexOf(tenantSlug);
    
    // Handle standalone deployment (pathname doesn't include /theme/gosgconsulting/)
    // In standalone mode, pathname is like /thank-you, /shop, etc.
    if (themeIndex < 0) {
      // Standalone mode: pathname is directly the page slug
      // Check if it's a product route
      if (pathParts[0] === 'product' && pathParts.length > 1) {
        return 'product';
      }
      // Return the first path part as the page slug (e.g., 'thank-you', 'shop', etc.)
      return pathParts[0] || '';
    }
    
    // Theme mode: pathname includes /theme/gosgconsulting/
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
      // Try to get from params first (direct route param)
      if (params.productname) {
        return params.productname;
      }
      // Check if pageSlug contains product path (from TenantLandingPage)
      if (pageSlug && pageSlug.startsWith('product/')) {
        return pageSlug.replace('product/', '');
      }
      // Check params.pageSlug (alternative route format)
      if (params.pageSlug && params.pageSlug.startsWith('product/')) {
        return params.pageSlug.replace('product/', '');
      }
      // Otherwise extract from pathname
      const pathParts = location.pathname.split('/').filter(Boolean);
      const themeIndex = pathParts.indexOf(tenantSlug);
      if (themeIndex >= 0 && themeIndex + 2 < pathParts.length && pathParts[themeIndex + 1] === 'product') {
        return pathParts[themeIndex + 2];
      }
      // Fallback: try to extract from any path that includes /product/
      const productIndex = pathParts.indexOf('product');
      if (productIndex >= 0 && productIndex < pathParts.length - 1) {
        return pathParts[productIndex + 1];
      }
    }
    return null;
  };

  // Render the appropriate page component based on current route
  const renderPage = () => {
    switch (currentPage) {
      case '':
      case undefined:
        // Homepage now uses PaidAdsPage content
        return <PaidAdsPage tenantName={tenantName} tenantId={tenantId || 'tenant-gosg'} tenantSlug={tenantSlug} />;
      case 'seo':
        return <GOSGContent tenantName={tenantName} tenantSlug={tenantSlug} pageSlug="seo" />;
      case 'paid-ads':
        // Render master theme with GOSG homepage content and branding
        return <PaidAdsPage tenantName={tenantName} tenantId={tenantId || 'tenant-gosg'} tenantSlug={tenantSlug} />;
      case 'blog':
        // theme blog index
        return <Blog tenantName={tenantName} tenantSlug={tenantSlug} />;
      case 'thank-you':
        return <ThankYouPage tenantName={tenantName} tenantSlug={tenantSlug} tenantId={undefined} />;
      case 'shop':
        return <Shop />;
      case 'cart':
        return <Cart />;
      case 'product':
        // Product page needs the product name - it will extract from URL
        return <Product />;
      case 'checkout':
        return <Checkout />;
      case 'checkout/success':
        return <CheckoutSuccess />;
      default:
        return <NotFound />;
    }
  };

  // For shop pages, we need to wrap them with Header and Footer
  const needsLayout = ['shop', 'cart', 'product', 'checkout', 'checkout/success'].includes(currentPage || '');

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
  const { branding, loading: brandingLoading } = useThemeBranding('gosgconsulting', 'tenant-gosg');
  
  // Get settings from database with fallback to defaults using utility functions
  const siteName = getSiteName(branding, tenantName);
  const logoSrc = getLogoSrc(branding);
  const faviconSrc = getFaviconSrc(branding);
  
  // Apply favicon when branding loads
  // Use a longer delay to ensure SEOHead has finished running first
  useEffect(() => {
    if (faviconSrc && !brandingLoading) {
      // Apply favicon after a delay to ensure it runs after SEOHead
      const timeoutId1 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 100);
      
      // Also apply after a longer delay to ensure it persists
      const timeoutId2 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 500);
      
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        // Clean up observer if it exists
        if ((window as any).__faviconObserver) {
          (window as any).__faviconObserver.disconnect();
          delete (window as any).__faviconObserver;
        }
      };
    }
  }, [faviconSrc, brandingLoading]);

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
      <main className="grow">
        {children}
      </main>
      <Footer 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        companyDescription={getSiteDescription(branding, "Full-stack digital growth solution helping brands grow their revenue and leads through comprehensive digital marketing services.")}
        onContactClick={handleContactClick}
      />
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

export default GOSGTheme;