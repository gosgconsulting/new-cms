import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import type { ReactNode, ComponentType } from "react";

/**
 * Design System Component Metadata
 * 
 * Represents a single component within a design system
 */
export interface DesignSystemComponent {
  id: string;
  name: string;
  description: string;
  sampleSchema: ComponentSchema;
  componentFile: string; // Path to component file
}

/**
 * Design System Tech Stack
 * 
 * Defines the technical stack used by a design system
 */
export interface DesignSystemTechStack {
  cssFrameworks?: string[]; // e.g., ["tailwindcss", "daisyui"]
  jsLibraries?: string[]; // e.g., ["flowbite", "preline"]
  requires?: string[]; // npm packages required
  tailwindPlugins?: string[]; // Tailwind plugins to load
}

/**
 * Design System Styles
 * 
 * Style definitions for colors, spacing, typography, and animations
 */
export interface DesignSystemStyles {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string;
    [key: string]: any;
  };
  spacing?: Record<string, string>;
  typography?: {
    fontFamilies?: Record<string, string>;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
    lineHeights?: Record<string, string>;
    letterSpacing?: Record<string, string>;
  };
  animations?: {
    keyframes?: Record<string, any>;
    transitions?: Record<string, string>;
  };
}

/**
 * Design System Style Configuration
 * 
 * Configuration for loading styles from setup folders
 */
export interface DesignSystemStyleConfig {
  setupFolder: string; // Path to setup folder
  cssFiles: string[]; // CSS files to import from setup folder
  jsFiles?: string[]; // JS files to import (if any)
  themeFiles?: string[]; // Theme CSS files
  typographyFile?: string; // Typography CSS file
  animationFile?: string; // Animation CSS file
  scoped?: boolean; // Whether to scope styles
  scopePrefix?: string; // CSS scope prefix (default: data-design-system)
}

/**
 * Design System Metadata
 * 
 * Complete metadata for a design system including components, themes, renderers, and styles
 */
export interface DesignSystemMetadata {
  id: string;
  label: string;
  description?: string;
  components: DesignSystemComponent[];
  getThemes: () => Array<{ id: string; label: string }>;
  applyTheme: (themeId: string) => void;
  getComponentPreview: (schema: ComponentSchema) => ReactNode;
  getSectionComponent: () => ComponentType<any>;
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
  loadStyles: () => Promise<void>; // Load and inject styles
  unloadStyles: () => void; // Remove styles
}
