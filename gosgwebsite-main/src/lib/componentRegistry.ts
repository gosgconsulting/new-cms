/**
 * Component Registry for Dynamic Page Renderer
 * 
 * This registry maps component types from the schema to actual React components
 */

import HeroSection from '@/components/HeroSection';
import PainPointSection from '@/components/PainPointSection';
import SEOResultsSection from '@/components/SEOResultsSection';
import SEOServicesShowcase from '@/components/SEOServicesShowcase';
import WhatIsSEOServicesSection from '@/components/WhatIsSEOServicesSection';
import NewTestimonials from '@/components/NewTestimonials';
import FAQAccordion from '@/components/FAQAccordion';
import BlogSection from '@/components/BlogSection';
import ContactForm from '@/components/ContactForm';
import SimpleServiceSection from '@/components/SimpleServiceSection';
import SimpleTextSection from '@/components/SimpleTextSection';
import SimpleListSection from '@/components/SimpleListSection';
import SimplePricingSection from '@/components/SimplePricingSection';
import SimpleStatsSection from '@/components/SimpleStatsSection';
import HomeHeroSection from '@/components/HomeHeroSection';
import ClientLogos from '@/components/ClientLogos';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import StatsCounter from '@/components/StatsCounter';
import ServiceCaseStudies from '@/components/ServiceCaseStudies';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import CTASection from '@/components/CTASection';
import AboutSection2 from '@/components/ui/about-section-2';
import RadialOrbitalTimelineSection from '@/components/RadialOrbitalTimelineSection';
import ChallengeSection from '@/components/ChallengeSection';
import PricingPage from '@/components/ui/pricing-page';
import StickyScrollSection from '@/components/StickyScrollSection';
import ClientTestimonialsSection from '@/components/ClientTestimonialsSection';
import Gallery4Section from '@/components/Gallery4Section';
import GlassTestimonialSection from '@/components/GlassTestimonialSection';

/**
 * Registry of components available for dynamic rendering
 * The keys should match the "type" field in the component schema
 */
export const componentRegistry = {
  // Main components
  HeroSection,
  PainPointSection,
  ResultsSection: SEOResultsSection,
  ServicesShowcase: SEOServicesShowcase,
  SEOExplanation: WhatIsSEOServicesSection,
  Testimonials: NewTestimonials,
  FAQAccordion,
  BlogSection,
  ContactForm,

  // Simple components
  SimpleServiceSection,
  SimpleTextSection,
  SimpleListSection,
  SimplePricingSection,
  SimpleStatsSection,

  // Standalone homepage hero
  HomeHeroSection,

  // NEW: radial orbital timeline section
  RadialOrbitalTimeline: RadialOrbitalTimelineSection,

  // NEW: two-column challenge section
  ChallengeSection,

  // NEW: animated about section
  AboutSection2,

  // NEW: glass testimonial section
  GlassTestimonialSection,

  // NEW: pricing page section
  PricingPage,

  // REPLACED: circular gallery section with client testimonials
  ClientTestimonialsSection,

  // NEW: gallery4 case studies section
  Gallery4Section,
};

export type ComponentRegistryType = typeof componentRegistry;
export type ComponentType = keyof ComponentRegistryType;