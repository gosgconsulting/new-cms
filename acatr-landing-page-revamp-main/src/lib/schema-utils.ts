/**
 * Utility functions to extract and transform data from schema
 */

import { 
  PageItem, 
  Component, 
  Layout, 
  PageData,
  ImageItem,
  HeadingItem,
  ButtonItem,
  TextItem,
  BooleanItem,
  ReviewItem,
  ArrayItem,
  ObjectItem
} from "@/types/schema";

/**
 * Get an item by key from a component's items array
 */
export function getItemByKey(items: PageItem[], key: string): PageItem | undefined {
  return items.find(item => item.key === key);
}

/**
 * Get all items of a specific type from a component
 */
export function getItemsByType(items: PageItem[], type: string): PageItem[] {
  return items.filter(item => item.type === type);
}

/**
 * Get component by key from layout
 */
export function getComponentByKey(layout: Layout, key: string): Component | undefined {
  return layout.components.find(component => component.key === key);
}

/**
 * Get component by type from layout
 */
export function getComponentByType(layout: Layout, type: string): Component | undefined {
  return layout.components.find(component => component.type === type);
}

/**
 * Extract heading content by level
 */
export function getHeading(items: PageItem[], level: number): string {
  const heading = items.find(
    item => item.type === "heading" && (item as HeadingItem).level === level
  ) as HeadingItem | undefined;
  return heading?.content || "";
}

/**
 * Extract image source
 */
export function getImageSrc(items: PageItem[], key: string = "image"): string {
  const image = getItemByKey(items, key) as ImageItem | undefined;
  return image?.src || "";
}

/**
 * Extract button data
 */
export function getButton(items: PageItem[], key: string = "button"): { text: string; link?: string } {
  const button = getItemByKey(items, key) as ButtonItem | undefined;
  return {
    text: button?.content || "",
    link: button?.link || ""
  };
}

/**
 * Extract text content
 */
export function getText(items: PageItem[], key: string): string {
  const text = getItemByKey(items, key) as TextItem | undefined;
  return text?.content || "";
}

/**
 * Extract boolean value
 */
export function getBoolean(items: PageItem[], key: string): boolean {
  const bool = getItemByKey(items, key) as BooleanItem | undefined;
  return bool?.value || false;
}

/**
 * Extract reviews/testimonials array
 */
export function getReviews(items: PageItem[], key: string = "reviews"): ReviewItem[] {
  const reviewsItem = getItemByKey(items, key) as ArrayItem | undefined;
  if (reviewsItem && reviewsItem.type === "array") {
    return reviewsItem.items.filter(item => item.type === "review") as ReviewItem[];
  }
  return [];
}

/**
 * Extract array items
 */
export function getArrayItems(items: PageItem[], key: string): PageItem[] {
  const arrayItem = getItemByKey(items, key) as ArrayItem | undefined;
  if (arrayItem && arrayItem.type === "array") {
    return arrayItem.items;
  }
  return [];
}

/**
 * Extract text items from an array (for features, problems, etc.)
 */
export function getArrayTextItems(items: PageItem[], key: string): string[] {
  const arrayItems = getArrayItems(items, key);
  return arrayItems
    .filter(item => item.type === "text")
    .map(item => (item as TextItem).content || "")
    .filter(content => content.length > 0);
}

/**
 * Extract object items with props from an array
 */
export function getArrayObjectItems(items: PageItem[], key: string): ObjectItem[] {
  const arrayItems = getArrayItems(items, key);
  return arrayItems
    .filter(item => item.type === "object")
    .map(item => item as ObjectItem);
}

/**
 * Extract all headings from a component
 */
export function getAllHeadings(items: PageItem[]): HeadingItem[] {
  return items.filter(item => item.type === "heading") as HeadingItem[];
}

/**
 * Extract all images from a component
 */
export function getAllImages(items: PageItem[]): ImageItem[] {
  return items.filter(item => item.type === "image") as ImageItem[];
}

/**
 * Extract all buttons from a component
 */
export function getAllButtons(items: PageItem[]): ButtonItem[] {
  return items.filter(item => item.type === "button") as ButtonItem[];
}

/**
 * Transform component data to a more usable format
 */
export function transformComponentData(component: Component): Record<string, any> {
  const data: Record<string, any> = {};
  
  // Extract common patterns
  data.title = getHeading(component.items, 1) || getHeading(component.items, 2);
  data.subtitle = getHeading(component.items, 3);
  data.image = getImageSrc(component.items);
  data.button = getButton(component.items);
  
  // Extract all items by type for flexible access
  data.headings = getAllHeadings(component.items);
  data.images = getAllImages(component.items);
  data.buttons = getAllButtons(component.items);
  data.texts = getItemsByType(component.items, "text");
  data.booleans = getItemsByType(component.items, "boolean");
  
  // Keep raw items for advanced use cases
  data.items = component.items;
  
  return data;
}

/**
 * Get component data for a specific component type
 */
export function getComponentData(pageData: PageData, componentType: string): Component | undefined {
  return getComponentByType(pageData.layout, componentType);
}

/**
 * Check if page is published and ready to display
 */
export function isPageReady(pageData: PageData): boolean {
  return pageData.status === "published" && pageData.layout?.components?.length > 0;
}

