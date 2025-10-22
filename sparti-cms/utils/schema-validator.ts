// Schema validation utilities for the new schema structure

import { 
  SchemaItem, 
  MultiLanguageValue, 
  ValidationResult,
  PageSchema,
  ComponentSchema 
} from '../types/schema.js';

/**
 * Validate a single item type
 */
export function validateItemType(item: SchemaItem): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!item.type) {
    errors.push('Item must have a type');
    return { isValid: false, errors, warnings };
  }
  
  if (item.value === undefined || item.value === null) {
    errors.push('Item must have a value');
    return { isValid: false, errors, warnings };
  }
  
  // Validate based on item type
  switch (item.type) {
    case 'heading':
      if (!isValidMultiLanguageValue(item.value)) {
        errors.push('Heading item must have valid multi-language value');
      }
      if (item.level && (item.level < 1 || item.level > 6)) {
        errors.push('Heading level must be between 1 and 6');
      }
      break;
      
    case 'text':
      if (!isValidMultiLanguageValue(item.value)) {
        errors.push('Text item must have valid multi-language value');
      }
      break;
      
    case 'image':
      if (typeof item.value !== 'string' || item.value.trim() === '') {
        errors.push('Image item must have a valid URL string');
      }
      if (item.alt && !isValidMultiLanguageValue(item.alt)) {
        warnings.push('Image alt text should be multi-language');
      }
      break;
      
    case 'link':
      if (!isValidMultiLanguageValue(item.value)) {
        errors.push('Link item must have valid multi-language URLs');
      }
      if (!item.label || !isValidMultiLanguageValue(item.label)) {
        errors.push('Link item must have valid multi-language label');
      }
      if (item.target && !['_blank', '_self'].includes(item.target)) {
        errors.push('Link target must be _blank or _self');
      }
      break;
      
    case 'button':
      if (!isValidMultiLanguageValue(item.value)) {
        errors.push('Button item must have valid multi-language text');
      }
      if (!item.action || typeof item.action !== 'string') {
        errors.push('Button item must have a valid action URL');
      }
      if (item.style && !['primary', 'secondary', 'outline'].includes(item.style)) {
        errors.push('Button style must be primary, secondary, or outline');
      }
      break;
      
    case 'array':
      if (!Array.isArray(item.value)) {
        errors.push('Array item must have an array value');
      }
      break;
      
    default:
      errors.push(`Unknown item type: ${item.type}`);
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate multi-language value structure
 */
export function validateMultiLanguageValue(value: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!isValidMultiLanguageValue(value)) {
    errors.push('Value must be an object with en and fr string properties');
    return { isValid: false, errors, warnings };
  }
  
  // Check for empty values
  if (value.en.trim() === '' && value.fr.trim() === '') {
    warnings.push('Both language values are empty');
  }
  
  // Check for missing translations
  if (value.en.trim() === '' && value.fr.trim() !== '') {
    warnings.push('English translation is missing');
  }
  
  if (value.fr.trim() === '' && value.en.trim() !== '') {
    warnings.push('French translation is missing');
  }
  
  return { isValid: true, errors, warnings };
}

/**
 * Check if a value is a valid multi-language object
 */
function isValidMultiLanguageValue(value: any): value is MultiLanguageValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.en === 'string' &&
    typeof value.fr === 'string'
  );
}

/**
 * Validate a component schema
 */
export function validateComponentSchema(component: ComponentSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check component name
  if (!component.component || typeof component.component !== 'string') {
    errors.push('Component must have a valid name');
    return { isValid: false, errors, warnings };
  }
  
  // Check items array
  if (!component.items || !Array.isArray(component.items)) {
    errors.push('Component must have an items array');
    return { isValid: false, errors, warnings };
  }
  
  if (component.items.length === 0) {
    warnings.push('Component has no items');
  }
  
  // Validate each item
  component.items.forEach((item, index) => {
    const itemValidation = validateItemType(item);
    if (!itemValidation.isValid) {
      errors.push(`Item ${index}: ${itemValidation.errors.join(', ')}`);
    }
    warnings.push(...itemValidation.warnings.map(w => `Item ${index}: ${w}`));
  });
  
  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate a complete page schema
 */
export function validatePageSchema(schema: PageSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check components array
  if (!schema.components || !Array.isArray(schema.components)) {
    errors.push('Schema must have a components array');
    return { isValid: false, errors, warnings };
  }
  
  if (schema.components.length === 0) {
    warnings.push('Page has no components');
  }
  
  // Validate each component
  schema.components.forEach((component, index) => {
    const componentValidation = validateComponentSchema(component);
    if (!componentValidation.isValid) {
      errors.push(`Component ${index}: ${componentValidation.errors.join(', ')}`);
    }
    warnings.push(...componentValidation.warnings.map(w => `Component ${index}: ${w}`));
  });
  
  // Check for duplicate component names
  const componentNames = schema.components.map(c => c.component);
  const uniqueNames = new Set(componentNames);
  if (componentNames.length !== uniqueNames.size) {
    warnings.push('Some components have duplicate names');
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
  
  // Check minimum components
  if (requirements.minComponents && schema.components.length < requirements.minComponents) {
    errors.push(`Page must have at least ${requirements.minComponents} components`);
  }
  
  // Check maximum components
  if (requirements.maxComponents && schema.components.length > requirements.maxComponents) {
    errors.push(`Page must have at most ${requirements.maxComponents} components`);
  }
  
  // Check required components
  if (requirements.requiredComponents) {
    const componentNames = schema.components.map(c => c.component);
    const missingComponents = requirements.requiredComponents.filter(
      req => !componentNames.includes(req)
    );
    if (missingComponents.length > 0) {
      errors.push(`Missing required components: ${missingComponents.join(', ')}`);
    }
  }
  
  // Check allowed item types
  if (requirements.allowedItemTypes) {
    const allItemTypes = schema.components.flatMap(c => c.items.map(i => i.type));
    const invalidItemTypes = allItemTypes.filter(
      type => !requirements.allowedItemTypes!.includes(type)
    );
    if (invalidItemTypes.length > 0) {
      errors.push(`Invalid item types found: ${[...new Set(invalidItemTypes)].join(', ')}`);
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
