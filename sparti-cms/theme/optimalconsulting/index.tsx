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
import Footer from "../master/components/layout/Footer";
import ContactFormModal from "../master/components/modals/ContactFormModal";
import OurServicesSection from "../master/components/OurServicesSection";
import { ThankYouPage } from "../master/pages/ThankYouPage";
import PrivacyPolicyPage from "../master/pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "../master/pages/TermsAndConditionsPage";
import BlogListPage from "../master/pages/blog/BlogListPage";
import BlogPostPage from "../master/pages/blog/BlogPostPage";
import { HeroSection } from "@/components/ui/hero-section-2";
import StatisticsSection from "./components/StatisticsSection";
import AnniversarySection from "./components/AnniversarySection";
import "./theme.css";

// Helper function to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

interface OptimalConsultingThemeProps {
  basePath?: string;
  pageSlug?: string;
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  designSystemTheme?: "default" | "minimal" | "enterprise" | "playful" | "mono";
}

const normalizeSlug = (slug?: string) => {
  if (!slug) return "";
  return String(slug)
    .split("?")[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
};

/**
 * Optimal Consulting Theme
 * Based on Master theme structure with Optimal Consulting content
 */
const OptimalConsultingTheme: React.FC<OptimalConsultingThemeProps> = ({
  basePath = "/theme/optimalconsulting",
  pageSlug,
  tenantName = "Optimal Consulting",
  tenantSlug = "optimalconsulting",
  tenantId,
  designSystemTheme = "default",
}) => {
  const location = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const themeSlug = tenantSlug || "optimalconsulting";

  // Fetch branding colors from database
  const { branding } = useThemeBranding(themeSlug, tenantId);

  // Set Optimal Consulting brand colors
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", "#145598");
    root.style.setProperty("--brand-secondary", "#4ED1CE");
    root.style.setProperty("--brand-primary-dark", adjustColorBrightness("#145598", -10));
    root.style.setProperty("--brand-primary-light", adjustColorBrightness("#145598", 20));
    root.style.setProperty("--brand-secondary-dark", adjustColorBrightness("#4ED1CE", -10));
    root.style.setProperty("--brand-secondary-light", adjustColorBrightness("#4ED1CE", 20));
    
    // Override with DB branding if available
    if (branding) {
      const brandingColors = branding as any;
      if (brandingColors.color_primary) {
        const primaryColor = String(brandingColors.color_primary);
        root.style.setProperty("--brand-primary", primaryColor);
        root.style.setProperty("--brand-primary-dark", adjustColorBrightness(primaryColor, -10));
        root.style.setProperty("--brand-primary-light", adjustColorBrightness(primaryColor, 20));
      }
      if (brandingColors.color_secondary) {
        const secondaryColor = String(brandingColors.color_secondary);
        root.style.setProperty("--brand-secondary", secondaryColor);
        root.style.setProperty("--brand-secondary-dark", adjustColorBrightness(secondaryColor, -10));
        root.style.setProperty("--brand-secondary-light", adjustColorBrightness(secondaryColor, 20));
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

  const normalizedPageSlug = normalizeSlug(pageSlug);
  const slugParts = normalizedPageSlug.split("/").filter(Boolean);
  const topLevelSlug = slugParts[0] || "";

  const isThankYouPage =
    topLevelSlug === "thank-you" ||
    location.pathname === "/thank-you" ||
    location.pathname.endsWith("/thank-you") ||
    location.pathname.includes("/thank-you");

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  if (isThankYouPage) {
    return (
      <ThankYouPage
        tenantName={tenantName}
        tenantSlug={themeSlug}
        tenantId={tenantId}
        basePath={basePath}
      />
    );
  }

  // Optimal Consulting Landing page schemas
  const heroSchema: ComponentSchema = {
    type: "flowbite-hero-section",
    props: {
      showCarousel: false,
      backgroundImage: `/theme/${themeSlug}/Assets/500x202-768x310.jpg`,
    },
    items: [
      {
        key: "motto",
        type: "text",
        content: "Singapore HQ • Asia delivery",
      },
      {
        key: "title",
        type: "heading",
        level: 1,
        content: "Developing Leaders, Optimising Performance",
      },
      {
        key: "description",
        type: "text",
        content:
          "We deliver comprehensive consulting services aimed at transforming talent into strategic impact and translating organisational strategy into success. Optimal Consulting has been partnering clients across the globe since 2002 to deliver people solutions for businesses, with a focus on: Assessments and Prediction of Leadership Potential and Succession Readiness, Talent and Leadership Development Interventions, and High-performing Team Assessments and Development Interventions.",
      },
      {
        key: "cta",
        type: "button",
        content: "Book consultation",
        link: "#contact",
      },
    ],
  };

  const testimonialsSchema: ComponentSchema = {
    type: "flowbite-testimonials-section",
    props: {
      title: "Client impact",
      subtitle: "Specific outcomes—clear signals—credible decisions.",
    },
    items: [
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "Client impact",
      },
      {
        key: "subtitle",
        type: "text",
        content: "Specific outcomes—clear signals—credible decisions.",
      },
      {
        key: "reviews",
        type: "array",
        items: [
          {
            key: "r1",
            type: "review",
            props: {
              content:
                "We reduced promotion risk by introducing validated potential indicators and a calibrated success profile for critical roles.",
              name: "Regional HR Director",
              title: "Financial Services",
            },
          },
          {
            key: "r2",
            type: "review",
            props: {
              content:
                "The Academy enabled our HR team to interpret assessment outputs consistently and coach leaders with confidence.",
              name: "Head of Talent",
              title: "Technology",
            },
          },
          {
            key: "r3",
            type: "review",
            props: {
              content:
                "We aligned leadership behaviours to strategy and built a practical pipeline plan that business leaders could sponsor.",
              name: "Chief People Officer",
              title: "Consumer",
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
        content: "Need to make better talent decisions?",
      },
      {
        key: "heading",
        type: "heading",
        level: 2,
        content: "Your Leadership Pipeline Needs Predictable Outcomes",
      },
      {
        key: "bullets",
        type: "array",
        items: [
          {
            key: "b1",
            type: "text",
            content: "Promotion risks are costly and hard to predict",
            icon: "x",
          },
          {
            key: "b2",
            type: "text",
            content: "Succession planning lacks data-driven insights",
            icon: "sparkles",
          },
          {
            key: "b3",
            type: "text",
            content: "Leadership development needs measurable impact",
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
      imageSrc: `/theme/${themeSlug}/assets/menu1.jpg`,
      reviewLabel: "20+ Years",
      reviewSub: "Experience",
    },
    items: [
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "We Are Your Strategic Talent Partner",
      },
      {
        key: "content",
        type: "text",
        content:
          "Optimal Consulting has been partnering clients across the globe since 2002 to deliver people solutions for businesses. We are headquartered in Singapore, with a physical presence in Kuala Lumpur, Hong Kong, Shanghai and Tokyo.\n\nWe help organisational leaders make talent decisions with validated assessments, scalable capability building, and pragmatic consulting—so you can strengthen succession and improve performance outcomes.",
      },
      {
        key: "button",
        type: "button",
        content: "Learn more",
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
        content: "Business Units",
      },
      {
        key: "title",
        type: "heading",
        level: 2,
        content: "Three connected offerings to assess potential, build capability, and deliver outcomes",
      },
      {
        key: "description",
        type: "text",
        content:
          "A focused breakdown of our core services, each tailored to your talent and leadership goals.",
      },
      {
        key: "features",
        type: "array",
        items: [
          {
            key: "s1",
            type: "feature",
            items: [
              {
                key: "title",
                type: "heading",
                level: 3,
                content: "Assessments",
              },
              {
                key: "description",
                type: "text",
                content:
                  "Explore world-class psychometric assessment tools to gain insights into your current and to-be talent.",
              },
            ],
          },
          {
            key: "s2",
            type: "feature",
            items: [
              {
                key: "title",
                type: "heading",
                level: 3,
                content: "Academy",
              },
              {
                key: "description",
                type: "text",
                content:
                  "Equip your organisation with the skills to administer assessment tools, interpret profiling outcomes and bridge performance gaps with development intervention programmes.",
              },
            ],
          },
          {
            key: "s3",
            type: "feature",
            items: [
              {
                key: "title",
                type: "heading",
                level: 3,
                content: "Services",
              },
              {
                key: "description",
                type: "text",
                content:
                  "Entrust the prediction of leadership potential and succession readiness for your organisation to our trained and experienced consultants.",
              },
            ],
          },
        ],
      },
      {
        key: "cta",
        type: "button",
        content: "Explore services",
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
            content: "What services does Optimal Consulting offer?",
          },
          {
            key: "answer",
            type: "text",
            content:
              "We offer three main services: Assessments (psychometric tools for talent insights), Academy (training to administer assessments and interpret outcomes), and Services (consulting for leadership potential prediction and succession readiness).",
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
            content: "Where does Optimal Consulting operate?",
          },
          {
            key: "answer",
            type: "text",
            content:
              "We are headquartered in Singapore, with a physical presence in Kuala Lumpur, Hong Kong, Shanghai and Tokyo. We serve clients across 38 locations globally.",
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
            content: "How long has Optimal Consulting been in business?",
          },
          {
            key: "answer",
            type: "text",
            content:
              "Optimal Consulting has been partnering clients across the globe since 2002. In 2022, we celebrated twenty years of predicting leadership potential and delivering talent development interventions across Asia.",
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
            content: "What results can I expect?",
          },
          {
            key: "answer",
            type: "text",
            content:
              "We have assessed over 70,000 professionals, predicted over 7,000 high potentials, certified over 3,000 licensed users, and delivered over 100,000 assessments. Our data-driven approach helps reduce promotion risk and accelerate leadership development.",
          },
        ],
      },
    ],
  };

  const ctaSchema: ComponentSchema = {
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
        content: "Ready to partner with us?",
      },
      {
        key: "description",
        type: "text",
        content:
          "Tell us what you're trying to achieve. We'll propose a practical approach—assessment, academy enablement, and/or consulting—aligned to your context.",
      },
      {
        key: "cta",
        type: "button",
        content: "Book consultation",
        link: "#contact",
      },
    ],
  };

  const renderMain = () => {
    if (topLevelSlug === "blog") {
      if (slugParts.length === 1) {
        return <BlogListPage basePath={basePath} tenantId={tenantId} />;
      }
      return (
        <BlogPostPage
          basePath={basePath}
          slug={slugParts[1] || ""}
          tenantId={tenantId}
        />
      );
    }

    if (topLevelSlug === "privacy-policy") {
      return <PrivacyPolicyPage tenantName={tenantName} />;
    }

    if (topLevelSlug === "terms-and-conditions" || topLevelSlug === "terms") {
      return <TermsAndConditionsPage tenantName={tenantName} />;
    }

    // Extract hero data from schema for new HeroSection component
    const getTextByKey = (items: any[], key: string) => {
      const item = items.find((i) => i.key === key);
      return item?.content || "";
    };

    const heroMotto = getTextByKey(heroSchema.items || [], "motto");
    const heroTitle = getTextByKey(heroSchema.items || [], "title");
    const heroDescription = getTextByKey(heroSchema.items || [], "description");
    const heroCTA = heroSchema.items?.find((i) => i.key === "cta");
    const heroBackgroundImage = heroSchema.props?.backgroundImage || `/theme/${themeSlug}/assets/hero.svg`;

    return (
      <>
        <div id="hero">
          <HeroSection
            slogan={heroMotto}
            title={heroTitle}
            subtitle={heroDescription}
            callToAction={{
              text: heroCTA?.content || "Book consultation",
              href: heroCTA?.link || "#contact"
            }}
            backgroundImage={heroBackgroundImage}
            contactInfo={{
              website: "optimalconsulting.com",
              phone: "+65 1234 5678",
              address: "Singapore HQ • Asia delivery"
            }}
          />
        </div>

        <div id="challenge" className="scroll-mt-20">
          <FlowbitePainPointSection component={challengeSchema} />
        </div>

        <div id="about" className="scroll-mt-20">
          <FlowbiteContentSection component={aboutSchema} />
        </div>

        <div id="testimonials" className="scroll-mt-20">
          <FlowbiteTestimonialsSection component={testimonialsSchema} />
        </div>

        <div id="our-services" className="scroll-mt-20">
          <OurServicesSection themeSlug={themeSlug} />
        </div>

        <div id="faq" className="scroll-mt-20">
          <FlowbiteFAQSection component={faqSchema} />
        </div>

        <div id="statistics" className="scroll-mt-20">
          <StatisticsSection />
        </div>

        <div id="anniversary" className="scroll-mt-20">
          <AnniversarySection themeSlug={themeSlug} />
        </div>

        <div id="contact" className="scroll-mt-20">
          <FlowbiteCTASection component={ctaSchema} />
        </div>
      </>
    );
  };

  const logoSrc = branding?.site_logo || `/theme/${themeSlug}/assets/logo-white.svg`;

  return (
    <div className="min-h-screen flex flex-col bg-(--brand-background)">
      <Header
        tenantName={tenantName}
        tenantSlug={themeSlug}
        logoSrc={logoSrc}
        basePath={basePath}
        onContactClick={handleContactClick}
      />

      <main className="flex-1">{renderMain()}</main>

      <Footer tenantName={tenantName} tenantSlug={themeSlug} basePath={basePath} />

      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        tenantName={tenantName}
        themeSlug={themeSlug}
      />
    </div>
  );
};

export default OptimalConsultingTheme;
