// TypeScript interfaces for the simplified schema structure

// Schema item types
export type SchemaItemType = 
  | 'heading' 
  | 'text' 
  | 'image' 
  | 'video'
  | 'gallery'
  | 'carousel'
  | 'button' 
  | 'link'
  | 'boolean' 
  | 'array' 
  | 'input' 
  | 'textarea' 
  | 'review' 
  | 'feature'
  | 'ContactForm';

// Schema item interface
export interface SchemaItem {
  key: string;
  type: SchemaItemType;
  content?: string;              // For text/heading/button
  src?: string;                 // For images
  link?: string;                // For buttons/images
  level?: 1 | 2 | 3 | 4 | 5 | 6; // For headings
  value?: boolean | any;         // For boolean/other types
  items?: SchemaItem[];         // For arrays
  props?: Record<string, any>;  // For complex types like review/feature
  required?: boolean;           // For form fields
  alt?: string;                 // For images
  label?: string;               // For links
}

// Component schema interface
export interface ComponentSchema {
  key: string;
  name?: string;                // Display name for the component
  type: string;                 // HeroSection, Showcase, ProductGrid, etc.
  items: SchemaItem[];
}

// Page schema interface
export interface PageSchema {
  components: ComponentSchema[];
}