import React from 'react';
import { Type, Square, Grid3X3, Star, Mail, Image, Video, FolderOpen } from 'lucide-react';
import { ComponentSchema } from '../types/schema';

// Component type display names
export const COMPONENT_TYPE_DISPLAY_NAMES: Record<string, string> = {
  'TextBlock': 'Text Block',
  'HeroSection': 'Hero Section',
  'Showcase': 'Showcase',
  'ProductGrid': 'Product Grid',
  'Reviews': 'Reviews',
  'Newsletter': 'Newsletter',
  'ImageBlock': 'Image Block',
  'VideoBlock': 'Video Block',
  'TabsBlock': 'Tabs'
};

// Component type icon configuration
type IconComponent = React.ComponentType<{ className?: string }>;

interface IconConfig {
  component: IconComponent;
  className: string;
}

const COMPONENT_TYPE_ICON_CONFIG: Record<string, IconConfig> = {
  'TextBlock': { component: Type, className: 'h-4 w-4 text-blue-500' },
  'HeroSection': { component: Square, className: 'h-4 w-4 text-purple-500' },
  'Showcase': { component: Grid3X3, className: 'h-4 w-4 text-orange-500' },
  'ProductGrid': { component: Grid3X3, className: 'h-4 w-4 text-green-500' },
  'Reviews': { component: Star, className: 'h-4 w-4 text-yellow-500' },
  'Newsletter': { component: Mail, className: 'h-4 w-4 text-blue-500' },
  'ImageBlock': { component: Image, className: 'h-4 w-4 text-green-500' },
  'VideoBlock': { component: Video, className: 'h-4 w-4 text-purple-500' },
  'TabsBlock': { component: FolderOpen, className: 'h-4 w-4 text-indigo-500' }
};

// Constants
export const SEO_LIMITS = {
  META_TITLE_MAX: 60,
  META_DESCRIPTION_MAX: 160,
} as const;

export const JSON_EDITOR_CONFIG = {
  TAB_SIZE: 2,
  INIT_DELAY: 150,
  FOCUS_DELAY: 100,
  MIN_HEIGHT: '400px',
} as const;

// Helper functions
export const getComponentTypeDisplayName = (type: string): string => {
  return COMPONENT_TYPE_DISPLAY_NAMES[type] || type;
};

export const getComponentIcon = (type: string): React.ReactNode => {
  const iconConfig = COMPONENT_TYPE_ICON_CONFIG[type];
  if (iconConfig) {
    const IconComponent = iconConfig.component;
    return React.createElement(IconComponent, { className: iconConfig.className });
  }
  return React.createElement(Square, { className: 'h-4 w-4 text-gray-400' });
};

export const getComponentPreview = (component: ComponentSchema): string => {
  if (!component.items || component.items.length === 0) {
    return 'No items';
  }

  const firstItem = component.items[0];
  switch (firstItem.type) {
    case 'heading':
    case 'text':
      return firstItem.content 
        ? firstItem.content.substring(0, 40) + (firstItem.content.length > 40 ? '...' : '') 
        : 'No content';
    case 'image':
      return firstItem.src ? `Image: ${firstItem.alt || 'Untitled'}` : 'No image';
    case 'video':
      return firstItem.src ? `Video: ${firstItem.alt || 'Untitled'}` : 'No video';
    case 'button':
      return firstItem.content ? `Button: ${firstItem.content}` : 'No button text';
    case 'contactInfo':
      const parts: string[] = [];
      if (firstItem.address) parts.push('Address');
      if (firstItem.phone) parts.push('Phone');
      if (firstItem.email) parts.push('Email');
      if (firstItem.hours?.length) parts.push('Hours');
      return parts.length ? parts.join(', ') : 'No contact info';
    case 'gallery':
      return firstItem.value?.length ? `${firstItem.value.length} images` : 'No images';
    case 'carousel':
      return firstItem.images?.length ? `${firstItem.images.length} slides` : 'No slides';
    default:
      return `${component.items.length} item${component.items.length !== 1 ? 's' : ''}`;
  }
};

// Array-based component detection
export const hasArrayItems = (component: ComponentSchema): boolean => {
  if (!component.items || component.items.length === 0) {
    return false;
  }

  // Check for specific array-based component types
  const arrayBasedTypes = ['carousel', 'gallery', 'array'];
  const hasArrayType = component.items.some(item => arrayBasedTypes.includes(item.type));
  
  if (hasArrayType) {
    return true;
  }

  // Check for components with array properties in their data
  const firstItem = component.items[0];
  if (firstItem && firstItem.type === 'carousel' && firstItem.images) {
    return Array.isArray(firstItem.images) && firstItem.images.length > 0;
  }

  // Check for other array properties that should show cards
  const arrayProperties = ['images', 'items', 'testimonials', 'teamMembers', 'faqs', 'slides', 'clientLogos', 'ctaButtons'];
  
  // Check in all items, not just the first one
  return component.items.some(item => {
    return arrayProperties.some(prop => {
      const value = (item as any)?.[prop];
      return Array.isArray(value) && value.length > 0;
    });
  });
};

export const getArrayItemsFromComponent = (component: ComponentSchema): any[] => {
  if (!component.items || component.items.length === 0) {
    return [];
  }

  // Check all items for array properties
  const arrayProperties = ['images', 'testimonials', 'teamMembers', 'faqs', 'slides', 'clientLogos', 'ctaButtons'];
  
  for (const item of component.items) {
    // Check carousel/gallery items
    if (item.type === 'carousel' && item.images) {
      return Array.isArray(item.images) ? item.images : [];
    }
    
    if (item.type === 'gallery' && item.value) {
      return Array.isArray(item.value) ? item.value : [];
    }

    // Check for array items in the item itself
    if (item.items && Array.isArray(item.items)) {
      return item.items;
    }

    // Check for other array properties
    for (const prop of arrayProperties) {
      const value = (item as any)?.[prop];
      if (Array.isArray(value) && value.length > 0) {
        return value;
      }
    }
  }

  return [];
};

export const getArrayItemPreview = (item: any, index: number, type: string): { title: string; subtitle?: string; thumbnail?: string } => {
  // Handle different types of array items
  switch (type) {
    case 'carousel':
    case 'gallery':
      return {
        title: `Slide ${index + 1}`,
        subtitle: item.alt || item.caption || 'No description',
        thumbnail: item.src || item.url
      };
    
    case 'testimonials':
      return {
        title: item.name || `Testimonial ${index + 1}`,
        subtitle: item.text ? item.text.substring(0, 50) + '...' : 'No text',
        thumbnail: item.image || item.avatar
      };
    
    case 'teamMembers':
      return {
        title: item.name || `Member ${index + 1}`,
        subtitle: item.role || item.position || 'No role',
        thumbnail: item.image || item.photo
      };
    
    case 'faqs':
      return {
        title: item.question || `FAQ ${index + 1}`,
        subtitle: item.answer ? item.answer.substring(0, 50) + '...' : 'No answer'
      };
    
    case 'clientLogos':
      return {
        title: item.name || `Logo ${index + 1}`,
        subtitle: item.alt || 'Client logo',
        thumbnail: item.image || item.src
      };
    
    case 'ctaButtons':
      return {
        title: item.text || `Button ${index + 1}`,
        subtitle: item.url || 'No URL'
      };
    
    default:
      return {
        title: item.title || item.name || item.label || `Item ${index + 1}`,
        subtitle: item.description || item.content || item.text || 'No description'
      };
  }
};

// Validation helpers
export const isValidComponentsArray = (components: unknown): components is ComponentSchema[] => {
  return Array.isArray(components);
};

