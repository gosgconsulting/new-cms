import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import FlowbiteHeroSection from "@/libraries/flowbite/components/FlowbiteHeroSection";
import FlowbiteTestimonialsSection from "@/libraries/flowbite/components/FlowbiteTestimonialsSection";
import FlowbitePainPointSection from "@/libraries/flowbite/components/FlowbitePainPointSection";
import FlowbiteContentSection from "@/libraries/flowbite/components/FlowbiteContentSection";
import FlowbiteWhatsIncludedSection from "@/libraries/flowbite/components/FlowbiteWhatsIncludedSection";
import FlowbiteFAQSection from "@/libraries/flowbite/components/FlowbiteFAQSection";
import FlowbiteCTASection from "@/libraries/flowbite/components/FlowbiteCTASection";
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
    props: {
      variant: "about",
      badge: "About us",
      imageSrc: "/assets/gregoire-liao.png",
      reviewLabel: "5 Star",
      reviewSub: "Review",
    },
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
          "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue.\n\nOur proven systems generate leads and revenue month after month, while you stay focused on running the business.",
      },
      {
        key: "button",
        type: "button",
        content: "Get Started",
        link: "#contact",
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
        content: "Increase your revenue with a full‑stack growth package",
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

        <div id="about" className="scroll-mt-20">
          <FlowbiteContentSection component={aboutSchema} />
        </div>

        <div id="services" className="scroll-mt-20">
          <FlowbiteWhatsIncludedSection component={servicesSchema} />
        </div>

        <div id="testimonials" className="scroll-mt-20">
          <FlowbiteTestimonialsSection component={testimonialsSchema} />
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