/**
 * Component Key Mapper
 * Maps component IDs to schema keys used per-tenant
 * Configurable per library for flexibility
 */

export type LibraryId = "flowbite" | "acatr" | "gosgconsulting" | "sparti" | string;

/**
 * Default component key mappings
 * Maps registry component IDs to schema keys used in tenant databases
 */
const DEFAULT_MAPPINGS: Record<string, string> = {
  header: "header",
  footer: "footer",
  hero: "hero",
  services: "services",
  features: "features",
  ingredients: "ingredients",
  team: "team",
  about: "about",
};

/**
 * Library-specific component key mappings
 * Override default mappings for specific libraries
 */
const LIBRARY_MAPPINGS: Record<string, Record<string, string>> = {
  flowbite: {
    ...DEFAULT_MAPPINGS,
    // Flowbite-specific mappings can be added here
  },
  // Add other library-specific mappings as needed
};

/**
 * Normalize component ID to schema key
 * @param componentId - The component ID from registry
 * @param libraryId - Optional library ID for library-specific mappings
 * @returns The normalized component key
 */
export function getComponentKey(componentId: string, libraryId?: LibraryId): string {
  const s = componentId.toLowerCase();
  
  // Check library-specific mappings first
  if (libraryId && LIBRARY_MAPPINGS[libraryId]) {
    for (const [key, value] of Object.entries(LIBRARY_MAPPINGS[libraryId])) {
      if (s.includes(key)) {
        return value;
      }
    }
  }
  
  // Fall back to default mappings
  for (const [key, value] of Object.entries(DEFAULT_MAPPINGS)) {
    if (s.includes(key)) {
      return value;
    }
  }
  
  // If no mapping found, return the original ID (lowercased)
  return s;
}

/**
 * Get all available component key mappings for a library
 */
export function getMappingsForLibrary(libraryId?: LibraryId): Record<string, string> {
  if (libraryId && LIBRARY_MAPPINGS[libraryId]) {
    return LIBRARY_MAPPINGS[libraryId];
  }
  return DEFAULT_MAPPINGS;
}

