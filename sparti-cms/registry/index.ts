import { ComponentDefinition, RegistryConfig } from './types';
import { syncFromDatabase, syncToDatabase } from './sync';

// Import GO SG component definitions from landing page
import headerComponent from './components/header.json';
import footerComponent from './components/footer.json';
import heroComponent from './components/hero.json';
import clientLogosComponent from './components/client-logos.json';
import painPointsComponent from './components/pain-points.json';
import seoResultsComponent from './components/seo-results.json';
import servicesComponent from './components/services.json';
import whatIsSEOComponent from './components/what-is-seo.json';
import testimonialsComponent from './components/testimonials.json';
import faqComponent from './components/faq.json';
import blogPreviewComponent from './components/blog-preview.json';
import whatsappButtonComponent from './components/whatsapp-button.json';
import contactModalComponent from './components/contact-modal.json';

// Import new schema editor components
import richTextComponent from './components/rich-text.json';
import imageGalleryComponent from './components/image-gallery.json';
import backgroundImageComponent from './components/background-image.json';

// Import auto-generated components
import aboutSectionComponent from './components/about-section.json';
import accordionComponent from './components/accordion.json';
import arrayComponent from './components/array.json';
import blogSectionComponent from './components/blog-section.json';
import cTASectionComponent from './components/c-t-a-section.json';
import contactFormComponent from './components/contact-form.json';
import contactInfoComponent from './components/contact-info.json';
import contentImageSectionComponent from './components/content-image-section.json';
import contentSectionComponent from './components/content-section.json';
import contentComponent from './components/content.json';
import ctaSectionComponent from './components/cta-section.json';
import fAQAccordionComponent from './components/f-a-q-accordion.json';
import fAQSectionComponent from './components/f-a-q-section.json';
import faqSectionComponent from './components/faq-section.json';
import featuresSectionComponent from './components/features-section.json';
import gallerySectionComponent from './components/gallery-section.json';
import heroSectionSimpleComponent from './components/hero-section-simple.json';
import heroSectionComponent from './components/hero-section.json';
import imageContentSectionComponent from './components/image-content-section.json';
import ingredientsSectionComponent from './components/ingredients-section.json';
import newsletterComponent from './components/newsletter.json';
import pageTitleComponent from './components/page-title.json';
import painPointSectionComponent from './components/pain-point-section.json';
import productGridComponent from './components/product-grid.json';
import resultsSectionComponent from './components/results-section.json';
import reviewsComponent from './components/reviews.json';
import sEOExplanationComponent from './components/s-e-o-explanation.json';
import sEOComponent from './components/s-e-o.json';
import servicesGridComponent from './components/services-grid.json';
import servicesSectionComponent from './components/services-section.json';
import servicesShowcaseComponent from './components/services-showcase.json';
import showcaseComponent from './components/showcase.json';
import simpleHeaderComponent from './components/simple-header.json';
import simpleHeroBannerComponent from './components/simple-hero-banner.json';
import socialMediaComponent from './components/social-media.json';
import teamSectionComponent from './components/team-section.json';
import testimonialsSectionComponent from './components/testimonials-section.json';
import videoSectionComponent from './components/video-section.json';
import whatIsSeoComponent from './components/what-is-seo.json';
import whatsIncludedSectionComponent from './components/whats-included-section.json';
import whyChooseUsSectionComponent from './components/why-choose-us-section.json';

// Import Flowbite blog components
import flowbiteBlogHeroComponent from './components/flowbite-blog-hero.json';
import flowbiteBlogGridComponent from './components/flowbite-blog-grid.json';
import flowbiteBlogSidebarComponent from './components/flowbite-blog-sidebar.json';

// Import Flowbite homepage components
import flowbitePainPointSectionComponent from './components/flowbite-pain-point-section.json';
import flowbiteSEOResultsSectionComponent from './components/flowbite-seo-results-section.json';
import flowbiteWhatIsSEOSectionComponent from './components/flowbite-what-is-seo-section.json';
import flowbiteTestimonialsSectionComponent from './components/flowbite-testimonials-section.json';
import flowbiteFAQSectionComponent from './components/flowbite-faq-section.json';
import flowbiteNewsletterComponent from './components/flowbite-newsletter.json';
import flowbitePageTitleComponent from './components/flowbite-page-title.json';
import flowbiteContentComponent from './components/flowbite-content.json';

class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, ComponentDefinition> = new Map();
  // Initialization flag removed as it's handled in constructor

  private constructor() {
    this.loadLocalComponents();
  }

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  private loadLocalComponents(): void {
    // Load GO SG landing page components
    const gosgComponents = [
      // Layout Components
      headerComponent as ComponentDefinition,
      footerComponent as ComponentDefinition,
      
      // Hero Section Components
      heroComponent as ComponentDefinition,
      clientLogosComponent as ComponentDefinition,
      
      // Content Section Components
      painPointsComponent as ComponentDefinition,
      seoResultsComponent as ComponentDefinition,
      servicesComponent as ComponentDefinition,
      whatIsSEOComponent as ComponentDefinition,
      testimonialsComponent as ComponentDefinition,
      
      // Interactive Components
      faqComponent as ComponentDefinition,
      blogPreviewComponent as ComponentDefinition,
      
      // Utility Components
      whatsappButtonComponent as ComponentDefinition,
      contactModalComponent as ComponentDefinition,

      // New Schema Editor Components
      richTextComponent as ComponentDefinition,
      imageGalleryComponent as ComponentDefinition,
      backgroundImageComponent as ComponentDefinition,
    
      // Auto-generated components
      aboutSectionComponent as ComponentDefinition,
      accordionComponent as ComponentDefinition,
      arrayComponent as ComponentDefinition,
      blogSectionComponent as ComponentDefinition,
      cTASectionComponent as ComponentDefinition,
      contactFormComponent as ComponentDefinition,
      contactInfoComponent as ComponentDefinition,
      contentImageSectionComponent as unknown as ComponentDefinition,
      contentSectionComponent as ComponentDefinition,
      contentComponent as ComponentDefinition,
      ctaSectionComponent as ComponentDefinition,
      fAQAccordionComponent as ComponentDefinition,
      fAQSectionComponent as ComponentDefinition,
      faqSectionComponent as ComponentDefinition,
      featuresSectionComponent as ComponentDefinition,
      gallerySectionComponent as ComponentDefinition,
      heroSectionSimpleComponent as ComponentDefinition,
      heroSectionComponent as ComponentDefinition,
      imageContentSectionComponent as unknown as ComponentDefinition,
      ingredientsSectionComponent as ComponentDefinition,
      newsletterComponent as ComponentDefinition,
      pageTitleComponent as ComponentDefinition,
      painPointSectionComponent as ComponentDefinition,
      productGridComponent as ComponentDefinition,
      resultsSectionComponent as ComponentDefinition,
      reviewsComponent as ComponentDefinition,
      sEOExplanationComponent as ComponentDefinition,
      sEOComponent as ComponentDefinition,
      servicesGridComponent as ComponentDefinition,
      servicesSectionComponent as ComponentDefinition,
      servicesShowcaseComponent as ComponentDefinition,
      showcaseComponent as ComponentDefinition,
      simpleHeaderComponent as ComponentDefinition,
      simpleHeroBannerComponent as ComponentDefinition,
      socialMediaComponent as ComponentDefinition,
      teamSectionComponent as ComponentDefinition,
      testimonialsSectionComponent as ComponentDefinition,
      videoSectionComponent as ComponentDefinition,
      whatIsSeoComponent as ComponentDefinition,
      whatsIncludedSectionComponent as ComponentDefinition,
      whyChooseUsSectionComponent as ComponentDefinition,
      // Flowbite blog components
      flowbiteBlogHeroComponent as ComponentDefinition,
      flowbiteBlogGridComponent as ComponentDefinition,
      flowbiteBlogSidebarComponent as ComponentDefinition,
      // Flowbite homepage components
      flowbitePainPointSectionComponent as ComponentDefinition,
      flowbiteSEOResultsSectionComponent as ComponentDefinition,
      flowbiteWhatIsSEOSectionComponent as ComponentDefinition,
      flowbiteTestimonialsSectionComponent as ComponentDefinition,
      flowbiteFAQSectionComponent as ComponentDefinition,
      // Flowbite Moski components
      flowbiteNewsletterComponent as ComponentDefinition,
      flowbitePageTitleComponent as ComponentDefinition,
      flowbiteContentComponent as ComponentDefinition,
    ];

    gosgComponents.forEach(component => {
      this.components.set(component.id, component);
    });

    // Components loaded successfully
  }

  /**
   * Get all registered components
   */
  public getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * Get component by ID
   */
  public get(id: string): ComponentDefinition | undefined {
    return this.components.get(id);
  }

  /**
   * Get components by type
   */
  public getByType(type: ComponentDefinition['type']): ComponentDefinition[] {
    return this.getAll().filter(component => component.type === type);
  }

  /**
   * Get components by category
   */
  public getByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return this.getAll().filter(component => component.category === category);
  }

  /**
   * Get components by tags
   */
  public getByTags(tags: string[]): ComponentDefinition[] {
    return this.getAll().filter(component => 
      component.tags && tags.some(tag => component.tags!.includes(tag))
    );
  }

  /**
   * Register a new component
   */
  public register(component: ComponentDefinition): void {
    this.validateComponent(component);
    this.components.set(component.id, component);
  }

  /**
   * Unregister a component
   */
  public unregister(id: string): boolean {
    return this.components.delete(id);
  }

  /**
   * Check if component exists
   */
  public has(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Get component editor
   */
  public getEditor(id: string): string | undefined {
    const component = this.get(id);
    return component?.editor;
  }

  /**
   * Search components by name or description
   */
  public search(query: string): ComponentDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(component => 
      component.name.toLowerCase().includes(lowerQuery) ||
      (component.description && component.description.toLowerCase().includes(lowerQuery)) ||
      (component.tags && component.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  /**
   * Sync with database
   */
  public async syncFromDatabase(tenantId: string): Promise<void> {
    const result = await syncFromDatabase(tenantId);
    
    // Update local registry with database components
    result.added.forEach(component => this.register(component));
    result.updated.forEach(component => this.register(component));
    result.removed.forEach(id => this.unregister(id));
  }

  /**
   * Push local components to database
   */
  public async syncToDatabase(tenantId: string): Promise<void> {
    await syncToDatabase(tenantId, this.getAll());
  }

  /**
   * Validate component definition
   */
  private validateComponent(component: ComponentDefinition): void {
    if (!component.id || typeof component.id !== 'string') {
      throw new Error('Component must have a valid id');
    }
    
    if (!component.name || typeof component.name !== 'string') {
      throw new Error('Component must have a valid name');
    }
    
    if (!component.type) {
      throw new Error('Component must have a valid type');
    }
    
    if (!component.editor) {
      throw new Error('Component must specify an editor');
    }
    
    if (!component.version || !/^\d+\.\d+\.\d+$/.test(component.version)) {
      throw new Error('Component must have a valid semantic version');
    }
  }

  /**
   * Export registry configuration
   */
  public export(): RegistryConfig {
    return {
      version: '1.0.0',
      last_sync: new Date().toISOString(),
      components: this.getAll()
    };
  }

  /**
   * Import registry configuration
   */
  public import(config: RegistryConfig): void {
    this.components.clear();
    config.components.forEach(component => {
      this.register(component);
    });
  }
}

// Export singleton instance
export const componentRegistry = ComponentRegistry.getInstance();

// Export class for testing
export { ComponentRegistry };

// Export types
export * from './types';