/**
 * Utility functions to extract data from schema format
 * Schema format: { key, name, type, items: [...] }
 * Items format: { key, type, content, icon, level, link, src, alt, settings, items, props, ... }
 */

export interface SchemaItem {
  key: string;
  type: string;
  content?: string;
  icon?: string;
  level?: number;
  link?: string;
  src?: string;
  alt?: string;
  settings?: any;
  items?: SchemaItem[];
  props?: any;
  [key: string]: any;
}

export interface SchemaComponent {
  key?: string;
  name?: string;
  type?: string;
  items?: SchemaItem[];
  [key: string]: any;
}

/**
 * Get an item from items array by key
 */
export function getItemByKey(items: SchemaItem[] | undefined, key: string): SchemaItem | undefined {
  if (!items || !Array.isArray(items)) return undefined;
  return items.find(item => item.key === key);
}

/**
 * Get content value from item by key
 */
export function getContentByKey(items: SchemaItem[] | undefined, key: string): string {
  const item = getItemByKey(items, key);
  return item?.content || '';
}

/**
 * Get all items of a specific type
 */
export function getItemsByType(items: SchemaItem[] | undefined, type: string): SchemaItem[] {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(item => item.type === type);
}

/**
 * Get heading item by key and return content
 */
export function getHeading(items: SchemaItem[] | undefined, key: string, level?: number): string {
  const item = getItemByKey(items, key);
  if (!item || item.type !== 'heading') return '';
  if (level !== undefined && item.level !== level) return '';
  return item.content || '';
}

/**
 * Get text item by key and return content
 */
export function getText(items: SchemaItem[] | undefined, key: string): string {
  const item = getItemByKey(items, key);
  if (!item || item.type !== 'text') return '';
  return item.content || '';
}

/**
 * Get image item by key and return src
 */
export function getImageSrc(items: SchemaItem[] | undefined, key: string): string {
  const item = getItemByKey(items, key);
  if (!item || item.type !== 'image') return '';
  return item.src || '';
}

/**
 * Get image alt text by key
 */
export function getImageAlt(items: SchemaItem[] | undefined, key: string): string {
  const item = getItemByKey(items, key);
  if (!item || item.type !== 'image') return '';
  return item.alt || '';
}

/**
 * Get button item by key and return { content, link }
 */
export function getButton(items: SchemaItem[] | undefined, key: string): { content: string; link?: string; icon?: string } {
  const item = getItemByKey(items, key);
  if (!item || item.type !== 'button') return { content: '' };
  return {
    content: item.content || '',
    link: item.link,
    icon: item.icon
  };
}

/**
 * Get array items (nested arrays)
 */
export function getArrayItems(items: SchemaItem[] | undefined, key: string): SchemaItem[] {
  const item = getItemByKey(items, key);
  if (!item || item.type !== 'array' || !item.items) return [];
  return item.items;
}

/**
 * Extract FAQ items from array
 */
export function getFAQItems(items: SchemaItem[] | undefined, key: string): Array<{ question: string; answer: string }> {
  const arrayItems = getArrayItems(items, key);
  return arrayItems
    .filter(item => item.type === 'faq' && item.props)
    .map(item => ({
      question: item.props.question || '',
      answer: item.props.answer || ''
    }));
}

/**
 * Extract testimonial items from array
 */
export function getTestimonialItems(items: SchemaItem[] | undefined, key: string): Array<{
  name: string;
  role: string;
  text: string;
  image?: string;
  alt?: string;
}> {
  const arrayItems = getArrayItems(items, key);
  return arrayItems.map(testimonialItem => {
    const testimonialItems = testimonialItem.items || [];
    const name = getHeading(testimonialItems, 'testimonial1_name', 4) || 
                 getContentByKey(testimonialItems, 'testimonial1_name') ||
                 getContentByKey(testimonialItems, 'name');
    const role = getText(testimonialItems, 'testimonial1_role') || 
                 getContentByKey(testimonialItems, 'role');
    const text = getText(testimonialItems, 'testimonial1_text') || 
                 getContentByKey(testimonialItems, 'text') ||
                 getContentByKey(testimonialItems, 'content');
    const image = getImageSrc(testimonialItems, 'testimonial1_image') ||
                  getContentByKey(testimonialItems, 'image');
    const alt = getImageAlt(testimonialItems, 'testimonial1_image') ||
                getContentByKey(testimonialItems, 'alt') ||
                name;

    return { name, role, text, image, alt };
  });
}

/**
 * Extract service items from array (for ServicesShowcase)
 */
export function getServiceItems(items: SchemaItem[] | undefined, key: string): Array<{
  title: string;
  highlight: string;
  description: string;
  button?: { content: string; link?: string };
  carousel?: any;
}> {
  const arrayItems = getArrayItems(items, key);
  return arrayItems.map(serviceItem => {
    const serviceItems = serviceItem.items || [];
    const title = getHeading(serviceItems, 'title', 2) || getContentByKey(serviceItems, 'title');
    const highlight = getHeading(serviceItems, 'highlight', 2) || getContentByKey(serviceItems, 'highlight');
    const description = getText(serviceItems, 'description') || getContentByKey(serviceItems, 'description');
    const button = getButton(serviceItems, 'button');
    const carousel = getItemByKey(serviceItems, `${serviceItem.key} Carousel`);

    return { title, highlight, description, button, carousel };
  });
}

/**
 * Extract result slide items from array (for ResultsSection)
 */
export function getResultSlides(items: SchemaItem[] | undefined, key: string): Array<{
  image: string;
  alt: string;
  caption: string;
}> {
  const arrayItems = getArrayItems(items, key);
  return arrayItems.map(slideItem => {
    const slideItems = slideItem.items || [];
    const image = getImageSrc(slideItems, `${slideItem.key} Image`) || 
                  getContentByKey(slideItems, 'image');
    const alt = getImageAlt(slideItems, `${slideItem.key} Image`) || 
                getContentByKey(slideItems, 'alt') || '';
    const caption = getHeading(slideItems, `${slideItem.key} Caption`, 3) || 
                    getContentByKey(slideItems, 'caption');

    return { image, alt, caption };
  });
}


