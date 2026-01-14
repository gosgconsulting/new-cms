// Schema validation utilities for the new schema structure

import { 
  SchemaItem, 
  PageSchema,
  ComponentSchema 
} from '../types/schema';

// Local validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Local multi-language value type (kept for potential future use)
type MultiLanguageValue = { en: string; fr: string };

/**
 * Validate a single item type (aligned to SchemaItem)
 */
export function validateItemType(item: SchemaItem): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!item.type) {
    errors.push('Item must have a type');
    return { isValid: false, errors, warnings };
  }

  // Validate common fields based on type
  switch (item.type) {
    case 'heading':
      if (!item.content || typeof item.content !== 'string') {
        errors.push('Heading must have text content');
      }
      if (item.level && (item.level < 1 || item.level > 6)) {
        errors.push('Heading level must be between 1 and 6');
      }
      break;

    case 'text':
    case 'textarea':
      if (item.content !== undefined && typeof item.content !== 'string') {
        errors.push('Text content must be a string');
      }
      break;

    case 'image':
      if (!item.src || typeof item.src !== 'string') {
        errors.push('Image must have a valid src URL');
      }
      if (item.alt && typeof item.alt !== 'string') {
        warnings.push('Image alt should be a string');
      }
      break;

    case 'link':
      if (!item.link || typeof item.link !== 'string') {
        errors.push('Link must have a valid href string');
      }
      if (item.label && typeof item.label !== 'string') {
        warnings.push('Link label should be a string');
      }
      break;

    case 'button':
      if (item.buttonText && typeof item.buttonText !== 'string') {
        warnings.push('Button text should be a string');
      }
      if (item.link && typeof item.link !== 'string') {
        errors.push('Button must have a valid action URL (link)');
      }
      break;

    case 'array':
      if (!Array.isArray(item.items)) {
        errors.push('Array item must have an items array');
      }
      break;

    default:
      // Allow other types without strict validation
      break;
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate a component schema (aligned to ComponentSchema)
 */
export function validateComponentSchema(component: ComponentSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!component.type || typeof component.type !== 'string') {
    errors.push('Component must have a valid type');
    return { isValid: false, errors, warnings };
  }

  if (!component.items || !Array.isArray(component.items)) {
    errors.push('Component must have an items array');
    return { isValid: false, errors, warnings };
  }

  if (component.items.length === 0) {
    warnings.push('Component has no items');
  }

  component.items.forEach((item, index) => {
    const res = validateItemType(item);
    if (!res.isValid) errors.push(`Item ${index}: ${res.errors.join(', ')}`);
    warnings.push(...res.warnings.map(w => `Item ${index}: ${w}`));
  });

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate a complete page schema
 */
export function validatePageSchema(schema: PageSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema.components || !Array.isArray(schema.components)) {
    errors.push('Schema must have a components array');
    return { isValid: false, errors, warnings };
  }

  if (schema.components.length === 0) {
    warnings.push('Page has no components');
  }

  schema.components.forEach((component, index) => {
    const res = validateComponentSchema(component);
    if (!res.isValid) errors.push(`Component ${index}: ${res.errors.join(', ')}`);
    warnings.push(...res.warnings.map(w => `Component ${index}: ${w}`));
  });

  // Check for duplicate component types
  const componentTypes = schema.components.map(c => c.type);
  const unique = new Set(componentTypes);
  if (componentTypes.length !== unique.size) {
    warnings.push('Some components have duplicate types');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate schema for specific requirements
 */
export function validateSchemaRequirements(schema: PageSchema, requirements: {
  minComponents?: number;
  maxComponents?: number;
  requiredComponents?: string[];
  allowedItemTypes?: string[];
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (requirements.minComponents && schema.components.length < requirements.minComponents) {
    errors.push(`Page must have at least ${requirements.minComponents} components`);
  }

  if (requirements.maxComponents && schema.components.length > requirements.maxComponents) {
    errors.push(`Page must have at most ${requirements.maxComponents} components`);
  }

  if (requirements.requiredComponents) {
    const componentTypes = schema.components.map(c => c.type);
    const missing = requirements.requiredComponents.filter(req => !componentTypes.includes(req));
    if (missing.length > 0) {
      errors.push(`Missing required components: ${missing.join(', ')}`);
    }
  }

  if (requirements.allowedItemTypes) {
    const allItemTypes = schema.components.flatMap(c => c.items.map(i => i.type));
    const invalid = allItemTypes.filter(t => !requirements.allowedItemTypes!.includes(t));
    if (invalid.length > 0) {
      errors.push(`Invalid item types found: ${[...new Set(invalid)].join(', ')}`);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Get validation summary for a schema
 */
export function getValidationSummary(schema: PageSchema): {
  totalComponents: number;
  totalItems: number;
  itemTypeCounts: Record<string, number>;
  hasErrors: boolean;
  hasWarnings: boolean;
} {
  const validation = validatePageSchema(schema);
  const totalItems = schema.components.reduce((sum, c) => sum + c.items.length, 0);

  const itemTypeCounts: Record<string, number> = {};
  schema.components.forEach(component => {
    component.items.forEach(item => {
      itemTypeCounts[item.type] = (itemTypeCounts[item.type] || 0) + 1;
    });
  });

  return {
    totalComponents: schema.components.length,
    totalItems,
    itemTypeCounts,
    hasErrors: validation.errors.length > 0,
    hasWarnings: validation.warnings.length > 0
  };
}