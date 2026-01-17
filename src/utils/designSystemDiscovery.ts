import type { ComponentSchema } from "../../sparti-cms/types/schema";
import type { DesignSystemComponent } from "../config/designSystemMetadata";

/**
 * Extract component name from filename
 * Example: "FlowbiteHeroSection.tsx" -> "Hero Section"
 * Example: "DaisyUIAboutSection.tsx" -> "About Section"
 */
export function extractComponentName(filename: string, designSystemPrefix: string): string {
  // Remove extension
  const withoutExt = filename.replace(/\.tsx?$/, "");
  
  // Remove design system prefix (e.g., "Flowbite" or "DaisyUI")
  const withoutPrefix = withoutExt.replace(new RegExp(`^${designSystemPrefix}`, "i"), "");
  
  // Remove "Section" suffix if present
  const withoutSuffix = withoutPrefix.replace(/Section$/, "");
  
  // Convert camelCase/PascalCase to "Title Case"
  // Split on capital letters and join with spaces
  const spaced = withoutSuffix.replace(/([A-Z])/g, " $1").trim();
  
  return spaced || withoutSuffix;
}

/**
 * Generate a default sample schema for a component based on its name
 */
export function generateSampleSchema(componentName: string, componentId: string, componentType: string): ComponentSchema {
  const nameLower = componentName.toLowerCase();
  
  // Base schema structure
  const baseSchema: ComponentSchema = {
    key: `${componentId}-section`,
    type: componentType,
    items: [],
  };

  // Add common fields based on component type
  if (nameLower.includes("hero")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "Welcome to Our Brand", level: 1 },
      { key: "description", type: "text", content: "Discover our amazing products and services" },
      { key: "cta", type: "button", content: "Get Started", link: "/contact" },
      { key: "image", type: "image", src: "/placeholder.svg", alt: "Hero image" },
    ];
  } else if (nameLower.includes("header") || nameLower.includes("navbar")) {
    baseSchema.items = [
      { key: "brandName", type: "text", content: "Brand Name" },
      { key: "menuItems", type: "array", items: [
        { label: "Home", link: "/" },
        { label: "About", link: "/about" },
        { label: "Services", link: "/services" },
      ]},
      { key: "cta", type: "button", content: "Contact", link: "/contact" },
    ];
  } else if (nameLower.includes("footer")) {
    baseSchema.items = [
      { key: "brandName", type: "text", content: "Brand Name" },
      { key: "description", type: "text", content: "Your company description here" },
      { key: "sections", type: "array", items: [
        { title: "Links", links: [{ label: "About", link: "/about" }, { label: "Contact", link: "/contact" }] },
      ]},
      { key: "copyright", type: "text", content: "© 2024 All rights reserved." },
    ];
  } else if (nameLower.includes("feature")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "Key Features", level: 2 },
      { key: "subtitle", type: "text", content: "What makes us special" },
      {
        key: "features",
        type: "array",
        items: [
          { title: "Feature One", description: "Description here", image: "/placeholder.svg" },
          { title: "Feature Two", description: "Description here", image: "/placeholder.svg" },
        ],
      },
    ];
  } else if (nameLower.includes("card")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "Our Cards", level: 2 },
      {
        key: "cards",
        type: "array",
        items: [
          { title: "Card One", description: "Card description", image: "/placeholder.svg", button: { content: "Learn More", link: "#" } },
          { title: "Card Two", description: "Card description", image: "/placeholder.svg", button: { content: "Learn More", link: "#" } },
        ],
      },
    ];
  } else if (nameLower.includes("cta") || nameLower.includes("call")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "Ready to Get Started?", level: 2 },
      { key: "description", type: "text", content: "Join thousands of satisfied customers today." },
      { key: "cta", type: "button", content: "Get Started", link: "/signup" },
    ];
  } else if (nameLower.includes("testimonial") || nameLower.includes("review")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "What Our Clients Say", level: 2 },
      {
        key: "testimonials",
        type: "array",
        items: [
          { text: "Great service!", name: "John Doe", role: "CEO", image: "/placeholder.svg" },
          { text: "Highly recommended!", name: "Jane Smith", role: "CTO", image: "/placeholder.svg" },
        ],
      },
    ];
  } else if (nameLower.includes("faq")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "Frequently Asked Questions", level: 2 },
      {
        key: "faqItems",
        type: "array",
        items: [
          { question: "What is this?", answer: "This is an answer." },
          { question: "How does it work?", answer: "It works great!" },
        ],
      },
    ];
  } else if (nameLower.includes("service")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "Our Services", level: 2 },
      {
        key: "services",
        type: "array",
        items: [
          { title: "Service One", description: "Service description", image: "/placeholder.svg" },
          { title: "Service Two", description: "Service description", image: "/placeholder.svg" },
        ],
      },
    ];
  } else if (nameLower.includes("about")) {
    baseSchema.items = [
      { key: "title", type: "heading", content: "About Us", level: 2 },
      { key: "description", type: "text", content: "Learn more about our company and mission" },
      { key: "image", type: "image", src: "/placeholder.svg", alt: "About image" },
    ];
  } else {
    // Default schema for unknown component types
    baseSchema.items = [
      { key: "title", type: "heading", content: componentName, level: 2 },
      { key: "description", type: "text", content: `${componentName} component description` },
    ];
  }

  return baseSchema;
}

/**
 * Discover components from a design system's components directory
 * 
 * @param componentFiles - Array of component filenames (e.g., ["FlowbiteHeroSection.tsx", ...])
 * @param designSystemPrefix - Prefix to remove from filenames (e.g., "Flowbite" or "DaisyUI")
 * @param basePath - Base path for component files (e.g., "flowbite/components" or "daisyui/components")
 * @returns Array of discovered component metadata
 */
export function discoverComponents(
  componentFiles: string[],
  designSystemPrefix: string,
  basePath: string
): DesignSystemComponent[] {
  const components: DesignSystemComponent[] = [];

  for (const filename of componentFiles) {
    // Skip base Section component and non-Section components
    if (filename.includes("Section.tsx") && !filename.match(new RegExp(`^${designSystemPrefix}Section\\.tsx$`, "i"))) {
      const componentName = extractComponentName(filename, designSystemPrefix);
      const componentId = componentName.toLowerCase().replace(/\s+/g, "-");
      const componentType = componentName.replace(/\s+/g, "") + "Section";
      
      const component: DesignSystemComponent = {
        id: componentId,
        name: componentName,
        description: `${componentName} component using ${designSystemPrefix} design system`,
        sampleSchema: generateSampleSchema(componentName, componentId, componentType),
        componentFile: `src/libraries/${basePath}/${filename}`,
      };

      components.push(component);
    }
  }

  return components;
}

/**
 * Get component files for a design system
 * This is a helper that would be used with a build-time or runtime file listing
 * For now, we'll pass the files explicitly from the metadata providers
 */
export function getComponentFiles(designSystemId: string): string[] {
  // This would ideally scan the file system, but for now we'll rely on
  // explicit file lists passed to discoverComponents
  // In a build environment, this could use Vite's import.meta.glob
  return [];
}
