// Schema migration utilities for converting old format to v3 format

import { 
  ComponentSchema, 
  PageSchema, 
  SchemaItem, 
  MultiLanguageValue, 
  MigrationResult,
  SchemaVersion
} from '../types/schema.js';

// Old schema format (current MOSKI format)
interface OldComponent {
  type: string;
  props: Record<string, any>;
  wrapper?: Record<string, any>;
}

interface OldPageSchema {
  components: OldComponent[];
}

/**
 * Convert old schema format to v3 schema format
 */
export function migrateOldSchemaToV3(oldSchema: OldPageSchema): PageSchema {
  console.log('[testing] Migrating old schema to v3 format...');
  
  const newComponents: ComponentSchema[] = oldSchema.components.map((oldComponent, index) => {
    console.log(`[testing] Migrating component ${index + 1}: ${oldComponent.type}`);
    
    const items: SchemaItem[] = [];
    
    // Handle different component types
    const componentType = oldComponent.type;
    const componentKey = `component_${index + 1}`;
    
    // Map component types to new format
    let newType = componentType;
    switch (componentType) {
      case 'MinimalHeroSection':
        newType = 'HeroSection';
        break;
      case 'LifestyleShowcase':
        newType = 'Showcase';
        break;
      case 'ProductGridShowcase':
        newType = 'ProductGrid';
        break;
      case 'ReviewsSection':
        newType = 'Reviews';
        break;
      case 'MinimalNewsletterSection':
        newType = 'Newsletter';
        break;
      case 'PageTitle':
        newType = 'FieldGroup';
        break;
      case 'ContactForm':
        newType = 'ContactForm';
        break;
      case 'AboutSection':
        newType = 'FieldGroup';
        break;
    }
    
    // Convert props to items based on component type
    const props = oldComponent.props;
    
    // Convert common props to items
    if (props.title) {
      items.push({
        key: 'title',
        type: 'heading',
        content: ensureMultiLanguage(props.title),
        level: 1
      });
    }
    
    if (props.subtitle) {
      items.push({
        key: 'subtitle',
        type: 'heading',
        content: ensureMultiLanguage(props.subtitle),
        level: 2
      });
    }
    
    if (props.buttonText) {
      items.push({
        key: 'button',
        type: 'button',
        content: ensureMultiLanguage(props.buttonText),
        link: props.buttonLink || '#'
      });
    }
    
    if (props.backgroundImage) {
      items.push({
        key: 'backgroundImage',
        type: 'image',
        src: props.backgroundImage,
        content: ensureMultiLanguage(props.title || { en: 'Background', fr: 'Arrière-plan' })
      });
    }
    
    if (props.showScrollArrow !== undefined) {
      items.push({
        key: 'showScrollArrow',
        type: 'boolean',
        value: props.showScrollArrow
      });
    }
    
    if (props.items && Array.isArray(props.items)) {
      items.push({
        key: 'items',
        type: 'array',
        items: props.items.map((item: any, itemIndex: number) => ({
          key: `item_${itemIndex + 1}`,
          type: 'image' as SchemaItem['type'],
          src: item.image,
          content: ensureMultiLanguage(item.title),
          link: item.link
        }))
      });
    }
    
    if (props.reviews && Array.isArray(props.reviews)) {
      items.push({
        key: 'reviews',
        type: 'array',
        items: props.reviews.map((review: any, reviewIndex: number) => ({
          key: `review_${reviewIndex + 1}`,
          type: 'review' as SchemaItem['type'],
          props: {
            name: review.name,
            rating: review.rating,
            content: ensureMultiLanguage(review.text),
            avatar: review.avatar
          }
        }))
      });
    }
    
    if (props.features && Array.isArray(props.features)) {
      items.push({
        key: 'features',
        type: 'array',
        items: props.features.map((feature: any, featureIndex: number) => ({
          key: `feature_${featureIndex + 1}`,
          type: 'feature' as SchemaItem['type'],
          props: {
            icon: feature.icon,
            title: ensureMultiLanguage(feature.title),
            description: ensureMultiLanguage(feature.description)
          }
        }))
      });
    }
    
    if (props.content) {
      items.push({
        key: 'content',
        type: 'text',
        content: ensureMultiLanguage(props.content)
      });
    }
    
    if (props.image) {
      items.push({
        key: 'image',
        type: 'image',
        src: props.image,
        content: ensureMultiLanguage(props.title || { en: 'Image', fr: 'Image' })
      });
    }
    
    if (props.placeholder) {
      items.push({
        key: 'placeholder',
        type: 'text',
        content: ensureMultiLanguage(props.placeholder)
      });
    }
    
    if (props.fields && Array.isArray(props.fields)) {
      items.push({
        key: 'fields',
        type: 'array',
        items: props.fields.map((field: any, fieldIndex: number) => ({
          key: `field_${fieldIndex + 1}`,
          type: field.type === 'textarea' ? 'textarea' as SchemaItem['type'] : 'input' as SchemaItem['type'],
          content: ensureMultiLanguage(field.label),
          required: field.required || false
        }))
      });
    }
    
    return {
      key: componentKey,
      type: newType,
      items
    };
  });
  
  return {
    components: newComponents,
    _version: {
      version: '3.0',
      migratedAt: new Date().toISOString(),
      migratedFrom: '1.0'
    }
  };
}

/**
 * Ensures a value is in MultiLanguageValue format
 */
function ensureMultiLanguage(value: string | MultiLanguageValue): MultiLanguageValue {
  if (typeof value === 'string') {
    return { en: value, fr: value };
  }
  return value;
}

/**
 * Checks if a schema needs migration to v3 format
 */
export function needsV3Migration(schema: any): boolean {
  if (!schema || !schema.components || !Array.isArray(schema.components)) {
    return false;
  }
  
  // Check if it's already v3 format (has key field on components)
  if (schema.components.length > 0 && schema.components[0].key) {
    return false;
  }
  
  // Check if it's old format (has type field without key)
  if (schema.components.length > 0 && schema.components[0].type && !schema.components[0].key) {
    return true;
  }
  
  return false;
}

/**
 * Gets the schema version
 */
export function getSchemaVersion(schema: any): string {
  if (schema && schema._version && schema._version.version) {
    return schema._version.version;
  }
  
  if (needsV3Migration(schema)) {
    return '1.0';
  }
  
  return '3.0';
}