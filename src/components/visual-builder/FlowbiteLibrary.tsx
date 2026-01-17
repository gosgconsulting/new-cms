/**
 * Flowbite Library Metadata Provider
 * 
 * This file is kept for backward compatibility.
 * The actual metadata is provided by getFlowbiteMetadata() in designSystemProviders.ts
 */

import { getFlowbiteMetadata } from "../../config/designSystemProviders";

/**
 * Export Flowbite metadata function
 * This maintains backward compatibility while using the new metadata system
 */
export { getFlowbiteMetadata };

// Default export for backward compatibility (not used in new system)
export default function FlowbiteLibrary() {
  return null;
}