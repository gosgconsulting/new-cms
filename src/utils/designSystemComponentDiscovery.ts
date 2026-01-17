import type { DesignSystemComponent } from "../config/designSystemMetadata";
import type { ComponentSchema } from "../../sparti-cms/types/schema";
import { extractComponentName, generateSampleSchema } from "./designSystemDiscovery";

/**
 * Discover FlyonUI components from CSS files
 */
export function discoverFlyonUIComponents(): DesignSystemComponent[] {
  // FlyonUI has CSS component files in src/components/
  // Common components we'll create: hero, header, footer, features, cards, cta, faq, testimonials, services, about
  const componentNames = [
    "HeroSection",
    "Header",
    "Footer",
    "FeaturesSection",
    "CardSection",
    "CTASection",
    "FAQSection",
    "TestimonialsSection",
    "ServicesSection",
    "AboutSection",
  ];

  return componentNames.map((name) => {
    const id = `flyonui-${name.toLowerCase().replace("section", "")}`;
    const componentType = `flyonui-${name.toLowerCase().replace("section", "")}`;
    const sampleSchema = generateSampleSchema(name, id, componentType);
    return {
      id,
      name,
      description: `${name} component for FlyonUI design system`,
      sampleSchema,
      componentFile: `flyonui/components/FlyonUI${name}.tsx`,
    };
  });
}

/**
 * Discover HyperUI components from MDX files
 */
export function discoverHyperUIComponents(): DesignSystemComponent[] {
  // HyperUI has components in marketing and application collections
  // Focus on marketing components for page sections
  const componentNames = [
    "HeroSection",
    "Header",
    "Footer",
    "FeaturesSection",
    "CardSection",
    "CTASection",
    "FAQSection",
    "TestimonialsSection",
    "ServicesSection",
    "AboutSection",
  ];

  return componentNames.map((name) => {
    const id = `hyperui-${name.toLowerCase().replace("section", "")}`;
    const componentType = `hyperui-${name.toLowerCase().replace("section", "")}`;
    const sampleSchema = generateSampleSchema(name, id, componentType);
    return {
      id,
      name,
      description: `${name} component for HyperUI design system`,
      sampleSchema,
      componentFile: `hyperui/components/HyperUI${name}.tsx`,
    };
  });
}

/**
 * Discover Preline components from plugins
 */
export function discoverPrelineComponents(): DesignSystemComponent[] {
  // Preline has plugins, but for page sections we'll create common components
  const componentNames = [
    "HeroSection",
    "Header",
    "Footer",
    "FeaturesSection",
    "CardSection",
    "CTASection",
    "FAQSection",
    "TestimonialsSection",
    "ServicesSection",
    "AboutSection",
  ];

  return componentNames.map((name) => {
    const id = `preline-${name.toLowerCase().replace("section", "")}`;
    const componentType = `preline-${name.toLowerCase().replace("section", "")}`;
    const sampleSchema = generateSampleSchema(name, id, componentType);
    return {
      id,
      name,
      description: `${name} component for Preline design system`,
      sampleSchema,
      componentFile: `preline/components/Preline${name}.tsx`,
    };
  });
}

/**
 * Discover Tailgrids components from registry
 */
export function discoverTailgridsComponents(): DesignSystemComponent[] {
  // Tailgrids has React components in registry/core/
  // For page sections, we'll create common components
  const componentNames = [
    "HeroSection",
    "Header",
    "Footer",
    "FeaturesSection",
    "CardSection",
    "CTASection",
    "FAQSection",
    "TestimonialsSection",
    "ServicesSection",
    "AboutSection",
  ];

  return componentNames.map((name) => {
    const id = `tailgrids-${name.toLowerCase().replace("section", "")}`;
    const componentType = `tailgrids-${name.toLowerCase().replace("section", "")}`;
    const sampleSchema = generateSampleSchema(name, id, componentType);
    return {
      id,
      name,
      description: `${name} component for Tailgrids design system`,
      sampleSchema,
      componentFile: `tailgrids/components/Tailgrids${name}.tsx`,
    };
  });
}

/**
 * Discover UI Main components from registry
 */
export function discoverUIMainComponents(): DesignSystemComponent[] {
  // UI Main has a complex registry system
  // For page sections, we'll create common components
  const componentNames = [
    "HeroSection",
    "Header",
    "Footer",
    "FeaturesSection",
    "CardSection",
    "CTASection",
    "FAQSection",
    "TestimonialsSection",
    "ServicesSection",
    "AboutSection",
  ];

  return componentNames.map((name) => {
    const id = `ui-main-${name.toLowerCase().replace("section", "")}`;
    const componentType = `ui-main-${name.toLowerCase().replace("section", "")}`;
    const sampleSchema = generateSampleSchema(name, id, componentType);
    return {
      id,
      name,
      description: `${name} component for UI Main design system`,
      sampleSchema,
      componentFile: `ui-main/components/UIMain${name}.tsx`,
    };
  });
}
