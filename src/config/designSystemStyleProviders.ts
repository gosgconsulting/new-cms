import type {
  DesignSystemTechStack,
  DesignSystemStyles,
  DesignSystemStyleConfig,
} from "./designSystemMetadata";

/**
 * Design System Style Providers
 * 
 * Style configurations for each design system
 * Note: Design systems work independently and use npm packages, not setup folders
 */

/**
 * Flowbite React Style Configuration
 */
export function getFlowbiteStyleConfig(): {
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
} {
  return {
    techStack: {
      cssFrameworks: ["tailwindcss"],
      jsLibraries: ["flowbite"],
      requires: ["flowbite", "flowbite-react"],
      tailwindPlugins: ["flowbite/plugin"],
    },
    styles: {
      colors: {
        primary: "blue",
        secondary: "gray",
      },
      typography: {
        fontFamilies: {
          body: "Inter, sans-serif",
        },
      },
    },
    styleConfig: {
      setupFolder: "", // Not used - Flowbite CSS loaded from npm package
      cssFiles: [], // Flowbite CSS loaded from npm package
      themeFiles: [], // Themes in src/styles/flowbite/
      scoped: true,
      scopePrefix: "data-design-system",
    },
  };
}

