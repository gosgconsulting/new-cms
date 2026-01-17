/**
 * DaisyUI Library Metadata Provider
 * 
 * This file is kept for backward compatibility.
 * The actual metadata is provided by getDaisyUIMetadata() in designSystemProviders.ts
 */

import { getDaisyUIMetadata } from "../../config/designSystemProviders";

/**
 * Export DaisyUI metadata function
 * This maintains backward compatibility while using the new metadata system
 */
export { getDaisyUIMetadata };

// Default export for backward compatibility (not used in new system)
export default function DaisyUILibrary() {
  return null;
}

