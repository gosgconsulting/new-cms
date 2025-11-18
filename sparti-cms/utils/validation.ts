/**
 * Validation utility functions for PageEditor
 */

export const validateComponents = (components: unknown): boolean => {
  return Array.isArray(components);
};

export const validateJSON = (jsonString: string): { valid: boolean; error?: string } => {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON format.' 
    };
  }
};

export const validatePageData = (pageData: unknown): pageData is Record<string, unknown> => {
  return pageData !== null && typeof pageData === 'object';
};

