/**
 * Library Registry
 *
 * Registry of available design systems with metadata providers.
 * Design systems are now dynamically discovered and rendered.
 */

import {
  getFlowbiteMetadata,
} from "./designSystemProviders";
import type { DesignSystemMetadata } from "./designSystemMetadata";

export interface LibraryConfig {
  id: string;
  label: string;
  available: boolean;
  getMetadata: () => DesignSystemMetadata;
}

/**
 * Registry of available design systems
 */
export const libraryRegistry: LibraryConfig[] = [
  {
    id: "flowbite",
    label: "Flowbite",
    available: true,
    getMetadata: getFlowbiteMetadata,
  },
];

/**
 * Get library configuration by ID
 */
export function getLibraryById(id: string): LibraryConfig | undefined {
  return libraryRegistry.find((lib) => lib.id === id);
}

/**
 * Get all available libraries
 */
export function getAvailableLibraries(): LibraryConfig[] {
  return libraryRegistry.filter((lib) => lib.available);
}

/**
 * Get default library ID
 */
export function getDefaultLibraryId(): string {
  const available = getAvailableLibraries();
  return available.length > 0 ? available[0].id : "flowbite";
}