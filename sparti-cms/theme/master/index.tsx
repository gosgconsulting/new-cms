import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import FlowbiteHeroSection from "@/libraries/flowbite/components/FlowbiteHeroSection";
import FlowbitePainPointSection from "@/libraries/flowbite/components/FlowbitePainPointSection";
import FlowbiteContentSection from "@/libraries/flowbite/components/FlowbiteContentSection";
import FlowbiteWhatsIncludedSection from "@/libraries/flowbite/components/FlowbiteWhatsIncludedSection";
import FlowbiteFAQSection from "@/libraries/flowbite/components/FlowbiteFAQSection";
import FlowbiteCTASection from "@/libraries/flowbite/components/FlowbiteCTASection";
import { Card } from "flowbite-react";
import { initFlowbiteTheme } from "@/utils/flowbiteThemeManager";
import { useThemeBranding } from "../../hooks/useThemeSettings";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactFormModal from "./components/ContactFormModal";
import { ThankYouPage } from "./components/ThankYouPage";
import ThemeToggle from "./components/ThemeToggle";
import "./theme.css";

// Helper function to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

interface MasterThemeProps {
  basePath?: string;
  pageSlug?: string;
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  designSystemTheme?: "default" | "minimal" | "enterprise" | "playful" | "mono";
}

/**
 * Master Theme - Landing Page (Based on GOSG Consulting)
 * 
 * A complete landing page template based on gosgconsulting homepage structure,
 * recreated using Flowbite design system components.
 * 
 * Sections:
 * - Hero (with heading prefix/emphasis and CTA)
 * - Challenge/Problem Section (pain points)
 * - About Section
 * - Pricing Section
 * - Services Gallery (What's Included)
 * - FAQ Section
 * - Pre-footer CTA
 */
const MasterTheme: React.FC<MasterThemeProps> = ({
  basePath = "/theme/master",
  pageSlug,
  tenantName = "Master Template",
  tenantSlug = "master",
  tenantId,
  designSystemTheme = "default",
}) => {
  const location = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Fetch branding colors from database
  const { branding, loading: brandingLoading } = useThemeBranding("master", tenantId);

  // Apply branding colors as CSS variables
  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      
      // Branding object contains color properties directly (e.g., color_primary, color_secondary)
      // Type assertion to access color properties that may not be in TypeScript interface
      const brandingColors = branding as any;
      
      // Apply primary colors
      if (brandingColors.color_primary) {
        const primaryColor = String(brandingColors.color_primary);
        root.style.setProperty('--brand-primary', primaryColor);
        // Calculate darker shade for hover (reduce lightness by 10%)
        const darker = adjustColorBrightness(primaryColor, -10);
        root.style.setProperty('--brand-primary-dark', darker);
        // Calculate lighter shade for dark mode
        const lighter = adjustColorBrightness(primaryColor, 20);
        root.style.setProperty('--brand-primary-light', lighter);
      }
      
      if (brandingColors.color_secondary) {
        const secondaryColor = String(brandingColors.color_secondary);
        root.style.setProperty('--brand-secondary', secondaryColor);
        const darker = adjustColorBrightness(secondaryColor, -10);
        root.style.setProperty('--brand-secondary-dark', darker);
        const lighter = adjustColorBrightness(secondaryColor, 20);
        root.style.setProperty('--brand-secondary-light', lighter);
      }
      
      if (brandingColors.color_accent) {
        const accentColor = String(brandingColors.color_accent);
        root.style.setProperty('--brand-accent', accentColor);
        const darker = adjustColorBrightness(accentColor, -10);
        root.style.setProperty('--brand-accent-dark', darker);
        const lighter = adjustColorBrightness(accentColor, 20);
        root.style.setProperty('--brand-accent-light', lighter);
      }
      
      if (brandingColors.color_text) {
        root.style.setProperty('--brand-text', String(brandingColors.color_text));
      }
      
      if (brandingColors.color_background) {
        root.style.setProperty('--brand-background', String(brandingColors.color_background));
      }
      
      if (brandingColors.color_gradient_start) {
        root.style.setProperty('--brand-gradient-start', String(brandingColors.color_gradient_start));
      }
      
      if (brandingColors.color_gradient_end) {
        root.style.setProperty('--brand-gradient-end', String(brandingColors.color_gradient_end));
      }
    }
  }, [branding]);

  // Initialize Flowbite theme on mount
  useEffect(() => {
    initFlowbiteTheme(designSystemTheme);
  }, [designSystemTheme]);

  // Intercept CTA button clicks to open contact modal
  useEffect(() => {
    const handleCTAClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('a[href="#contact"], button');
      if (button && button.getAttribute('href') === '#contact') {
        e.preventDefault();
        e.stopPropagation();
        setIsContactModalOpen(true);
      }
    };

    document.addEventListener('click', handleCTAClick, true);
    return () => {
      document.removeEventListener('click', handleCTAClick, true);
    };
  }, []);

  // Check if we're on the thank you page
  const isThankYouPage = location.pathname === '/thank-you' || 
                         location.pathname.endsWith('/thank-you') ||
                         location.pathname.includes('/thank-you');

  // If thank you page, render it
  if (isThankYouPage) {
    return (
      <ThankYouPage
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        tenantId={tenantId}
      />
    );
  }

  // Handler for opening contact modal
  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  // Create ComponentSchema for Hero Section (GOSG-style with prefix and emphasis)
  const heroSchema: ComponentSchema = {
    type: "flowbite-hero-section",
    props: {},
    items: [
      {
        key: "title",
        type: "heading",
        level: 1,
        content: "Turn traffic into revenue with a Full‑Stack Growth Engine",
      },
      {
        key: "description",
        type: "text",
        content: "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue.",
      },
    ],
  };

  // Create ComponentSchema for Challenge/Problem Section (GOSG-style)
  const challengeSchema: ComponentSchema = {
    type: "flowbite-pain-point-section",
    props: {},
    items: [
      {
        key: "hint",
        type: "text",
        content: "You have a great business but struggle online?",
      },
      {
        key: "heading",
        type: "heading",
        level: 2,
        content: "Your Business Works… Your Marketing Doesn't",
      },
      {
        key: "bullets",
        type: "array",
        items: [
          {
            key: "b1",
            type: "text",
            content: "You know your craft — but not SEO, ads, funnels",
            icon: "x",
          },
          {
            key: "b2",
            type: "text",
            content: "Leads don't grow month after month",
            icon: "sparkles",
          },
          {
            key: "b3",
            type: "text",
            content: "Ad money burns without profit",
            icon: "barChart3",
          },
        ],
      },
    ],
  };

  // Create ComponentSchema for About Section (simplified)
  const aboutSchema: ComponentSchema = {
    type: "flowbite-content-section",
    props: {},
    items: [
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "We Are Your Growth Team And We Will Take You Further",
      },
      {
        key: "content",
        type: "text",
        content: "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue. Our proven systems generate leads and revenue month after month.",
      },
    ],
  };

  // Create ComponentSchema for Services Gallery (What's Included - GOSG-style)
  const servicesSchema: ComponentSchema = {
    type: "flowbite-whats-included-section",
    props: {},
    items: [
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "What's included in your growth package",
      },
      {
        key: "subtitle",
        type: "text",
        content: "A focused breakdown of the core areas driving results, each tailored to your goals and adapted after consultation.",
      },
      {
        key: "service1",
        type: "array",
        items: [
          {
            key: "title",
            type: "heading",
            level: 3,
            content: "Website & Conversion",
          },
          {
            key: "description",
            type: "text",
            content: "We design and improve high‑converting landing pages with continuous optimization, A/B testing, and conversion tracking.",
          },
          {
            key: "features",
            type: "array",
            items: [
              { key: "f1", type: "text", content: "High-converting landing page" },
              { key: "f2", type: "text", content: "A/B testing and conversion tracking" },
              { key: "f3", type: "text", content: "Monthly conversion improvements" },
            ],
          },
        ],
      },
      {
        key: "service2",
        type: "array",
        items: [
          {
            key: "title",
            type: "heading",
            level: 3,
            content: "Acquisition",
          },
          {
            key: "description",
            type: "text",
            content: "Drive qualified traffic with paid acquisition across search and social, supported by smart retargeting.",
          },
          {
            key: "features",
            type: "array",
            items: [
              { key: "f1", type: "text", content: "SEM (Search Ads)" },
              { key: "f2", type: "text", content: "Social Ads" },
              { key: "f3", type: "text", content: "Retargeting" },
            ],
          },
        ],
      },
      {
        key: "service3",
        type: "array",
        items: [
          {
            key: "title",
            type: "heading",
            level: 3,
            content: "Creative Production",
          },
          {
            key: "description",
            type: "text",
            content: "Consistent, branded creative assets that power your ads and social presence, plus copywriting that converts.",
          },
          {
            key: "features",
            type: "array",
            items: [
              { key: "f1", type: "text", content: "Branded creative assets (ads & social)" },
              { key: "f2", type: "text", content: "Copywriting for conversion" },
              { key: "f3", type: "text", content: "Design system & brand consistency" },
            ],
          },
        ],
      },
      {
        key: "service4",
        type: "array",
        items: [
          {
            key: "title",
            type: "heading",
            level: 3,
            content: "SEO",
          },
          {
            key: "description",
            type: "text",
            content: "Build compounding organic growth through premium backlinks, SEO content, and ongoing technical checks.",
          },
          {
            key: "features",
            type: "array",
            items: [
              { key: "f1", type: "text", content: "Premium SEO backlinks" },
              { key: "f2", type: "text", content: "SEO-optimized articles" },
              { key: "f3", type: "text", content: "Technical SEO checks" },
            ],
          },
        ],
      },
    ],
  };

  // Create ComponentSchema for FAQ Section (GOSG-style)
  const faqSchema: ComponentSchema = {
    type: "flowbite-faq-section",
    props: {},
    items: [
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "Frequently Asked Questions",
      },
      {
        key: "faqItems",
        type: "array",
        items: [
          {
            key: "question",
            type: "text",
            content: "What does 'full‑stack growth' mean?",
          },
          {
            key: "answer",
            type: "text",
            content: "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue.",
          },
        ],
      },
      {
        key: "faq1",
        type: "array",
        items: [
          {
            key: "question",
            type: "text",
            content: "How fast will I see results?",
          },
          {
            key: "answer",
            type: "text",
            content: "Paid ads can generate leads quickly, while SEO compounds over time. We'll align the plan to your goals and share clear performance reporting month-to-month.",
          },
        ],
      },
      {
        key: "faq2",
        type: "array",
        items: [
          {
            key: "question",
            type: "text",
            content: "Do you work with my existing website?",
          },
          {
            key: "answer",
            type: "text",
            content: "Yes. We can optimize your current site for conversions and SEO, or rebuild key pages where needed—without disrupting your brand.",
          },
        ],
      },
      {
        key: "faq3",
        type: "array",
        items: [
          {
            key: "question",
            type: "text",
            content: "Is this a good fit for small businesses?",
          },
          {
            key: "answer",
            type: "text",
            content: "Yes. We tailor scopes to your stage—whether you need a consistent lead pipeline, better conversion rates, or a complete growth system.",
          },
        ],
      },
    ],
  };

  // Create ComponentSchema for Pre-footer CTA Section (GOSG-style)
  const ctaSchema: ComponentSchema = {
    type: "flowbite-cta-section",
    props: {},
    items: [
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "Ready to turn traffic into revenue?",
      },
      {
        key: "description",
        type: "text",
        content: "Get a clear growth plan tailored to your business in a free strategy call.",
      },
    ],
  };

  // Pricing plans data (GOSG-style)
  const pricingPlans = [
    {
      name: "Growth Package",
      description: "Full-stack growth solution",
      price: "Custom",
      priceDescription: "Tailored to your needs",
      features: [
        "Website & Conversion optimization",
        "Paid acquisition (SEM & Social Ads)",
        "Creative production & copywriting",
        "SEO content & backlinks",
        "Monthly performance reports",
        "Dedicated account manager",
      ],
      isPopular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        onContactClick={handleContactClick}
      />

      <main className="flex-1">
        {/* Hero Section - GOSG-style */}
        <div id="hero">
          <FlowbiteHeroSection component={heroSchema} />
          {/* Custom CTA button that opens modal */}
          <div className="container mx-auto px-4 -mt-8 mb-8 text-center">
            <button
              onClick={handleContactClick}
              className="btn-cta px-8 py-6 text-lg"
            >
              Get free consultation
            </button>
          </div>
        </div>

        {/* Challenge/Problem Section - GOSG-style */}
        <div id="challenge" className="scroll-mt-20">
          <FlowbitePainPointSection component={challengeSchema} />
        </div>

        {/* About Section */}
        <div id="about" className="scroll-mt-20">
          <FlowbiteContentSection component={aboutSchema} />
        </div>

        {/* Pricing Section - GOSG-style */}
        <div id="pricing" className="scroll-mt-20 bg-gray-50 py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Pricing
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Tailored growth packages designed to scale your business
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <Card
                  key={idx}
                  className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.priceDescription && (
                        <span className="text-gray-600 ml-2">{plan.priceDescription}</span>
                      )}
                    </div>
                    <ul className="text-left space-y-3 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleContactClick}
                      className="btn-cta w-full"
                    >
                      Get Started
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Services Gallery (What's Included) - GOSG-style */}
        <div id="services" className="scroll-mt-20">
          <FlowbiteWhatsIncludedSection component={servicesSchema} />
        </div>

        {/* FAQ Section */}
        <div id="faq" className="scroll-mt-20">
          <FlowbiteFAQSection component={faqSchema} />
        </div>

        {/* Pre-footer CTA Section - GOSG-style */}
        <div id="contact" className="scroll-mt-20">
          <FlowbiteCTASection component={ctaSchema} />
          {/* Custom CTA button that opens modal */}
          <div className="bg-brand-gradient pb-16 -mt-8">
            <div className="container mx-auto px-4 text-center">
              <button
                onClick={handleContactClick}
                className="btn-cta px-8 py-6 text-lg bg-white hover:bg-gray-100"
                style={{ color: 'var(--brand-primary)' }}
              >
                Get free consultation
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
      />

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Theme Toggle - Sticky bottom-left */}
      <ThemeToggle />
    </div>
  );
};

export default MasterTheme;
