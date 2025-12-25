import { componentRegistry } from '../registry';
import { ElementType } from '../types';

/**
 * Detect element type and check if it's a registered component
 */
export function detectElementType(element: HTMLElement): {
  elementType: ElementType;
  isRegistered: boolean;
  componentDefinition?: any;
} {
  const tagName = element.tagName.toLowerCase();
  
  // Basic element type detection
  let elementType: ElementType = 'unknown';
  
  if (tagName === 'img') {
    elementType = 'image';
  } else if (tagName === 'video') {
    elementType = 'video';
  } else if (tagName === 'button' || (tagName === 'input' && element.getAttribute('type') === 'button')) {
    elementType = 'button';
  } else if (tagName === 'a') {
    elementType = 'link';
  } else if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    elementType = 'input';
  } else if (['div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav'].includes(tagName)) {
    elementType = 'container';
  } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'em', 'strong', 'i', 'b', 'small', 'mark'].includes(tagName)) {
    elementType = 'text';
  }
  
  // Check if element is registered in component registry
  const componentDefinition = componentRegistry.get(elementType);
  const isRegistered = !!componentDefinition;
  
  return {
    elementType,
    isRegistered,
    componentDefinition
  };
}

/**
 * Get available editors for element type
 */
export function getAvailableEditors(elementType: ElementType): string[] {
  const componentDef = componentRegistry.get(elementType);
  if (componentDef) {
    return [componentDef.editor];
  }
  
  // Fallback to TextEditor for all types currently
  return ['TextEditor'];
}

/**
 * Check if element can be edited
 */
export function isElementEditable(element: HTMLElement): boolean {
  const { isRegistered, elementType } = detectElementType(element);
  
  // If registered in component registry, check if it's editable
  if (isRegistered) {
    return true;
  }
  
  // Fallback: allow text elements to be editable
  return elementType === 'text';
}

/**
 * Get element properties based on component definition
 */
export function getElementProperties(element: HTMLElement): Record<string, any> {
  const { componentDefinition } = detectElementType(element);
  
  if (componentDefinition) {
    const properties: Record<string, any> = {};
    
    // Extract properties based on component definition
    Object.keys(componentDefinition.properties).forEach(propKey => {
      const propDef = componentDefinition.properties[propKey];
      
      switch (propKey) {
        case 'content':
          properties[propKey] = element.textContent || element.innerHTML || propDef.default;
          break;
        case 'styles':
          properties[propKey] = getComputedStyleObject(element);
          break;
        case 'tagName':
          properties[propKey] = element.tagName.toLowerCase();
          break;
        default:
          const attrValue = element.getAttribute(propKey);
          properties[propKey] = attrValue || propDef.default;
      }
    });
    
    return properties;
  }
  
  // Fallback for non-registered elements
  return {
    content: element.textContent || element.innerHTML || '',
    styles: getComputedStyleObject(element),
    tagName: element.tagName.toLowerCase()
  };
}

/**
 * Get computed styles as object
 */
function getComputedStyleObject(element: HTMLElement): Record<string, string> {
  const computedStyle = window.getComputedStyle(element);
  const styles: Record<string, string> = {};
  
  // Extract commonly edited styles
  const relevantStyles = [
    'fontSize', 'fontFamily', 'fontWeight', 'color', 'backgroundColor',
    'padding', 'margin', 'border', 'borderRadius', 'textAlign',
    'lineHeight', 'letterSpacing', 'textDecoration'
  ];
  
  relevantStyles.forEach(style => {
    const value = computedStyle.getPropertyValue(style.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (value) {
      styles[style] = value;
    }
  });
  
  return styles;
}