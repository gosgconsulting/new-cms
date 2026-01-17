import type { DesignSystemMetadata } from "../config/designSystemMetadata";
import {
  loadDesignSystemStyles,
  unloadDesignSystemStyles,
  areStylesLoaded,
} from "./designSystemStyleLoader";

/**
 * Design System Style Manager
 * 
 * Centralized manager for loading/unloading design system styles
 * and managing active design system
 */

let activeDesignSystemId: string | null = null;

// Export the prefix for use in other modules
export const STYLE_ELEMENT_PREFIX = "design-system-styles-";

/**
 * Load styles for a design system
 * 
 * @param metadata - Design system metadata
 */
export async function loadDesignSystem(metadata: DesignSystemMetadata): Promise<void> {
  // Unload previous design system if different
  if (activeDesignSystemId && activeDesignSystemId !== metadata.id) {
    await unloadDesignSystem(activeDesignSystemId);
  }

  // Load new design system styles
  if (!areStylesLoaded(metadata.id)) {
    await metadata.loadStyles();
    activeDesignSystemId = metadata.id;
  }
}

/**
 * Unload styles for a design system
 * 
 * @param designSystemId - Design system identifier
 */
export async function unloadDesignSystem(designSystemId: string): Promise<void> {
  // Get metadata to call unloadStyles if available
  // For now, just remove the style elements
  unloadDesignSystemStyles(designSystemId);
  
  if (activeDesignSystemId === designSystemId) {
    activeDesignSystemId = null;
  }
}

/**
 * Get currently active design system ID
 * 
 * @returns Active design system ID or null
 */
export function getActiveDesignSystemId(): string | null {
  return activeDesignSystemId;
}

/**
 * Switch from one design system to another
 * 
 * @param fromMetadata - Current design system metadata (optional)
 * @param toMetadata - Target design system metadata
 */
export async function switchDesignSystem(
  toMetadata: DesignSystemMetadata,
  fromMetadata?: DesignSystemMetadata
): Promise<void> {
  // Unload previous if provided
  if (fromMetadata && fromMetadata.id !== toMetadata.id) {
    fromMetadata.unloadStyles();
  }

  // Load new design system
  await loadDesignSystem(toMetadata);
}

/**
 * Check if a design system's styles are currently loaded
 * 
 * @param designSystemId - Design system identifier
 * @returns True if styles are loaded
 */
export function isDesignSystemLoaded(designSystemId: string): boolean {
  return areStylesLoaded(designSystemId) && activeDesignSystemId === designSystemId;
}

/**
 * Clear all loaded design system styles
 */
export function clearAllDesignSystemStyles(): void {
  // Remove all style elements with our prefix
  const styleElements = document.querySelectorAll(
    `style[id^="${STYLE_ELEMENT_PREFIX}"]`
  );
  styleElements.forEach((el) => el.remove());
  activeDesignSystemId = null;
}