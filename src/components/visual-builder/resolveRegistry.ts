"use client";

import type React from "react";

// gosgconsulting theme components
import * as gosg from "../../../sparti-cms/theme/gosgconsulting/components/registry";

// landingpage theme components
import LandingHeroSection from "../../../sparti-cms/theme/landingpage/components/HeroSection";
import LandingServicesSection from "../../../sparti-cms/theme/landingpage/components/ServicesSection";
import LandingCTASection from "../../../sparti-cms/theme/landingpage/components/CTASection";
import LandingFAQSection from "../../../sparti-cms/theme/landingpage/components/FAQSection";
import LandingTestimonialsSection from "../../../sparti-cms/theme/landingpage/components/TestimonialsSection";
import LandingHeader from "../../../sparti-cms/theme/landingpage/components/Header";
import LandingFooter from "../../../sparti-cms/theme/landingpage/components/Footer";

// sparti-seo-landing theme components
import SEOLandingHeroSection from "../../../sparti-cms/theme/sparti-seo-landing/components/HeroSection";
import SEOLandingFooter from "../../../sparti-cms/theme/sparti-seo-landing/components/Footer";
import SEOLandingWorkflowSection from "../../../sparti-cms/theme/sparti-seo-landing/components/WorkflowSection";
import { InteractiveSEOSection as SEOLandingInteractiveSEOSection } from "../../../sparti-cms/theme/sparti-seo-landing/components/InteractiveSEOSection";
import SEOLandingComparisonSection from "../../../sparti-cms/theme/sparti-seo-landing/components/ComparisonSection";
import SEOLandingPricingSection from "../../../sparti-cms/theme/sparti-seo-landing/components/PricingSection";
import SEOLandingTestimonialsSection from "../../../sparti-cms/theme/sparti-seo-landing/components/TestimonialsSection";

// custom theme components
import CustomHeroSection from "../../../sparti-cms/theme/custom/components/HeroSection";
import CustomHeader from "../../../sparti-cms/theme/custom/components/Header";
import CustomFooter from "../../../sparti-cms/theme/custom/components/Footer";
import CustomFeaturesSection from "../../../sparti-cms/theme/custom/components/FeaturesSection";
import CustomCTASection from "../../../sparti-cms/theme/custom/components/CTASection";

export type RegistryMap = Record<string, React.ComponentType<any>>;

const landingpageRegistry: RegistryMap = {
  HeroSection: LandingHeroSection,
  ServicesSection: LandingServicesSection,
  CTASection: LandingCTASection,
  FAQSection: LandingFAQSection,
  TestimonialsSection: LandingTestimonialsSection,
  Header: LandingHeader,
  Footer: LandingFooter,
};

const seoLandingRegistry: RegistryMap = {
  HeroSection: SEOLandingHeroSection,
  Footer: SEOLandingFooter,
  WorkflowSection: SEOLandingWorkflowSection,
  InteractiveSEOSection: SEOLandingInteractiveSEOSection,
  ComparisonSection: SEOLandingComparisonSection,
  PricingSection: SEOLandingPricingSection,
  TestimonialsSection: SEOLandingTestimonialsSection,
};

const customRegistry: RegistryMap = {
  HeroSection: CustomHeroSection,
  Header: CustomHeader,
  Footer: CustomFooter,
  FeaturesSection: CustomFeaturesSection,
  CTASection: CustomCTASection,
};

// gosgconsulting registry is already exported as { componentRegistry } map
function resolveGosg(): RegistryMap {
  const gosgAny = gosg as any;
  if (gosgAny && gosgAny.componentRegistry && typeof gosgAny.componentRegistry === "object") {
    return gosgAny.componentRegistry as RegistryMap;
  }
  return {};
}

export function resolveThemeRegistry(themeId?: string | null): RegistryMap {
  const id = (themeId || "").toLowerCase();

  if (id === "gosgconsulting" || id === "gosg" || id === "go-sg" || id === "gosg-consulting") {
    const reg = resolveGosg();
    if (Object.keys(reg).length > 0) return reg;
  }

  if (id === "landingpage" || id === "landing-page") {
    return landingpageRegistry;
  }

  if (id === "sparti-seo-landing" || id === "seo-landing" || id === "sparti-seo") {
    return seoLandingRegistry;
  }

  if (id === "custom") {
    return customRegistry;
  }

  // Fallback: if gosg is available, use it as a default baseline
  const fallback = resolveGosg();
  if (Object.keys(fallback).length > 0) return fallback;

  // Last resort: a minimal merged fallback to avoid blank preview
  return {
    ...landingpageRegistry,
    ...seoLandingRegistry,
    ...customRegistry,
  };
}