import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import FlowbiteHeroSection from "@/libraries/flowbite/components/FlowbiteHeroSection";
import FlowbiteFeaturesSection from "@/libraries/flowbite/components/FlowbiteFeaturesSection";
import FlowbiteTestimonialsSection from "@/libraries/flowbite/components/FlowbiteTestimonialsSection";
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
 * Master Theme - Landing Page (Flowbite-based)
 *
 * Revamped light/dark styles + hero carousel + testimonial slider.
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
  const { branding } = useThemeBranding("master", tenantId);

  // Apply branding colors as CSS variables
  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      const brandingColors = branding as any;

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
        root.style.setProperty("--brand-background", String(brandingColors.color_background));
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

  // Initialize Flowbite theme on mount
  useEffect(() => {
    initFlowbiteTheme(designSystemTheme);
  }, [designSystemTheme]);

  // Intercept CTA button clicks to open contact modal
  useEffect(() => {
    const handleCTAClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('a[href="#contact"], button');
      if (button && button.getAttribute("href") === "#contact") {
        e.preventDefault();
        e.stopPropagation();
        setIsContactModalOpen(true);
      }
    };

    document.addEventListener("click", handleCTAClick, true);
    return () => {
      document.removeEventListener("click", handleCTAClick, true);
    };
  }, []);

  const isThankYouPage =
    location.pathname === "/thank-you" ||
    location.pathname.endsWith("/thank-you") ||
    location.pathname.includes("/thank-you");

  if (isThankYouPage) {
    return (
      <ThankYouPage tenantName={tenantName} tenantSlug={tenantSlug} tenantId={tenantId} />
    );
  }

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  const heroSchema: ComponentSchema = {
    type: "flowbite-hero-section",
    props: {
      showCarousel: false,
    },
    items: [
      {
        key: "motto",
        type: "text",
        content: "Unlimited design, one simple plan — built to convert.",
      },
      {
        key: "title",
        type: "heading",
        level: 1,
        content: "Your Business Needs More Than a Website — It Needs Growth.",
      },
      {
        key: "description",
        type: "text",
        content:
          "We craft high‑performance pages using Flowbite components, strong messaging, and conversion-first UX — so every visit has a clear path to revenue.",
      },
      {
        key: "cta",
        type: "button",
        content: "Book an intro call",
        link: "#contact",
      },
    ],
  };

  const featuresSchema: ComponentSchema = {
    type: "flowbite-features-section",
    props: {},
    items: [
      {
        key: "features",
        type: "array",
        items: [
          {
            key: "f1",
            type: "feature",
            items: [
              { key: "title", type: "heading", level: 3, content: "Expert guidance" },
              {
                key: "description",
                type: "text",
                content:
                  "Clear strategy, clean sections, and a persuasive flow that makes decisions easy.",
              },
              { key: "icon", type: "text", content: "clock" },
            ],
          },
          {
            key: "f2",
            type: "feature",
            items: [
              { key: "title", type: "heading", level: 3, content: "Structured conversion flow" },
              {
                key: "description",
                type: "text",
                content:
                  "Each section has a purpose: build trust, answer objections, and drive action.",
              },
              { key: "icon", type: "text", content: "users" },
            ],
          },
          {
            key: "f3",
            type: "feature",
            items: [
              { key: "title", type: "heading", level: 3, content: "Calm, premium design" },
              {
                key: "description",
                type: "text",
                content:
                  "Beautiful light + dark modes with strong contrast and consistent spacing.",
              },
              { key: "icon", type: "text", content: "heart" },
            ],
          },
        ],
      },
    ],
  };

  const testimonialsSchema: ComponentSchema = {
    type: "flowbite-testimonials-section",
    props: {
      title: "Loved by founders",
      subtitle: "Short, sharp feedback from teams we've helped convert more visitors.",
    },
    items: [
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "Loved by founders",
      },
      {
        key: "subtitle",
        type: "text",
        content: "Short, sharp feedback from teams we've helped convert more visitors.",
      },
      {
        key: "reviews",
        type: "array",
        items: [
          {
            key: "r1",
            type: "review",
            props: {
              content: "Our landing page went from 'nice' to 'high converting' in a week. The new hero + sections are super clean.",
              name: "Sarah C.",
              title: "Founder",
            },
          },
          {
            key: "r2",
            type: "review",
            props: {
              content: "Dark mode looks premium, and the slider helped us show proof instantly.",
              name: "Marcus T.",
              title: "Marketing Lead",
            },
          },
          {
            key: "r3",
            type: "review",
            props: {
              content: "We finally have a consistent design system we can iterate on without redoing everything.",
              name: "Priya S.",
              title: "Operations",
            },
          },
          {
            key: "r4",
            type: "review",
            props: {
              content: "The layout feels modern and fast. Great UX on mobile.",
              name: "David L.",
              title: "CEO",
            },
          },
        ],
      },
    ],
  };

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
        content:
          "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue. Our proven systems generate leads and revenue month after month.",
      },
    ],
  };

  const servicesSchema: ComponentSchema = {
    type: "flowbite-whats-included-section",
    props: {},
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
        content: "What's included in your growth package",
      },
      {
        key: "description",
        type: "text",
        content:
          "A focused breakdown of the core areas driving results, each tailored to your goals.",
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
                content:
                  "High‑converting landing pages, A/B test ideas, and conversion tracking.",
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
  };

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
            content:
              "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue.",
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
            content:
              "Paid ads can generate leads quickly, while SEO compounds over time. We'll align the plan to your goals and share clear performance reporting month-to-month.",
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
            content:
              "Yes. We can optimize your current site for conversions and SEO, or rebuild key pages where needed—without disrupting your brand.",
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
            content:
              "Yes. We tailor scopes to your stage—whether you need a consistent lead pipeline, better conversion rates, or a complete growth system.",
          },
        ],
      },
    ],
  };

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
      {
        key: "cta",
        type: "button",
        content: "Get free consultation",
        link: "#contact",
      },
    ],
  };

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
    <div className="min-h-screen flex flex-col bg-[color:var(--brand-background)]">
      <Header tenantName={tenantName} tenantSlug={tenantSlug} onContactClick={handleContactClick} />

      <main className="flex-1">
        <div id="hero">
          <FlowbiteHeroSection component={heroSchema} />
        </div>

        <div id="challenge" className="scroll-mt-20">
          <FlowbitePainPointSection component={challengeSchema} />
        </div>

        <div id="features" className="scroll-mt-20">
          <FlowbiteFeaturesSection component={featuresSchema} />
        </div>

        <div id="services" className="scroll-mt-20">
          <FlowbiteWhatsIncludedSection component={servicesSchema} />
        </div>

        <div id="about" className="scroll-mt-20">
          <FlowbiteContentSection component={aboutSchema} />
        </div>

        <div id="testimonials" className="scroll-mt-20">
          <FlowbiteTestimonialsSection component={testimonialsSchema} />
        </div>

        <div
          id="pricing"
          className="scroll-mt-20 relative overflow-hidden py-20 px-4"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/2 h-[22rem] w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/12 via-sky-400/10 to-lime-400/12 blur-3xl" />
            <div className="absolute -bottom-56 right-[-12rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-lime-400/10 via-sky-400/10 to-indigo-400/10 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 max-w-6xl relative">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                Pricing
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                A simple package designed to scale your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)] ${plan.isPopular ? "ring-2 ring-lime-400/60" : ""}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-lime-300 text-slate-950 px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-left">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-semibold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.priceDescription && (
                        <span className="text-gray-600 dark:text-gray-300 ml-2">
                          {plan.priceDescription}
                        </span>
                      )}
                    </div>

                    <ul className="text-left space-y-3 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-lime-400 mr-2 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button onClick={handleContactClick} className="btn-cta w-full">
                      Get Started
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="faq" className="scroll-mt-20">
          <FlowbiteFAQSection component={faqSchema} />
        </div>

        <div id="contact" className="scroll-mt-20">
          <FlowbiteCTASection component={ctaSchema} />
        </div>
      </main>

      <Footer tenantName={tenantName} tenantSlug={tenantSlug} />

      <ContactFormModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default MasterTheme;