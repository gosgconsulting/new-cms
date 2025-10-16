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
import testimonialsComponent from './components/testimonials.json';
import faqComponent from './components/faq.json';
import blogPreviewComponent from './components/blog-preview.json';
import whatsappButtonComponent from './components/whatsapp-button.json';
import contactModalComponent from './components/contact-modal.json';

// Import new schema editor components
import richTextComponent from './components/rich-text.json';
import imageGalleryComponent from './components/image-gallery.json';
import backgroundImageComponent from './components/background-image.json';

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