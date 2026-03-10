/**
 * Utility functions to extract data from schema items format
 * Used by components to extract props from items array
 */

export interface SchemaItem {
  key?: string;
  type?: string;
  content?: string;
  src?: string;
  alt?: string;
  link?: string;
  level?: number;
  items?: SchemaItem[];
  props?: Record<string, any>;
  [key: string]: any;
}

/**
 * Get text content by key
 */
export function getTextByKey(items: SchemaItem[] | undefined, key: string): string {
  if (!items) return '';
  const item = items.find(i => i.key?.toLowerCase() === key.toLowerCase());
  return item?.content || '';
}

/**
 * Get heading text (any level)
 */
export function getHeading(items: SchemaItem[] | undefined, key?: string, level?: number): string {
  if (!items) return '';
  const heading = items.find(i => {
    if (i.type !== 'heading') return false;
    if (key && i.key?.toLowerCase() !== key.toLowerCase()) return false;
    if (level && i.level !== level) return false;
    return true;
  });
  return heading?.content || '';
}

/**
 * Get image source
 */
export function getImageSrc(items: SchemaItem[] | undefined, key?: string): string {
  if (!items) return '';
  const image = items.find(i => {
    if (i.type !== 'image') return false;
    if (key && i.key?.toLowerCase() !== key.toLowerCase()) return false;
    return true;
  });
  return image?.src || '';
}

/**
 * Get image with alt
 */
export function getImage(items: SchemaItem[] | undefined, key?: string): { src: string; alt: string } | null {
  if (!items) return null;
  const image = items.find(i => {
    if (i.type !== 'image') return false;
    if (key && i.key?.toLowerCase() !== key.toLowerCase()) return false;
    return true;
  });
  if (!image?.src) return null;
  return { src: image.src, alt: image.alt || '' };
}

/**
 * Get button/link
 */
export function getButton(items: SchemaItem[] | undefined, key?: string): { text: string; url: string } | null {
  if (!items) return null;
  const button = items.find(i => {
    if (i.type !== 'button' && i.type !== 'link') return false;
    if (key && i.key?.toLowerCase() !== key.toLowerCase()) return false;
    return true;
  });
  if (!button?.content && !button?.link) return null;
  return { text: button.content || button.link || '', url: button.link || '' };
}

/**
 * Get array items
 */
export function getArrayItems(items: SchemaItem[] | undefined, key?: string): SchemaItem[] {
  if (!items) return [];
  const arrayItem = items.find(i => {
    if (i.type !== 'array') return false;
    if (key && i.key?.toLowerCase() !== key.toLowerCase()) return false;
    return true;
  });
  return Array.isArray(arrayItem?.items) ? arrayItem.items : [];
}

/**
 * Extract props from items array
 * Maps common item patterns to component props
 */
export function extractPropsFromItems(items: SchemaItem[] | undefined): Record<string, any> {
  if (!items || items.length === 0) return {};

  const props: Record<string, any> = {};

  // Extract common fields
  props.title = getHeading(items) || getTextByKey(items, 'title') || getTextByKey(items, 'heading');
  props.description = getTextByKey(items, 'description') || getTextByKey(items, 'text') || getTextByKey(items, 'content');
  props.subtitle = getTextByKey(items, 'subtitle');
  props.imageSrc = getImageSrc(items) || getImageSrc(items, 'image');
  props.image = getImage(items);
  props.button = getButton(items);
  props.buttonText = props.button?.text;
  props.buttonUrl = props.button?.url;

  // Extract array items
  const arrayItems = getArrayItems(items);
  if (arrayItems.length > 0) {
    props.items = arrayItems;
  }

  // Extract any direct props
  items.forEach(item => {
    if (item.props && typeof item.props === 'object') {
      Object.assign(props, item.props);
    }
  });

  return props;
}

/**
 * Merge direct props with items-extracted props
 * Direct props take precedence
 */
export function mergeProps(directProps: Record<string, any> | undefined, items: SchemaItem[] | undefined): Record<string, any> {
  const extractedProps = extractPropsFromItems(items);
  return { ...extractedProps, ...directProps };
}

