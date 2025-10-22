// TypeScript interfaces for the new schema structure

// Base interface for all schema items
export interface BaseSchemaItem {
  type: string;
  value: any;
}

// Multi-language text value
export interface MultiLanguageValue {
  en: string;
  fr: string;
}

// Specific item types
export interface HeadingItem extends BaseSchemaItem {
  type: 'heading';
  value: MultiLanguageValue;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface TextItem extends BaseSchemaItem {
  type: 'text';
  value: MultiLanguageValue;
}

export interface ImageItem extends BaseSchemaItem {
  type: 'image';
  value: string; // URL or path
  alt?: MultiLanguageValue;
  caption?: MultiLanguageValue;
}

export interface LinkItem extends BaseSchemaItem {
  type: 'link';
  value: MultiLanguageValue; // URLs for different languages
  label: MultiLanguageValue;
  target?: '_blank' | '_self';
}

export interface ButtonItem extends BaseSchemaItem {
  type: 'button';
  value: MultiLanguageValue; // Button text
  action: string; // URL or action
  style?: 'primary' | 'secondary' | 'outline';
  target?: '_blank' | '_self';
}

export interface ArrayItem extends BaseSchemaItem {
  type: 'array';
  value: any[]; // Array of any type
  itemType?: string; // Type of items in the array
}

// Union type for all possible schema items
export type SchemaItem = 
  | HeadingItem 
  | TextItem 
  | ImageItem 
  | LinkItem 
  | ButtonItem 
  | ArrayItem;

// Component schema with items array
export interface ComponentSchema {
  component: string;
  items: SchemaItem[];
}

// Page schema with array of components
export interface PageSchema {
  components: ComponentSchema[];
}

// Schema version for migration tracking
export interface SchemaVersion {
  version: '1.0' | '2.0'; // 1.0 = old format, 2.0 = new format
  migratedAt?: string;
  migratedFrom?: string;
}

// Extended page schema with version info
export interface PageSchemaWithVersion extends PageSchema {
  _version?: SchemaVersion;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Migration result
export interface MigrationResult {
  success: boolean;
  migratedComponents: number;
  errors: string[];
  warnings: string[];
}
