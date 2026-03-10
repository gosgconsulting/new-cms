/**
 * Utility functions for working with dynamic schema editors
 */

export type SchemaType = 'footer' | 'header';

/**
 * Returns array of known field names for a given schema type
 */
export function getKnownFields(schemaType: SchemaType): string[] {
  if (schemaType === 'footer') {
    return [
      'logo',
      'sections',
      'legalLinks',
      'copyright',
      'description',
      'showCurrencySwitcher',
      'showLanguageSwitcher',
      'blog'
    ];
  } else if (schemaType === 'header') {
    return [
      'logo',
      'menu',
      'showCart',
      'showSearch',
      'showAccount',
      'button'
    ];
  }
  return [];
}

/**
 * Returns object with only unknown fields from schema
 */
export function getUnknownFields(schema: any, knownFields: string[]): Record<string, any> {
  const unknownFields: Record<string, any> = {};
  
  for (const key in schema) {
    if (schema.hasOwnProperty(key) && !knownFields.includes(key)) {
      unknownFields[key] = schema[key];
    }
  }
  
  return unknownFields;
}

/**
 * Checks if a field should use specialized editor
 */
export function isKnownField(fieldName: string, schemaType: SchemaType): boolean {
  return getKnownFields(schemaType).includes(fieldName);
}

/**
 * Infers field type from value
 */
export function detectFieldType(value: any): 'string' | 'number' | 'boolean' | 'array' | 'object' {
  if (value === null || value === undefined) {
    return 'string'; // Default to string for null/undefined
  }
  
  if (Array.isArray(value)) {
    return 'array';
  }
  
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  
  if (typeof value === 'number') {
    return 'number';
  }
  
  if (typeof value === 'object') {
    return 'object';
  }
  
  return 'string';
}

/**
 * Returns appropriate default value for field type
 */
export function getDefaultValueForType(type: string): any {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return '';
  }
}

/**
 * Validates field name format and checks for conflicts
 */
export function validateFieldName(
  name: string,
  knownFields: string[],
  existingFields: string[] = []
): { valid: boolean; error?: string } {
  // Check if empty
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Field name cannot be empty' };
  }
  
  // Check if valid JavaScript identifier
  const validIdentifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  if (!validIdentifierRegex.test(name)) {
    return {
      valid: false,
      error: 'Field name must be a valid JavaScript identifier (letters, numbers, _, $ only, starting with letter/_/$)'
    };
  }
  
  // Check for conflicts with known fields
  if (knownFields.includes(name)) {
    return {
      valid: false,
      error: `Field name conflicts with a reserved field name: ${name}`
    };
  }
  
  // Check for conflicts with existing custom fields
  if (existingFields.includes(name)) {
    return {
      valid: false,
      error: `Field name already exists: ${name}`
    };
  }
  
  return { valid: true };
}

