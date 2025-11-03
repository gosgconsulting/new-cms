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
  | 'ContactForm'
  | 'faq'
  | 'officeHours'
  | 'contactInfo';

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
  
  // Additional properties for specific components
  title?: string;               // For carousel/sections titles
  images?: string[] | any[];    // For carousel images
  highlight?: string;           // For highlighted text
  buttonText?: string;          // For button text
  description?: string;         // For descriptions
  
  // Contact information properties
  address?: string;             // Physical address
  phone?: string;               // Phone number
  email?: string;               // Email address
  hours?: Array<{day: string, time: string}>; // Office hours
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

// Header and Footer Schema interfaces
export interface HeaderSchema {
  logo: { 
    src: string; 
    alt: string; 
    height: string; 
  };
  menu: Array<{ 
    id: string; 
    label: string; 
    link: string; 
  }>;
  showCart: boolean;
  showSearch: boolean;
  showAccount: boolean;
  [key: string]: any; // Allow dynamic fields
}

export interface FooterSchema {
  logo: { 
    src: string; 
    alt: string; 
  };
  sections: Array<{
    title: string;
    links: Array<{ 
      id: string; 
      label: string; 
      link: string; 
    }>;
  }>;
  legalLinks: Array<{ 
    id: string; 
    label: string; 
    link: string; 
  }>;
  copyright: string;
  description: string;
  showCurrencySwitcher: boolean;
  showLanguageSwitcher: boolean;
  [key: string]: any; // Allow dynamic fields
}