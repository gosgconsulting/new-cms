/**
 * Component mapper to render components based on schema data
 * This allows components to work with both static and dynamic content
 */

import { Component } from "@/types/schema";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

interface ComponentMapperProps {
  component?: Component;
  fallback?: React.ReactNode;
}

/**
 * Maps component type to React component with schema data
 * Components now accept optional data prop for dynamic content
 */
export function ComponentMapper({ component, fallback }: ComponentMapperProps) {
  if (!component) {
    return fallback || null;
  }

  switch (component.type) {
    case "Header":
      // Header can be updated to accept componentData in future
      return <Header />;
    
    case "HeroSection":
    case "MinimalHeroSection":
      return <HeroSection data={component} />;
    
    case "ProblemSolutionSection":
      return <ProblemSolutionSection data={component} />;
    
    case "ServicesSection":
      return <ServicesSection data={component} />;
    
    case "TestimonialsSection":
    case "Reviews":
      return <TestimonialsSection data={component} />;
    
    case "FAQSection":
      return <FAQSection data={component} />;
    
    case "CTASection":
    case "MinimalNewsletterSection":
      return <CTASection data={component} />;
    
    case "Footer":
      return <Footer />;
    
    default:
      console.warn(`Unknown component type: ${component.type}`);
      return fallback || null;
  }
}

