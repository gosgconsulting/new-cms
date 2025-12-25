import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate component definition JSON file from missing component data
 */
export async function generateComponentDefinition(missingComponent) {
  const registryPath = join(__dirname, '../../sparti-cms/registry/components');
  
  // Ensure directory exists
  if (!existsSync(registryPath)) {
    mkdirSync(registryPath, { recursive: true });
  }
  
  // Generate component ID
  const componentId = missingComponent.recommendedId || generateComponentId(missingComponent.type);
  
  // Check if component already exists
  const componentPath = join(registryPath, `${componentId}.json`);
  if (existsSync(componentPath)) {
    console.warn(`[testing] Component ${componentId}.json already exists, skipping...`);
    return { skipped: true, path: componentPath };
  }
  
  // Build component definition
  const componentDefinition = {
    id: componentId,
    name: generateComponentName(missingComponent.type),
    type: missingComponent.type,
    category: missingComponent.recommendedCategory || 'content',
    description: generateDescription(missingComponent.type, missingComponent.inferredProperties),
    properties: normalizeProperties(missingComponent.inferredProperties),
    editor: missingComponent.recommendedEditor || 'ContainerEditor',
    version: '1.0.0',
    tenant_scope: determineTenantScope(missingComponent.tenantCount),
    tags: generateTags(missingComponent.type, missingComponent.recommendedCategory),
    last_updated: new Date().toISOString()
  };
  
  // Write component definition file
  writeFileSync(componentPath, JSON.stringify(componentDefinition, null, 2));
  console.log(`[testing] Created component definition: ${componentPath}`);
  
  return {
    success: true,
    path: componentPath,
    component: componentDefinition
  };
}

/**
 * Generate component ID from type
 */
function generateComponentId(type) {
  return type
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Generate component name from type
 */
function generateComponentName(type) {
  // Convert type to readable name
  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Generate description from type and properties
 */
function generateDescription(type, properties) {
  const propCount = Object.keys(properties || {}).length;
  return `${generateComponentName(type)} component with ${propCount} configurable properties`;
}

/**
 * Normalize properties to match schema
 */
function normalizeProperties(inferredProperties) {
  const normalized = {};
  
  for (const [key, prop] of Object.entries(inferredProperties || {})) {
    normalized[key] = {
      type: prop.type || 'string',
      description: prop.description || `Property: ${key}`,
      editable: prop.editable !== false,
      required: prop.required || false
    };
    
    // Add default if provided and not null/undefined
    if (prop.default !== null && prop.default !== undefined) {
      // Only include simple defaults (not complex objects/arrays)
      if (typeof prop.default === 'string' || 
          typeof prop.default === 'number' || 
          typeof prop.default === 'boolean') {
        normalized[key].default = prop.default;
      } else if (Array.isArray(prop.default) && prop.default.length === 0) {
        normalized[key].default = [];
      }
    }
  }
  
  return normalized;
}

/**
 * Determine tenant scope based on usage
 */
function determineTenantScope(tenantCount) {
  // If used by multiple tenants, make it global
  // Otherwise, tenant-specific
  return tenantCount > 1 ? 'global' : 'tenant';
}

/**
 * Generate tags from type and category
 */
function generateTags(type, category) {
  const tags = [];
  
  // Add category as tag
  if (category) {
    tags.push(category);
  }
  
  // Extract keywords from type
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('hero') || lowerType.includes('banner')) {
    tags.push('hero', 'banner');
  }
  
  if (lowerType.includes('header') || lowerType.includes('nav')) {
    tags.push('navigation', 'header');
  }
  
  if (lowerType.includes('footer')) {
    tags.push('footer', 'layout');
  }
  
  if (lowerType.includes('image') || lowerType.includes('gallery')) {
    tags.push('media', 'image');
  }
  
  if (lowerType.includes('button') || lowerType.includes('cta')) {
    tags.push('cta', 'button');
  }
  
  if (lowerType.includes('form')) {
    tags.push('form', 'input');
  }
  
  if (lowerType.includes('text') || lowerType.includes('content')) {
    tags.push('content', 'text');
  }
  
  // Add type as tag if not already included
  if (!tags.includes(type.toLowerCase())) {
    tags.push(type.toLowerCase());
  }
  
  return tags;
}

/**
 * Generate component definitions for all missing components
 */
export async function generateAllComponentDefinitions(missingComponentsReport) {
  console.log('[testing] ============================================');
  console.log('[testing] Generating Component Definitions');
  console.log('[testing] ============================================');
  
  const results = [];
  
  for (const missingComponent of missingComponentsReport.missingComponents || []) {
    try {
      const result = await generateComponentDefinition(missingComponent);
      results.push({
        componentType: missingComponent.type,
        ...result
      });
    } catch (error) {
      console.error(`[testing] Error generating component for ${missingComponent.type}:`, error.message);
      results.push({
        componentType: missingComponent.type,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const skippedCount = results.filter(r => r.skipped).length;
  const errorCount = results.filter(r => r.error).length;
  
  console.log(`[testing] ============================================`);
  console.log(`[testing] Component Definition Generation Complete`);
  console.log(`[testing] Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
  console.log(`[testing] ============================================`);
  
  return {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      success: successCount,
      skipped: skippedCount,
      errors: errorCount
    }
  };
}

// Run if called directly (for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[testing] This script should be called from the orchestrator');
  process.exit(1);
}

