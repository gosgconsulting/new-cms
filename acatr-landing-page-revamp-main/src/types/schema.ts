/**
 * Schema types for dynamic page content from CMS API
 * Based on the API response pattern provided
 */

// Base item types
export type ItemType = 
  | "image" 
  | "heading" 
  | "button" 
  | "text" 
  | "boolean" 
  | "array" 
  | "review"
  | "link"
  | "number"
  | "object";

// Base item interface
export interface BaseItem {
  key: string;
  type: ItemType;
  content?: string;
  alt?: string;
  src?: string;
  link?: string;
  title?: string;
  level?: number;
  value?: boolean | number | string;
  settings?: Record<string, any>;
  props?: Record<string, any>;
}

// Image item
export interface ImageItem extends BaseItem {
  type: "image";
  src: string;
  alt?: string;
  settings?: {
    layout?: "full" | "contain" | "cover";
    [key: string]: any;
  };
}

// Heading item
export interface HeadingItem extends BaseItem {
  type: "heading";
  level: number; // 1-6 for h1-h6
  content: string;
}

// Button item
export interface ButtonItem extends BaseItem {
  type: "button";
  content: string;
  link?: string;
}

// Text item
export interface TextItem extends BaseItem {
  type: "text";
  content: string;
}

// Boolean item
export interface BooleanItem extends BaseItem {
  type: "boolean";
  value: boolean;
}

// Review item (for testimonials)
export interface ReviewItem extends BaseItem {
  type: "review";
  id: string;
  props: {
    name: string;
    title?: string;
    rating: number;
    content: string;
    company?: string;
    role?: string;
    location?: string;
    image?: string;
    results?: string;
  };
}

// Array item (contains nested items)
export interface ArrayItem extends BaseItem {
  type: "array";
  items: PageItem[];
}

// Object item (contains props)
export interface ObjectItem extends BaseItem {
  type: "object";
  props: Record<string, any>;
}

// Union type for all item types
export type PageItem = 
  | ImageItem 
  | HeadingItem 
  | ButtonItem 
  | TextItem 
  | BooleanItem 
  | ReviewItem 
  | ArrayItem
  | ObjectItem
  | BaseItem;

// Component types that match your current components
export type ComponentType = 
  | "Header"
  | "HeroSection"
  | "MinimalHeroSection"
  | "ProblemSolutionSection"
  | "ServicesSection"
  | "TestimonialsSection"
  | "Reviews"
  | "FAQSection"
  | "CTASection"
  | "MinimalNewsletterSection"
  | "Footer"
  | "Showcase"
  | "ProductGrid"
  | "Newsletter";

// Component definition
export interface Component {
  key: string;
  name: string;
  type: ComponentType;
  items: PageItem[];
}

// Layout structure
export interface Layout {
  components: Component[];
  layout_language?: string;
}

// Page metadata
export interface PageMetadata {
  id: number;
  page_name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  seo_index: boolean;
  status: "published" | "draft" | "archived";
  page_type: "page" | "post" | "landing";
  created_at: string;
  updated_at: string;
}

// API response structure
export interface PageData {
  id: number;
  page_name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  seo_index: boolean;
  status: string;
  page_type: string;
  created_at: string;
  updated_at: string;
  layout: Layout;
}

export interface ApiResponse {
  success: boolean;
  data: PageData;
  meta?: {
    tenant_id?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

// Helper type for component props mapping
export interface ComponentData {
  [key: string]: any;
}

