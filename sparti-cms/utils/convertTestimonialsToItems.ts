/**
 * Utility functions to convert testimonials data to proper items structure
 * for the CMS editor to display accordion items and editable fields
 */

import { ComponentSchema, SchemaItem } from '../types/schema';

/**
 * Convert testimonials array to proper items structure with accordion support
 */
export function convertTestimonialsToItems(
  testimonials: Array<{
    name?: string;
    text?: string;
    role?: string;
    company?: string;
    image?: string;
    avatar?: string;
    quote?: string;
    rating?: number;
  }>
): SchemaItem[] {
  if (!testimonials || !Array.isArray(testimonials)) {
    return [];
  }

  return testimonials.map((testimonial, index) => {
    const testimonialKey = `testimonial-${index + 1}`;
    
    return {
      key: testimonialKey,
      type: 'array',
      items: [
        {
          key: `${testimonialKey}_image`,
          type: 'image',
          src: testimonial.image || testimonial.avatar || '',
          alt: testimonial.name || `Testimonial ${index + 1}`
        },
        {
          key: `${testimonialKey}_text`,
          type: 'textarea',
          content: testimonial.text || testimonial.quote || ''
        },
        {
          key: `${testimonialKey}_name`,
          type: 'heading',
          level: 4,
          content: testimonial.name || ''
        },
        {
          key: `${testimonialKey}_role`,
          type: 'text',
          content: testimonial.role || ''
        },
        ...(testimonial.company ? [{
          key: `${testimonialKey}_company`,
          type: 'text',
          content: testimonial.company
        }] : []),
        ...(testimonial.rating ? [{
          key: `${testimonialKey}_rating`,
          type: 'text',
          content: String(testimonial.rating)
        }] : [])
      ]
    } as SchemaItem;
  });
}

/**
 * Convert a testimonials-section component to proper items structure
 * This ensures the component has the correct structure for the editor
 */
export function convertTestimonialsComponentToItems(component: ComponentSchema): ComponentSchema {
  // If component already has items, check if it needs conversion
  if (component.items && component.items.length > 0) {
    // Check if testimonials are already in items format
    const hasTestimonialsArray = component.items.some(item => 
      item.key === 'testimonials' && item.type === 'array' && item.items
    );
    
    if (hasTestimonialsArray) {
      // Already in correct format, but ensure testimonials items are properly structured
      const updatedItems = component.items.map(item => {
        if (item.key === 'testimonials' && item.type === 'array') {
          // Check if testimonials are in old format (plain objects)
          const testimonials = (item as any).testimonials || item.items || [];
          
          // Convert if needed
          if (testimonials.length > 0 && testimonials[0] && !testimonials[0].key) {
            // Old format: array of plain objects
            const convertedTestimonials = convertTestimonialsToItems(testimonials);
            return {
              ...item,
              items: convertedTestimonials
            };
          }
        }
        return item;
      });
      
      return {
        ...component,
        items: updatedItems
      };
    }
  }

  // Component doesn't have items or testimonials in items format
  // Check if it has testimonials in props/data
  const testimonials = (component as any).testimonials || 
                   (component as any).props?.testimonials || 
                   (component as any).data?.testimonials || [];

  const sectionTitle = (component as any).sectionTitle || 
                       (component as any).props?.sectionTitle || 
                       (component as any).data?.sectionTitle || 
                       'What our clients say';

  const sectionSubtitle = (component as any).sectionSubtitle || 
                          (component as any).props?.sectionSubtitle || 
                          (component as any).data?.sectionSubtitle || 
                          'See what our customers have to say about our services.';

  // Create proper items structure
  const items: SchemaItem[] = [
    {
      key: 'title',
      type: 'heading',
      level: 2,
      content: sectionTitle
    },
    {
      key: 'subtitle',
      type: 'text',
      content: sectionSubtitle
    },
    {
      key: 'testimonials',
      type: 'array',
      items: convertTestimonialsToItems(testimonials)
    }
  ];

  return {
    ...component,
    items
  };
}

/**
 * Convert entire layout JSON to ensure testimonials sections have proper structure
 */
export function convertLayoutTestimonialsToItems(layoutJson: { components?: ComponentSchema[] }): { components: ComponentSchema[] } {
  if (!layoutJson.components || !Array.isArray(layoutJson.components)) {
    // Ensure we always return an object with components array
    return { ...layoutJson, components: [] };
  }

  const convertedComponents = layoutJson.components.map(component => {
    // Check if this is a testimonials section
    if (component.type === 'testimonials-section' || 
        component.key === 'testimonials-section' ||
        (component as any).key === 'testimonials-section') {
      return convertTestimonialsComponentToItems(component);
    }
    return component;
  });

  return {
    ...layoutJson,
    components: convertedComponents
  };
}