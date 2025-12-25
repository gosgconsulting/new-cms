"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";

// Static import fallback for Vite/ESM so registry is always available at runtime
import { componentRegistry as gosgRegistry } from "../../../sparti-cms/theme/gosgconsulting/components/registry";

// Try to import registry - will be null if import fails
let componentRegistryModule: any = null;
let registryImportError: Error | null = null;

try {
  // Use require for dynamic loading (may fail under ESM, so we also have static import above)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  componentRegistryModule = require("../../../sparti-cms/theme/gosgconsulting/components/registry");
} catch (error) {
  registryImportError = error instanceof Error ? error : new Error(String(error));
  console.warn('[testing] Dynamic require for registry failed; using static import fallback.');
}

// Get component registry safely
function getComponentRegistry(): Record<string, React.ComponentType<any>> {
  // Return empty during SSR
  if (typeof window === 'undefined') {
    return {};
  }

  // Use dynamic require result if available
  if (!registryImportError && componentRegistryModule?.componentRegistry) {
    return componentRegistryModule.componentRegistry;
  }

  // Fallback to static import (always present with Vite)
  if (gosgRegistry && typeof gosgRegistry === 'object') {
    return gosgRegistry as unknown as Record<string, React.ComponentType<any>>;
  }

  console.warn('[testing] Component registry is unavailable');
  return {};
}

interface VisualEditorRendererProps {
  components: ComponentSchema[];
  compact?: boolean;
  registry?: Record<string, React.ComponentType<any>>; // NEW: inject theme-aware registry
}

/**
 * Maps component type from JSON schema to registry component name
 * Handles various naming conventions and aliases
 */
function mapComponentType(type: string): string | null {
  if (!type) return null;

  const registry = getComponentRegistry();

  // Direct match
  if (type in registry) {
    return type;
  }

  // Try PascalCase conversion from kebab-case or snake_case
  const pascalCase = type
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  if (pascalCase in registry) {
    return pascalCase;
  }

  // Try converting camelCase to PascalCase (e.g., "servicesSection" -> "ServicesSection")
  // Check if it's camelCase (starts with lowercase, has uppercase in middle)
  if (/^[a-z]/.test(type) && /[A-Z]/.test(type)) {
    const pascalFromCamel = type.charAt(0).toUpperCase() + type.slice(1);
    if (pascalFromCamel in registry) {
      return pascalFromCamel;
    }
  }

  // Try common aliases and variations
  const aliases: Record<string, string> = {
    'hero-section': 'HeroSection',
    'herosection': 'HeroSection',
    'heroSection': 'HeroSection',
    'HeroSection': 'HeroSection',
    'HeroSectionSimple': 'HeroSectionSimple',
    'hero-section-simple': 'HeroSectionSimple',
    'simple-hero-banner': 'SimpleHeroBanner',
    'SimpleHeroBanner': 'SimpleHeroBanner',
    'content-section': 'ContentSection',
    'contentSection': 'ContentSection',
    'page-title': 'PageTitle',
    'pageTitle': 'PageTitle',
    'product-grid': 'ProductGrid',
    'productGrid': 'ProductGrid',
    'services-grid': 'ServicesGrid',
    'servicesGrid': 'ServicesGrid',
    'services-section': 'ServicesSection',
    'servicessection': 'ServicesSection',
    'servicesSection': 'ServicesSection',
    'ServicesSection': 'ServicesSection',
    'services-showcase': 'ServicesShowcase',
    'servicesShowcase': 'ServicesShowcase',
    'testimonials-section': 'TestimonialsSection',
    'testimonialssection': 'TestimonialsSection',
    'testimonialsSection': 'TestimonialsSection',
    'gallery-section': 'GallerySection',
    'gallerysection': 'GallerySection',
    'gallerySection': 'GallerySection',
    'image-gallery': 'ImageGallery',
    'imageGallery': 'ImageGallery',
    'faq-section': 'FAQSection',
    'faqsection': 'FAQSection',
    'faqSection': 'FAQSection',
    'f-a-q-section': 'FAQSection',
    'f-a-q-accordion': 'FAQAccordion',
    'faq-accordion': 'FAQAccordion',
    'about-section': 'AboutSection',
    'aboutsection': 'AboutSection',
    'aboutSection': 'AboutSection',
    'AboutSection': 'AboutSection',
    'team-section': 'TeamSection',
    'teamsection': 'TeamSection',
    'teamSection': 'TeamSection',
    'TeamSection': 'TeamSection',
    'features-section': 'FeaturesSection',
    'featuressection': 'FeaturesSection',
    'featuresSection': 'FeaturesSection',
    'FeaturesSection': 'FeaturesSection',
    'why-choose-us-section': 'WhyChooseUsSection',
    'whyChooseUsSection': 'WhyChooseUsSection',
    'whats-included-section': 'WhatsIncludedSection',
    'whatsIncludedSection': 'WhatsIncludedSection',
    'contact-info': 'ContactInfo',
    'contactInfo': 'ContactInfo',
    'contact-form': 'ContactForm',
    'contactForm': 'ContactForm',
    'cta-section': 'CTASection',
    'c-t-a-section': 'CTASection',
    'ctaSection': 'CTASection',
    'newsletter': 'Newsletter',
    'social-media': 'SocialMedia',
    'socialMedia': 'SocialMedia',
    'video-section': 'VideoSection',
    'videoSection': 'VideoSection',
    's-e-o': 'SEO',
    'seo': 'SEO',
    's-e-o-explanation': 'SEOExplanation',
    'seo-explanation': 'SEOExplanation',
    'results-section': 'ResultsSection',
    'resultsSection': 'ResultsSection',
    'pain-point-section': 'PainPointSection',
    'painPointSection': 'PainPointSection',
    'ingredients-section': 'IngredientsSection',
    'ingredientssection': 'IngredientsSection',
    'ingredientsSection': 'IngredientsSection',
    'IngredientsSection': 'IngredientsSection',
  };

  // Normalize the input type for comparison (remove dashes, underscores, spaces, convert to lowercase)
  const normalized = type.toLowerCase().replace(/[_\s-]/g, '');
  
  // Check aliases - compare normalized versions
  for (const [alias, mappedType] of Object.entries(aliases)) {
    const normalizedAlias = alias.toLowerCase().replace(/[_\s-]/g, '');
    // Match if normalized versions are equal OR exact match
    if (normalized === normalizedAlias || type === alias || type === mappedType) {
      if (mappedType in registry) {
        return mappedType;
      }
    }
  }

  // If registry is empty, log warning
  if (Object.keys(registry).length === 0) {
    console.warn('[testing] Component registry is empty. Cannot map component type:', type);
  }

  return null;
}

/**
 * Transforms component props from JSON schema format to component props format
 * Handles common property name mappings
 */
function transformProps(component: ComponentSchema, componentType: string): Record<string, any> {
  const props: Record<string, any> = {};

  // If component has direct props, use them
  if ((component as any).props && typeof (component as any).props === 'object') {
    const jsonProps = (component as any).props;
    
    // Common property mappings
    const propMappings: Record<string, string> = {
      'image': 'imageSrc',
      'imageUrl': 'imageSrc',
      'imageSrc': 'imageSrc',
      'img': 'imageSrc',
      'backgroundImage': 'backgroundImage',
      'bgImage': 'backgroundImage',
      'title': 'title',
      'heading': 'title',
      'headline': 'title',
      'description': 'description',
      'text': 'description',
      'content': 'description',
      'subtitle': 'subtitle',
      'buttonText': 'buttonText',
      'ctaText': 'buttonText',
      'buttonUrl': 'buttonUrl',
      'ctaUrl': 'buttonUrl',
      'link': 'buttonUrl',
      'href': 'buttonUrl',
    };

    // Map props and also keep original keys
    for (const [key, value] of Object.entries(jsonProps)) {
      const mappedKey = propMappings[key] || key;
      props[mappedKey] = value;
      // Also keep original key if different from mapped key
      if (mappedKey !== key && !(key in props)) {
        props[key] = value;
      }
    }
  }

  // Always include items if present (for schema-based components)
  if (component.items && Array.isArray(component.items)) {
    props.items = component.items;
    // Also pass as itemsSchema for components that use that prop name
    props.itemsSchema = component.items;
  }

  return props;
}

/**
 * VisualEditorRenderer
 * 
 * Renders components using the theme component registry
 * Supports both props-based and items-based (schema) components
 */
const VisualEditorRenderer: React.FC<VisualEditorRendererProps> = ({ components, compact = false, registry: injectedRegistry }) => {
  // Memoize registry to avoid re-computing
  const registry = useMemo(() => {
    if (injectedRegistry && typeof injectedRegistry === 'object' && Object.keys(injectedRegistry).length > 0) {
      return injectedRegistry;
    }
    const reg = getComponentRegistry();
    if (typeof window !== 'undefined') {
      console.log('[testing] Component registry loaded with', Object.keys(reg).length, 'components');
      if (Object.keys(reg).length > 0) {
        console.log('[testing] Available components:', Object.keys(reg).slice(0, 10).join(', '), '...');
      }
    }
    return reg;
  }, [injectedRegistry]);

  if (!components || components.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No components to render
      </div>
    );
  }

  // If registry is empty, show warning but don't crash
  if (Object.keys(registry).length === 0 && typeof window !== 'undefined') {
    console.warn('[testing] Component registry is empty - components may not render correctly');
    console.warn('[testing] Registry import error:', registryImportError);
    console.warn('[testing] Registry module:', componentRegistryModule);
  }

  return (
    <div className={`w-full ${compact ? 'space-y-4' : 'space-y-0'}`}>
      {components.map((component, index) => {
        try {
          const componentType = mapComponentType(component.type || '');

          if (!componentType) {
            // Log debug info for unknown components
            if (typeof window !== 'undefined') {
              console.warn('[testing] Failed to map component type:', component.type);
              console.warn('[testing] Available registry keys:', Object.keys(registry).slice(0, 20));
            }
            
            return (
              <div
                key={component.key || `component-${index}`}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-yellow-800">Unknown Component</span>
                  <span className="text-xs text-yellow-600">({component.type || 'unknown'})</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Component type "{component.type || 'unknown'}" not found in registry. Please ensure the component is implemented and registered.
                </p>
                {component.items && component.items.length > 0 && (
                  <div className="mt-2 text-xs text-yellow-600">
                    Component has {component.items.length} item(s) that could not be rendered.
                  </div>
                )}
              </div>
            );
          }

          const Component = registry[componentType];
          if (!Component) {
            return (
              <div
                key={component.key || `component-${index}`}
                className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4"
              >
                <div className="text-xs font-semibold text-red-800">
                  Component "{componentType}" not found in registry
                </div>
              </div>
            );
          }

          // Transform props
          const componentProps = transformProps(component, componentType);

          // Always include items if present (for schema-based components)
          if (component.items && Array.isArray(component.items)) {
            componentProps.items = component.items;
            // Also pass as itemsSchema for components that use that prop name
            componentProps.itemsSchema = component.items;
          }

          // Add compact mode if component supports it
          if (compact) {
            componentProps.compact = true;
          }

          // Render component with error boundary
          return (
            <ErrorBoundary
              key={component.key || `component-${index}`}
              componentType={componentType}
              compact={compact}
            >
              <Component {...componentProps} />
            </ErrorBoundary>
          );
        } catch (error) {
          console.error(`[testing] Error processing component ${index}:`, error);
          return (
            <div
              key={component.key || `component-${index}`}
              className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4"
            >
              <div className="text-xs font-semibold text-red-800">
                Error processing component
              </div>
              <div className="text-xs text-red-600 mt-1">
                {error instanceof Error ? error.message : String(error)}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

/**
 * Error Boundary for individual components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; componentType: string; compact?: boolean },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; componentType: string; compact?: boolean }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[testing] Error rendering component ${this.props.componentType}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`p-4 bg-red-50 border border-red-200 rounded-lg mb-4 ${this.props.compact ? 'border rounded-lg overflow-hidden' : ''}`}>
          <div className="text-xs font-semibold text-red-800">
            Error rendering {this.props.componentType}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {this.state.error?.message || 'Unknown error occurred'}
          </div>
        </div>
      );
    }

    return (
      <div className={this.props.compact ? 'border rounded-lg overflow-hidden' : ''}>
        {this.props.children}
      </div>
    );
  }
}

export default VisualEditorRenderer;