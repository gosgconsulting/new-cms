import type { DesignSystemStyleConfig } from "../config/designSystemMetadata";
import { scopeCSSWithAttribute } from "./cssScoping";

/**
 * Style element IDs for tracking loaded styles
 */
const STYLE_ELEMENT_PREFIX = "design-system-styles-";

/**
 * Load CSS file from setup folder
 * 
 * @param filePath - Path to CSS file relative to workspace root
 * @returns CSS content as string
 */
async function loadCSSFile(filePath: string): Promise<string> {
  try {
    // For Vite, we need to use import with ?raw suffix
    // Since we can't dynamically import with variables, we'll use a different approach
    // For now, we'll create link elements for CSS files
    // In production, CSS should be bundled or loaded via link tags
    
    // Try to fetch as text (works for public assets or if served)
    const response = await fetch(filePath);
    if (response.ok) {
      return await response.text();
    }
    
    // If fetch fails, return empty (styles will need to be loaded differently)
    console.warn(`[designSystemStyleLoader] Could not load CSS via fetch: ${filePath}. Consider using link elements or bundling.`);
    return "";
  } catch (error) {
    console.warn(`[designSystemStyleLoader] Error loading CSS: ${filePath}`, error);
    return "";
  }
}

/**
 * Inject CSS into document head
 * 
 * @param css - CSS content
 * @param id - Unique identifier for style element
 * @param scoped - Whether to scope the CSS
 * @param scopeValue - Value for scoping attribute
 */
function injectCSS(
  css: string,
  id: string,
  scoped: boolean = false,
  scopeValue?: string
): void {
  // Remove existing style element if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  if (!css || !css.trim()) {
    return;
  }

  // Scope CSS if needed
  let finalCSS = css;
  if (scoped && scopeValue) {
    finalCSS = scopeCSSWithAttribute(css, "data-design-system", scopeValue);
  }

  // Create and inject style element
  const styleElement = document.createElement("style");
  styleElement.id = id;
  styleElement.textContent = finalCSS;
  document.head.appendChild(styleElement);
}

/**
 * Load CSS file as link element (for files that can't be loaded as text)
 * 
 * @param url - CSS file URL or path
 * @param id - Unique identifier for link element
 * @param scoped - Whether styles should be scoped (requires CSS to be loaded as text first)
 */
function loadCSSAsLink(url: string, id: string, scoped: boolean = false): void {
  // Remove existing link if present
  const existing = document.getElementById(id) as HTMLLinkElement;
  if (existing) {
    existing.remove();
  }

  // Create and inject link element
  const linkElement = document.createElement("link");
  linkElement.id = id;
  linkElement.rel = "stylesheet";
  linkElement.href = url;
  
  // Note: Link elements can't be scoped directly
  // For scoped styles, we need to load as text and inject as style element
  if (scoped) {
    console.warn(`[designSystemStyleLoader] Cannot scope link-based CSS. Consider loading ${url} as text for scoping.`);
  }
  
  document.head.appendChild(linkElement);
}

/**
 * Load design system styles from configuration
 * 
 * @param config - Design system style configuration
 * @param designSystemId - Design system identifier
 */
export async function loadDesignSystemStyles(
  config: DesignSystemStyleConfig,
  designSystemId: string
): Promise<void> {
  const styleElementId = `${STYLE_ELEMENT_PREFIX}${designSystemId}`;
  const scoped = config.scoped !== false; // Default to true
  const scopeValue = designSystemId;

  // Skip loading if setup folder is empty (design system uses npm packages)
  if (!config.setupFolder || config.setupFolder.trim() === "") {
    // Design system styles are loaded via npm packages, Tailwind plugins, or build-time imports
    // No runtime CSS loading needed
    return;
  }

  // Skip loading if no CSS files are specified
  if (!config.cssFiles || config.cssFiles.length === 0) {
    // No CSS files to load
    return;
  }

  // Try to load CSS files as text (will work if files are accessible)
  const cssPromises = config.cssFiles.map((file) => {
    const fullPath = `${config.setupFolder}/${file}`;
    return loadCSSFile(fullPath);
  });

  // Load theme files if specified
  const themePromises = (config.themeFiles || []).map((file) => {
    const fullPath = `${config.setupFolder}/${file}`;
    return loadCSSFile(fullPath);
  });

  // Load typography file if specified
  const typographyPromise = config.typographyFile
    ? loadCSSFile(`${config.setupFolder}/${config.typographyFile}`)
    : Promise.resolve("");

  // Load animation file if specified
  const animationPromise = config.animationFile
    ? loadCSSFile(`${config.setupFolder}/${config.animationFile}`)
    : Promise.resolve("");

  // Wait for all CSS to load
  const [cssContents, themeContents, typographyCSS, animationCSS] = await Promise.all([
    Promise.all(cssPromises),
    Promise.all(themePromises),
    typographyPromise,
    animationPromise,
  ]);

  // Combine all CSS that was successfully loaded as text
  const textCSS = [
    ...cssContents.filter(Boolean),
    ...themeContents.filter(Boolean),
    typographyCSS,
    animationCSS,
  ]
    .filter(Boolean)
    .join("\n\n");

  // If we have text CSS, inject it (scoped if needed)
  if (textCSS.trim()) {
    injectCSS(textCSS, styleElementId, scoped, scopeValue);
  }

  // Load JS files if specified (for future use)
  if (config.jsFiles && config.jsFiles.length > 0) {
    console.log(
      `[designSystemStyleLoader] JS files specified for ${designSystemId}, but JS loading not yet implemented`
    );
  }
}

/**
 * Unload design system styles
 * 
 * @param designSystemId - Design system identifier
 */
export function unloadDesignSystemStyles(designSystemId: string): void {
  const styleElementId = `${STYLE_ELEMENT_PREFIX}${designSystemId}`;
  const styleElement = document.getElementById(styleElementId);
  
  if (styleElement) {
    styleElement.remove();
  }
}

/**
 * Check if design system styles are loaded
 * 
 * @param designSystemId - Design system identifier
 * @returns True if styles are loaded
 */
export function areStylesLoaded(designSystemId: string): boolean {
  const styleElementId = `${STYLE_ELEMENT_PREFIX}${designSystemId}`;
  return document.getElementById(styleElementId) !== null;
}

/**
 * Load CSS from URL (for npm packages or CDN)
 * 
 * @param url - CSS file URL
 * @param id - Unique identifier for link element
 */
export function loadCSSFromURL(url: string, id: string): void {
  // Remove existing link if present
  const existing = document.getElementById(id) as HTMLLinkElement;
  if (existing) {
    existing.remove();
  }

  // Create and inject link element
  const linkElement = document.createElement("link");
  linkElement.id = id;
  linkElement.rel = "stylesheet";
  linkElement.href = url;
  document.head.appendChild(linkElement);
}

/**
 * Unload CSS from URL
 * 
 * @param id - Link element identifier
 */
export function unloadCSSFromURL(id: string): void {
  const linkElement = document.getElementById(id) as HTMLLinkElement;
  if (linkElement) {
    linkElement.remove();
  }
}
