/**
 * Library Registry
 * Centralized configuration for design libraries
 */

import FlowbiteLibrary from "../components/visual-builder/FlowbiteLibrary";
import ACATRLibrary from "../components/visual-builder/ACATRLibrary";
import GOSGConsultingLibrary from "../components/visual-builder/GOSGConsultingLibrary";
import SpartiLibrary from "../components/visual-builder/SpartiLibrary";
import type { ComponentType } from "react";

export interface LibraryConfig {
  id: string;
  label: string;
  available: boolean;
  component?: ComponentType;
}

/**
 * Registry of all available design libraries
 */
export const libraryRegistry: LibraryConfig[] = [
  {
    id: "flowbite",
    label: "Flowbite",
    available: true,
    component: FlowbiteLibrary,
  },
  {
    id: "acatr",
    label: "ACATR",
    available: true,
    component: ACATRLibrary,
  },
  {
    id: "gosgconsulting",
    label: "GO SG CONSULTING",
    available: true,
    component: GOSGConsultingLibrary,
  },
  {
    id: "sparti",
    label: "Sparti",
    available: true,
    component: SpartiLibrary,
  },
  // Future libraries (enable once implemented):
  // {
  //   id: "landingpage",
  //   label: "Landing Page",
  //   available: false,
  // },
  // {
  //   id: "custom",
  //   label: "Custom",
  //   available: false,
  // },
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

