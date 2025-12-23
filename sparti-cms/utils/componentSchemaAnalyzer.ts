/**
 * Utility functions to analyze component schemas and determine available actions
 */

import { ComponentSchema } from '../types/schema';
import { componentRegistry } from '../registry';

/**
 * Analyzes a component to determine if it has image fields
 */
export function hasImageFields(component: ComponentSchema | any): boolean {
  if (!component) return false;

  // Check component props for image-related properties
  if (component.props) {
    const imagePropertyNames = ['image', 'images', 'src', 'backgroundImage', 'logo', 'avatar', 'photo'];
    const hasImageProp = Object.keys(component.props).some(key => 
      imagePropertyNames.some(imgName => key.toLowerCase().includes(imgName.toLowerCase()))
    );
    if (hasImageProp) return true;

    // Check if any prop is an array containing image objects
    for (const [key, value] of Object.entries(component.props)) {
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // Check if array items have image-like properties
          if ('src' in firstItem || 'url' in firstItem || 'image' in firstItem) {
            return true;
          }
        }
      }
    }
  }

  // Check component items for image types
  if (component.items && Array.isArray(component.items)) {
    const hasImageItem = component.items.some(item => 
      item.type === 'image' || 
      item.type === 'gallery' || 
      item.type === 'carousel' ||
      (item as any).src ||
      (item as any).images
    );
    if (hasImageItem) return true;
  }

  // Check registry schema if component type is available
  if (component.type) {
    const registryComponent = componentRegistry.get(component.type);
    if (registryComponent && registryComponent.properties) {
      const imagePropertyNames = ['image', 'images', 'src', 'backgroundImage', 'logo', 'avatar', 'photo'];
      const hasImageProp = Object.keys(registryComponent.properties).some(key => 
        imagePropertyNames.some(imgName => key.toLowerCase().includes(imgName.toLowerCase()))
      );
      if (hasImageProp) return true;

      // Check if any property is an array with image items
      for (const [key, propDef] of Object.entries(registryComponent.properties)) {
        if (typeof propDef === 'object' && propDef !== null && 'type' in propDef) {
          if (propDef.type === 'array' && 'items' in propDef) {
            const items = (propDef as any).items;
            if (items && typeof items === 'object' && 'properties' in items) {
              const itemProps = (items as any).properties;
              if (itemProps && (itemProps.src || itemProps.url || itemProps.image)) {
                return true;
              }
            }
          }
        }
      }
    }
  }

  return false;
}

/**
 * Analyzes a component to determine if it has text fields
 */
export function hasTextFields(component: ComponentSchema | any): boolean {
  if (!component) return false;

  // Common text property names
  const textPropertyNames = [
    'text', 'heading', 'title', 'content', 'description', 'subtitle', 
    'label', 'buttonText', 'ctaButtonText', 'badgeText', 'name', 
    'tagline', 'headingLine1', 'headingLine2', 'paragraph', 'body'
  ];

  // Check component props for text-related properties
  if (component.props) {
    const hasTextProp = Object.keys(component.props).some(key => 
      textPropertyNames.some(textName => key.toLowerCase().includes(textName.toLowerCase()))
    );
    if (hasTextProp) return true;

    // Check if any prop value is a string (likely text)
    for (const value of Object.values(component.props)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
      // Check nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedText = Object.values(value).some(v => 
          typeof v === 'string' && v.trim().length > 0
        );
        if (nestedText) return true;
      }
    }
  }

  // Check component items for text types
  if (component.items && Array.isArray(component.items)) {
    const hasTextItem = component.items.some(item => 
      item.type === 'text' || 
      item.type === 'heading' || 
      item.type === 'paragraph' ||
      (item as any).content ||
      (item as any).text
    );
    if (hasTextItem) return true;
  }

  // Check registry schema if component type is available
  if (component.type) {
    const registryComponent = componentRegistry.get(component.type);
    if (registryComponent && registryComponent.properties) {
      const hasTextProp = Object.keys(registryComponent.properties).some(key => 
        textPropertyNames.some(textName => key.toLowerCase().includes(textName.toLowerCase()))
      );
      if (hasTextProp) return true;

      // Check nested properties (like content.heading, content.text)
      for (const [key, propDef] of Object.entries(registryComponent.properties)) {
        if (typeof propDef === 'object' && propDef !== null && 'properties' in propDef) {
          const nestedProps = (propDef as any).properties;
          if (nestedProps) {
            const hasNestedText = Object.keys(nestedProps).some(nestedKey =>
              textPropertyNames.some(textName => nestedKey.toLowerCase().includes(textName.toLowerCase()))
            );
            if (hasNestedText) return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Gets available actions for a component based on its schema
 */
export function getAvailableActions(component: ComponentSchema | any): {
  hasImages: boolean;
  hasText: boolean;
} {
  return {
    hasImages: hasImageFields(component),
    hasText: hasTextFields(component),
  };
}

