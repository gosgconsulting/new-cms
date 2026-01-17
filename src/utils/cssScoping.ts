/**
 * CSS Scoping Utilities
 * 
 * Utilities to scope CSS rules with data attributes or class prefixes
 * to prevent style conflicts between design systems
 */

/**
 * Scope CSS rules with a data attribute selector
 * 
 * @param css - Raw CSS string
 * @param attribute - Attribute name (e.g., "data-design-system")
 * @param value - Attribute value (e.g., "flowbite")
 * @returns Scoped CSS string
 * 
 * Example:
 * Input: ".btn { color: blue; }"
 * Output: "[data-design-system=\"flowbite\"] .btn { color: blue; }"
 */
export function scopeCSSWithAttribute(
  css: string,
  attribute: string,
  value: string
): string {
  const scope = `[${attribute}="${value}"]`;
  
  // Handle @import statements - keep them at the top, unscoped
  const importRegex = /@import[^;]+;/g;
  const imports = css.match(importRegex) || [];
  const cssWithoutImports = css.replace(importRegex, "").trim();
  
  // Handle @keyframes - scope the animation name but keep keyframes global
  // We'll scope the usage but keep keyframes definitions
  let scopedCSS = cssWithoutImports;
  
  // Scope regular CSS rules
  // Match selectors (including complex selectors, pseudo-classes, etc.)
  // Pattern: Match selectors followed by { ... }
  scopedCSS = scopedCSS.replace(
    /([^{}]+)\{([^{}]*)\}/g,
    (match, selector, rules) => {
      // Skip @ rules (keyframes, media queries, etc.)
      if (selector.trim().startsWith("@")) {
        return match;
      }
      
      // Skip :root and :host selectors (they should remain global for CSS variables)
      if (selector.trim().match(/^:root|^:host/)) {
        return match;
      }
      
      // Clean up selector
      const cleanSelector = selector.trim();
      
      // Don't double-scope if already scoped
      if (cleanSelector.includes(`[${attribute}`)) {
        return match;
      }
      
      // Scope the selector
      const scopedSelector = `${scope} ${cleanSelector}`;
      return `${scopedSelector} {${rules}}`;
    }
  );
  
  // Handle nested rules (media queries, @supports, etc.)
  scopedCSS = scopedCSS.replace(
    /(@media[^{]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    (match, mediaQuery, content) => {
      // Scope the content inside media queries
      const scopedContent = content.replace(
        /([^{}]+)\{([^{}]*)\}/g,
        (innerMatch, innerSelector, innerRules) => {
          if (innerSelector.trim().startsWith("@") || innerSelector.trim().match(/^:root|^:host/)) {
            return innerMatch;
          }
          if (innerSelector.trim().includes(`[${attribute}`)) {
            return innerMatch;
          }
          return `${scope} ${innerSelector.trim()} {${innerRules}}`;
        }
      );
      return `${mediaQuery}{${scopedContent}}`;
    }
  );
  
  // Prepend imports at the top
  return imports.join("\n") + (imports.length > 0 ? "\n\n" : "") + scopedCSS;
}

/**
 * Scope CSS with class prefix
 * 
 * @param css - Raw CSS string
 * @param prefix - Class prefix (e.g., "flowbite")
 * @returns Scoped CSS string with prefixed classes
 * 
 * Example:
 * Input: ".btn { color: blue; }"
 * Output: ".flowbite-btn { color: blue; }"
 */
export function scopeCSSWithPrefix(css: string, prefix: string): string {
  // Match class selectors and prefix them
  return css.replace(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g, (match, className) => {
    // Don't prefix if already prefixed
    if (className.startsWith(`${prefix}-`)) {
      return match;
    }
    // Don't prefix utility classes that start with numbers or special chars
    if (/^[0-9]/.test(className)) {
      return match;
    }
    return `.${prefix}-${className}`;
  });
}

/**
 * Extract CSS variables from :root selector
 * 
 * @param css - Raw CSS string
 * @returns Object with CSS variable names and values
 */
export function extractCSSVariables(css: string): Record<string, string> {
  const variables: Record<string, string> = {};
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  
  if (rootMatch) {
    const rootContent = rootMatch[1];
    const varRegex = /--([^:]+):\s*([^;]+);/g;
    let match;
    
    while ((match = varRegex.exec(rootContent)) !== null) {
      variables[match[1].trim()] = match[2].trim();
    }
  }
  
  return variables;
}
