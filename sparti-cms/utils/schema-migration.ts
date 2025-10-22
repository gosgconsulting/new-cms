// Schema migration utilities for converting old format to new format

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
 * Convert old schema format to new schema format
 */
export function migrateOldSchemaToNew(oldSchema: OldPageSchema): PageSchema {
  console.log('[testing] Migrating old schema to new format...');
  
  const newComponents: ComponentSchema[] = oldSchema.components.map((oldComponent, index) => {
    console.log(`[testing] Migrating component ${index + 1}: ${oldComponent.type}`);
    
    const items: SchemaItem[] = [];
    
    // Extract items from props based on component type
    if (oldComponent.props) {
      // Handle title/heading fields
      if (oldComponent.props.title) {
        items.push({
          type: 'heading',
          value: ensureMultiLanguage(oldComponent.props.title),
          level: 1
        });
      }
      
      // Handle subtitle/description fields
      if (oldComponent.props.subtitle) {
        items.push({
          type: 'text',
          value: ensureMultiLanguage(oldComponent.props.subtitle)
        });
      }
      
      // Handle button text and link
      if (oldComponent.props.buttonText) {
        items.push({
          type: 'button',
          value: ensureMultiLanguage(oldComponent.props.buttonText),
          action: oldComponent.props.buttonLink || '#',
          style: 'primary'
        });
      }
      
      // Handle background image
      if (oldComponent.props.backgroundImage) {
        items.push({
          type: 'image',
          value: oldComponent.props.backgroundImage,
          alt: ensureMultiLanguage(oldComponent.props.title || { en: 'Background', fr: 'Arrière-plan' })
        });
      }
      
      // Handle other text fields
      const textFields = ['description', 'content', 'text'];
      textFields.forEach(field => {
        if (oldComponent.props[field]) {
          items.push({
            type: 'text',
            value: ensureMultiLanguage(oldComponent.props[field])
          });
        }
      });
      
      // Handle array fields (like items in showcase components)
      if (oldComponent.props.items && Array.isArray(oldComponent.props.items)) {
        items.push({
          type: 'array',
          value: oldComponent.props.items,
          itemType: 'showcase-item'
        });
      }
      
      // Handle reviews array
      if (oldComponent.props.reviews && Array.isArray(oldComponent.props.reviews)) {
        items.push({
          type: 'array',
          value: oldComponent.props.reviews,
          itemType: 'review'
        });
      }
      
      // Handle form fields
      if (oldComponent.props.fields && Array.isArray(oldComponent.props.fields)) {
        items.push({
          type: 'array',
          value: oldComponent.props.fields,
          itemType: 'form-field'
        });
      }
      
      // Handle features array
      if (oldComponent.props.features && Array.isArray(oldComponent.props.features)) {
        items.push({
          type: 'array',
          value: oldComponent.props.features,
          itemType: 'feature'
        });
      }
    }
    
    return {
      component: oldComponent.type,
      items
    };
  });
  
  console.log(`[testing] Migration complete: ${newComponents.length} components converted`);
  return { components: newComponents };
}

/**
 * Ensure a value is in multi-language format
 */
function ensureMultiLanguage(value: any): MultiLanguageValue {
  if (typeof value === 'string') {
    return { en: value, fr: value };
  }
  
  if (typeof value === 'object' && value !== null) {
    // If it already has en/fr keys, return as is
    if (value.en !== undefined || value.fr !== undefined) {
      return {
        en: value.en || value.fr || '',
        fr: value.fr || value.en || ''
      };
    }
    
    // If it's an object but not multi-language, convert to string
    return { en: String(value), fr: String(value) };
  }
  
  // Fallback for any other type
  const stringValue = String(value);
  return { en: stringValue, fr: stringValue };
}

/**
 * Validate new schema structure
 */
export function validateNewSchema(schema: PageSchema): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!schema.components || !Array.isArray(schema.components)) {
    errors.push('Schema must have a components array');
    return { isValid: false, errors };
  }
  
  schema.components.forEach((component, componentIndex) => {
    if (!component.component || typeof component.component !== 'string') {
      errors.push(`Component ${componentIndex} must have a valid component name`);
    }
    
    if (!component.items || !Array.isArray(component.items)) {
      errors.push(`Component ${componentIndex} must have an items array`);
      return;
    }
    
    component.items.forEach((item, itemIndex) => {
      if (!item.type || typeof item.type !== 'string') {
        errors.push(`Component ${componentIndex}, item ${itemIndex} must have a valid type`);
      }
      
      if (item.value === undefined || item.value === null) {
        errors.push(`Component ${componentIndex}, item ${itemIndex} must have a value`);
      }
      
      // Validate multi-language items
      if (['heading', 'text', 'button'].includes(item.type)) {
        if (typeof item.value !== 'object' || !item.value.en || !item.value.fr) {
          errors.push(`Component ${componentIndex}, item ${itemIndex} (${item.type}) must have multi-language value with en and fr keys`);
        }
      }
    });
  });
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Migrate a single page's schema
 */
export function migratePageSchema(pageId: string, oldLayoutJson: any): MigrationResult {
  console.log(`[testing] Migrating page ${pageId} schema...`);
  
  const result: MigrationResult = {
    success: false,
    migratedComponents: 0,
    errors: [],
    warnings: []
  };
  
  try {
    // Check if already in new format
    if (oldLayoutJson._version?.version === '2.0') {
      result.warnings.push('Schema already in new format');
      result.success = true;
      return result;
    }
    
    // Convert old format to new format
    const newSchema = migrateOldSchemaToNew(oldLayoutJson);
    
    // Validate the new schema
    const validation = validateNewSchema(newSchema);
    if (!validation.isValid) {
      result.errors.push(...validation.errors);
      return result;
    }
    
    // Add version info
    const schemaWithVersion = {
      ...newSchema,
      _version: {
        version: '2.0' as const,
        migratedAt: new Date().toISOString(),
        migratedFrom: '1.0'
      }
    };
    
    result.migratedComponents = newSchema.components.length;
    result.success = true;
    
    console.log(`[testing] Page ${pageId} migrated successfully: ${result.migratedComponents} components`);
    
    return result;
  } catch (error) {
    console.error(`[testing] Error migrating page ${pageId}:`, error);
    result.errors.push(`Migration failed: ${error.message}`);
    return result;
  }
}

/**
 * Check if schema needs migration
 */
export function needsMigration(layoutJson: any): boolean {
  if (!layoutJson) return false;
  
  // Check if it has the new format indicators
  if (layoutJson._version?.version === '2.0') return false;
  
  // Check if it has the old format indicators
  if (layoutJson.components && Array.isArray(layoutJson.components)) {
    const firstComponent = layoutJson.components[0];
    if (firstComponent && firstComponent.type && firstComponent.props) {
      return true; // Old format
    }
  }
  
  return false;
}

/**
 * Get schema version
 */
export function getSchemaVersion(layoutJson: any): string {
  if (layoutJson._version?.version) {
    return layoutJson._version.version;
  }
  
  if (needsMigration(layoutJson)) {
    return '1.0';
  }
  
  return 'unknown';
}
