/**
 * Component Registry for Dynamic Page Renderer
 * 
 * This registry maps component types from the schema to actual React components
 */

import HeroSection from './HeroSection';
import HomeHeroSection from './HomeHeroSection';
import ChallengeSection from './ChallengeSection';
import Gallery4Section from './Gallery4Section';
import BlogSection from './BlogSection';
import ContactForm from './ContactForm';
import CTASection from './CTASection';
import AboutSection2 from './ui/about-section-2';
import PricingPage from './ui/pricing-page';
import SimplePricingSection from './SimplePricingSection';
import SimpleTextSection from './SimpleTextSection';
import SimpleListSection from './SimpleListSection';
import SimpleStatsSection from './SimpleStatsSection';

/**
 * Registry of components available for dynamic rendering
 * The keys should match the "type" field in the component schema
 */
export const componentRegistry = {
  // Main components
  HeroSection,
  HomeHeroSection,
  ChallengeSection,
  Gallery4Section,
  BlogSection,
  ContactForm,
  CTASection,

  // UI components
  AboutSection2,
  PricingPage,

  // Simple components
  SimplePricingSection,
  SimpleTextSection,
  SimpleListSection,
  SimpleStatsSection,
};

export type ComponentRegistryType = typeof componentRegistry;
export type ComponentType = keyof ComponentRegistryType;

