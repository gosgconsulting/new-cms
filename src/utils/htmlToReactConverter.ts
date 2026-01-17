/**
 * HTML to React Converter Utility
 * 
 * Utilities for converting HTML-based components (like HyperUI) to React components
 * with ComponentSchema integration
 */

/**
 * Convert HTML class attribute to React className
 */
export function convertClassToClassName(html: string): string {
  return html.replace(/\sclass=/g, " className=");
}

/**
 * Convert self-closing tags to React format
 */
export function convertSelfClosingTags(html: string): string {
  // Convert <img> to <img />
  return html.replace(/<img([^>]*?)>/gi, "<img$1 />");
}

/**
 * Extract placeholder patterns from HTML
 * 
 * Common patterns:
 * - {{title}} -> getText("title")
 * - {{description}} -> getText("description")
 * - {{image}} -> getImage("image")
 * - {{items}} -> getArray("items")
 */
export function extractPlaceholders(html: string): string[] {
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const matches: string[] = [];
  let match;
  
  while ((match = placeholderRegex.exec(html)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  
  return matches;
}

/**
 * Replace HTML placeholders with ComponentSchema extraction calls
 */
export function replacePlaceholders(html: string, placeholders: string[]): string {
  let result = html;
  
  placeholders.forEach((placeholder) => {
    // Determine extraction method based on placeholder name
    const lowerPlaceholder = placeholder.toLowerCase();
    let replacement = "";
    
    if (lowerPlaceholder.includes("image") || lowerPlaceholder.includes("img") || lowerPlaceholder.includes("photo")) {
      replacement = `{getImage("${placeholder}")}`;
    } else if (lowerPlaceholder.includes("items") || lowerPlaceholder.includes("list") || lowerPlaceholder.includes("array")) {
      replacement = `{getArray("${placeholder}")}`;
    } else {
      replacement = `{getText("${placeholder}")}`;
    }
    
    result = result.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, "g"), replacement);
  });
  
  return result;
}

/**
 * Convert HTML string to React JSX string
 * 
 * @param html - HTML string to convert
 * @param componentName - Name of the component
 * @returns React JSX string with ComponentSchema integration
 */
export function convertHTMLToReact(html: string, componentName: string): string {
  // Step 1: Convert class to className
  let jsx = convertClassToClassName(html);
  
  // Step 2: Convert self-closing tags
  jsx = convertSelfClosingTags(jsx);
  
  // Step 3: Extract placeholders
  const placeholders = extractPlaceholders(html);
  
  // Step 4: Replace placeholders with ComponentSchema calls
  if (placeholders.length > 0) {
    jsx = replacePlaceholders(jsx, placeholders);
  }
  
  // Step 5: Wrap in component structure
  // This is a basic conversion - full implementation would need more sophisticated parsing
  return jsx;
}

/**
 * Generate React component template from HTML
 */
export function generateReactComponentFromHTML(
  html: string,
  componentName: string,
  designSystem: string
): string {
  const placeholders = extractPlaceholders(html);
  const jsx = convertHTMLToReact(html, componentName);
  
  // Generate helper functions based on placeholders
  const needsGetText = placeholders.some(p => 
    !p.toLowerCase().includes("image") && 
    !p.toLowerCase().includes("img") && 
    !p.toLowerCase().includes("photo") &&
    !p.toLowerCase().includes("items") &&
    !p.toLowerCase().includes("list") &&
    !p.toLowerCase().includes("array")
  );
  
  const needsGetImage = placeholders.some(p => 
    p.toLowerCase().includes("image") || 
    p.toLowerCase().includes("img") || 
    p.toLowerCase().includes("photo")
  );
  
  const needsGetArray = placeholders.some(p => 
    p.toLowerCase().includes("items") || 
    p.toLowerCase().includes("list") || 
    p.toLowerCase().includes("array")
  );
  
  let helperFunctions = "";
  if (needsGetText) {
    helperFunctions += `
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };`;
  }
  
  if (needsGetImage) {
    helperFunctions += `
  const getImage = (key: string = "image") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || "";
  };`;
  }
  
  if (needsGetArray) {
    helperFunctions += `
  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };`;
  }
  
  return `
"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";

interface ${designSystem}${componentName}Props {
  component: ComponentSchema;
  className?: string;
}

const ${designSystem}${componentName}: React.FC<${designSystem}${componentName}Props> = ({
  component,
  className = "",
}) => {
  const items = component.items || [];${helperFunctions}

  return (
    <div className={\`${jsx.replace(/className="([^"]*)"/g, (match, classes) => {
      return `className={\`${classes} \${className}\`}`;
    })}\`}>
      {/* Component content */}
    </div>
  );
};

export default ${designSystem}${componentName};
`;
}
