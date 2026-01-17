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

/**
 * DaisyUI Style Configuration
 */
export function getDaisyUIStyleConfig(): {
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
} {
  return {
    techStack: {
      cssFrameworks: ["tailwindcss", "daisyui"],
      requires: ["daisyui"],
      tailwindPlugins: ["daisyui"],
    },
    styles: {
      colors: {
        primary: "oklch(var(--color-primary))",
        secondary: "oklch(var(--color-secondary))",
      },
    },
    styleConfig: {
      setupFolder: "", // Not used - DaisyUI CSS loaded via Tailwind plugin
      cssFiles: [], // DaisyUI CSS loaded via Tailwind plugin
      scoped: true,
      scopePrefix: "data-design-system",
    },
  };
}

/**
 * FlyonUI Style Configuration
 */
export function getFlyonUIStyleConfig(): {
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
} {
  return {
    techStack: {
      cssFrameworks: ["tailwindcss"],
      requires: ["flyonui"],
      tailwindPlugins: [],
    },
    styles: {
      colors: {
        primary: "oklch(var(--color-primary))",
        secondary: "oklch(var(--color-secondary))",
      },
    },
    styleConfig: {
      setupFolder: "", // Not used - FlyonUI CSS loaded from npm package
      cssFiles: [], // FlyonUI CSS loaded from npm package
      themeFiles: [], // Themes handled via npm package
      scoped: true,
      scopePrefix: "data-design-system",
    },
  };
}

/**
 * HyperUI Style Configuration
 */
export function getHyperUIStyleConfig(): {
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
} {
  return {
    techStack: {
      cssFrameworks: ["tailwindcss"],
      requires: [],
      tailwindPlugins: ["@tailwindcss/forms", "@tailwindcss/typography"],
    },
    styles: {
      typography: {
        fontFamilies: {
          sans: "Inter, sans-serif",
        },
      },
    },
    styleConfig: {
      setupFolder: "", // Not used - HyperUI uses Tailwind CSS only
      cssFiles: [], // HyperUI uses Tailwind CSS only, no custom CSS files needed
      scoped: true,
      scopePrefix: "data-design-system",
    },
  };
}

/**
 * Preline Style Configuration
 */
export function getPrelineStyleConfig(): {
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
} {
  return {
    techStack: {
      cssFrameworks: ["tailwindcss"],
      jsLibraries: ["preline"],
      requires: ["preline"],
      tailwindPlugins: [],
    },
    styles: {},
    styleConfig: {
      setupFolder: "", // Not used - Preline CSS loaded from npm package
      cssFiles: [], // Preline CSS loaded from npm package
      jsFiles: [], // JS plugins loaded from npm package
      scoped: true,
      scopePrefix: "data-design-system",
    },
  };
}

/**
 * Tailgrids Style Configuration
 */
export function getTailgridsStyleConfig(): {
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
} {
  return {
    techStack: {
      cssFrameworks: ["tailwindcss"],
      requires: [],
      tailwindPlugins: [],
    },
    styles: {},
    styleConfig: {
      setupFolder: "", // Not used - Tailgrids uses Tailwind CSS only
      cssFiles: [], // Tailgrids uses Tailwind CSS only, no custom CSS files
      scoped: true,
      scopePrefix: "data-design-system",
    },
  };
}

/**
 * UI Main Style Configuration
 */
export function getUIMainStyleConfig(): {
  techStack: DesignSystemTechStack;
  styles: DesignSystemStyles;
  styleConfig: DesignSystemStyleConfig;
} {
  return {
    techStack: {
      cssFrameworks: ["tailwindcss", "shadcn/ui"],
      requires: ["tw-animate-css", "shadcn"],
      tailwindPlugins: [],
    },
    styles: {
      typography: {
        fontFamilies: {
          sans: "var(--font-sans)",
          mono: "var(--font-mono)",
        },
      },
    },
    styleConfig: {
      setupFolder: "", // Not used - UI Main CSS loaded from npm packages
      cssFiles: [], // UI Main CSS loaded from npm packages
      scoped: true,
      scopePrefix: "data-design-system",
    },
  };
}
