/**
 * Library Registry
 *
 * Registry of available design systems with metadata providers.
 * Design systems are now dynamically discovered and rendered.
 */

import {
  getFlowbiteMetadata,
  getDaisyUIMetadata,
  getFlyonUIMetadata,
  getHyperUIMetadata,
  getPrelineMetadata,
  getTailgridsMetadata,
  getUIMainMetadata,
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
  {
    id: "daisyui",
    label: "DaisyUI",
    available: true,
    getMetadata: getDaisyUIMetadata,
  },
  {
    id: "flyonui",
    label: "FlyonUI",
    available: true,
    getMetadata: getFlyonUIMetadata,
  },
  {
    id: "hyperui",
    label: "HyperUI",
    available: true,
    getMetadata: getHyperUIMetadata,
  },
  {
    id: "preline",
    label: "Preline",
    available: true,
    getMetadata: getPrelineMetadata,
  },
  {
    id: "tailgrids",
    label: "Tailgrids",
    available: true,
    getMetadata: getTailgridsMetadata,
  },
  {
    id: "ui-main",
    label: "UI Main",
    available: true,
    getMetadata: getUIMainMetadata,
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