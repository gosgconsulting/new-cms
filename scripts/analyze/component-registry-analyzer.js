import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Scan and analyze all component definitions in the registry
 */
export async function analyzeComponentRegistry() {
  console.log('[testing] ============================================');
  console.log('[testing] Starting Component Registry Analysis');
  console.log('[testing] ============================================');
  
  const registryPath = join(__dirname, '../../sparti-cms/registry/components');
  
  try {
    // Read all JSON files in the components directory
    const files = readdirSync(registryPath).filter(file => file.endsWith('.json'));
    console.log(`[testing] Found ${files.length} component definition files`);
    
    const components = new Map();
    const componentsByType = new Map();
    const componentsByCategory = new Map();
    
    // Process each component file
    for (const file of files) {
      try {
        const filePath = join(registryPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const component = JSON.parse(content);
        
        // Validate required fields
        if (!component.id) {
          console.warn(`[testing] Component in ${file} is missing 'id' field`);
          continue;
        }
        
        if (!component.type) {
          console.warn(`[testing] Component ${component.id} is missing 'type' field`);
          continue;
        }
        
        // Store component by ID
        components.set(component.id, {
          id: component.id,
          name: component.name || component.id,
          type: component.type,
          category: component.category || 'unknown',
          editor: component.editor,
          version: component.version || '1.0.0',
          tenant_scope: component.tenant_scope || 'tenant',
          properties: component.properties || {},
          tags: component.tags || [],
          description: component.description || '',
          file: file
        });
        
        // Index by type
        if (!componentsByType.has(component.type)) {
          componentsByType.set(component.type, []);
        }
        componentsByType.get(component.type).push(component.id);
        
        // Index by category
        const category = component.category || 'unknown';
        if (!componentsByCategory.has(category)) {
          componentsByCategory.set(category, []);
        }
        componentsByCategory.get(category).push(component.id);
        
      } catch (error) {
        console.error(`[testing] Error parsing component file ${file}:`, error.message);
      }
    }
    
    // Convert to array format
    const componentsArray = Array.from(components.values());
    
    // Build summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalComponents: componentsArray.length,
      componentsByType: Object.fromEntries(
        Array.from(componentsByType.entries()).map(([type, ids]) => [type, ids.length])
      ),
      componentsByCategory: Object.fromEntries(
        Array.from(componentsByCategory.entries()).map(([category, ids]) => [category, ids.length])
      ),
      components: componentsArray.map(comp => ({
        id: comp.id,
        name: comp.name,
        type: comp.type,
        category: comp.category,
        editor: comp.editor,
        version: comp.version,
        tenant_scope: comp.tenant_scope,
        propertyCount: Object.keys(comp.properties).length,
        tagCount: comp.tags.length,
        file: comp.file
      })),
      // Create lookup maps
      byId: Object.fromEntries(componentsArray.map(comp => [comp.id, comp])),
      byType: Object.fromEntries(componentsByType),
      byCategory: Object.fromEntries(componentsByCategory),
      // Create type mapping (component type -> component IDs)
      typeToIds: Object.fromEntries(componentsByType)
    };
    
    console.log(`[testing] ============================================`);
    console.log(`[testing] Registry Analysis Complete`);
    console.log(`[testing] Total components: ${summary.totalComponents}`);
    console.log(`[testing] Component types: ${Object.keys(summary.componentsByType).length}`);
    console.log(`[testing] Categories: ${Object.keys(summary.componentsByCategory).length}`);
    console.log(`[testing] ============================================`);
    
    return summary;
    
  } catch (error) {
    console.error('[testing] Error analyzing component registry:', error);
    throw error;
  }
}

/**
 * Get component by ID from registry
 */
export function getComponentById(registrySummary, componentId) {
  return registrySummary.byId[componentId] || null;
}

/**
 * Get components by type from registry
 */
export function getComponentsByType(registrySummary, componentType) {
  const ids = registrySummary.byType[componentType] || [];
  return ids.map(id => registrySummary.byId[id]).filter(Boolean);
}

/**
 * Check if a component type exists in registry
 */
export function hasComponentType(registrySummary, componentType) {
  return componentType in registrySummary.typeToIds;
}

/**
 * Get all component types from registry
 */
export function getAllComponentTypes(registrySummary) {
  return Object.keys(registrySummary.typeToIds);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeComponentRegistry()
    .then(result => {
      console.log('\n[testing] Registry Analysis Results:');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('[testing] Registry analysis failed:', error);
      process.exit(1);
    });
}

