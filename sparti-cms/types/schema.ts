// TypeScript interfaces for the v3 schema structure

// Multi-language text value
export interface MultiLanguageValue {
  en: string;
  fr: string;
}

// Schema item types for v3 format
export type SchemaItemType = 
  | 'heading' 
  | 'text' 
  | 'image' 
  | 'button' 
  | 'boolean' 
  | 'array' 
  | 'input' 
  | 'textarea' 
  | 'review' 
  | 'feature';

// Schema item interface (v3 format)
export interface SchemaItem {
  key: string;
  type: SchemaItemType;
  content?: MultiLanguageValue;  // For text/heading/button
  src?: string;                  // For images
  link?: string;                 // For buttons/images
  level?: 1 | 2 | 3 | 4 | 5 | 6; // For headings
  value?: boolean | any;         // For boolean/other types
  items?: SchemaItem[];         // For arrays
  props?: Record<string, any>;  // For complex types like review/feature
  required?: boolean;           // For form fields
}

// Component schema interface (v3 format)
export interface ComponentSchema {
  key: string;
  type: string;  // HeroSection, Showcase, ProductGrid, etc.
  items: SchemaItem[];
}

// Page schema interface (v3 format)
export interface PageSchema {
  components: ComponentSchema[];
  _version?: {
    version: '3.0';
    migratedAt?: string;
    migratedFrom?: string;
  };
}

// Migration result interface
export interface MigrationResult {
  success: boolean;
  message: string;
  newSchema?: PageSchema;
  errors?: string[];
}

// Schema version type
export type SchemaVersion = '3.0';