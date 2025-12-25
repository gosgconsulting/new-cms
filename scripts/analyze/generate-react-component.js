import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate React component from component definition
 */
export async function generateReactComponent(componentDefinitionPath) {
  // Read component definition
  const componentDef = JSON.parse(readFileSync(componentDefinitionPath, 'utf-8'));
  
  // Determine component directory based on category
  const isLayoutComponent = componentDef.category === 'layout';
  const componentDir = isLayoutComponent
    ? join(__dirname, '../../sparti-cms/theme/gosgconsulting/components')
    : join(__dirname, '../../sparti-cms/theme/gosgconsulting/components');
  
  // Ensure directory exists
  if (!existsSync(componentDir)) {
    mkdirSync(componentDir, { recursive: true });
  }
  
  // Generate component file name
  const componentName = toPascalCase(componentDef.id);
  const componentFileName = `${componentName}.tsx`;
  const componentPath = join(componentDir, componentFileName);
  
  // Check if component already exists
  if (existsSync(componentPath)) {
    console.warn(`[testing] Component ${componentFileName} already exists, skipping...`);
    return { skipped: true, path: componentPath };
  }
  
  // Generate component code
  const componentCode = generateComponentCode(componentDef, componentName);
  
  // Write component file
  writeFileSync(componentPath, componentCode);
  console.log(`[testing] Created React component: ${componentPath}`);
  
  return {
    success: true,
    path: componentPath,
    componentName,
    fileName: componentFileName
  };
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Generate TypeScript interface for props
 */
function generatePropsInterface(componentDef) {
  const props = componentDef.properties || {};
  const propNames = Object.keys(props);
  
  if (propNames.length === 0) {
    return 'interface ' + toPascalCase(componentDef.id) + 'Props {\n  // No properties defined\n}';
  }
  
  let interfaceCode = `interface ${toPascalCase(componentDef.id)}Props {\n`;
  
  for (const [key, prop] of Object.entries(props)) {
    const tsType = mapToTypeScriptType(prop.type);
    const optional = prop.required ? '' : '?';
    const defaultValue = prop.default !== undefined ? ` = ${formatDefaultValue(prop.default)}` : '';
    
    interfaceCode += `  ${key}${optional}: ${tsType}${defaultValue ? `; // default: ${JSON.stringify(prop.default)}` : ''}\n`;
  }
  
  interfaceCode += '}';
  return interfaceCode;
}

/**
 * Map property type to TypeScript type
 */
function mapToTypeScriptType(type) {
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'any[]';
    case 'object':
      return 'Record<string, any>';
    default:
      return 'any';
  }
}

/**
 * Format default value for TypeScript
 */
function formatDefaultValue(value) {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "\\'")}'`;
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return '[]';
  }
  if (typeof value === 'object' && value !== null) {
    return '{}';
  }
  return 'undefined';
}

/**
 * Generate component JSX based on properties
 */
function generateComponentJSX(componentDef) {
  const props = componentDef.properties || {};
  const propNames = Object.keys(props);
  
  // Generate basic component structure
  let jsx = `  return (\n`;
  jsx += `    <section className="py-12 px-4">\n`;
  jsx += `      <div className="container mx-auto max-w-6xl">\n`;
  
  // Add content based on property types
  for (const [key, prop] of Object.entries(props)) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('title') || lowerKey.includes('heading') || lowerKey.includes('headline')) {
      jsx += `        {${key} && (\n`;
      jsx += `          <h2 className="text-3xl font-bold mb-6">{${key}}</h2>\n`;
      jsx += `        )}\n`;
    } else if (lowerKey.includes('description') || lowerKey.includes('text') || lowerKey.includes('content')) {
      jsx += `        {${key} && (\n`;
      jsx += `          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{${key}}</p>\n`;
      jsx += `        )}\n`;
    } else if (lowerKey.includes('image') || lowerKey.includes('img')) {
      jsx += `        {${key} && (\n`;
      jsx += `          <img src={${key}} alt="${key}" className="w-full h-auto rounded-lg" />\n`;
      jsx += `        )}\n`;
    } else if (lowerKey.includes('button') || lowerKey.includes('cta')) {
      jsx += `        {${key} && (\n`;
      jsx += `          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">\n`;
      jsx += `            {${key}}\n`;
      jsx += `          </button>\n`;
      jsx += `        )}\n`;
    } else if (prop.type === 'array') {
      jsx += `        {${key} && Array.isArray(${key}) && ${key}.length > 0 && (\n`;
      jsx += `          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n`;
      jsx += `            {${key}.map((item, index) => (\n`;
      jsx += `              <div key={index} className="p-4 border rounded-lg">\n`;
      jsx += `                {typeof item === 'string' ? item : JSON.stringify(item)}\n`;
      jsx += `              </div>\n`;
      jsx += `            ))}\n`;
      jsx += `          </div>\n`;
      jsx += `        )}\n`;
    }
  }
  
  // If no specific properties, add a generic content area
  if (propNames.length === 0) {
    jsx += `        <div className="text-center">\n`;
    jsx += `          <p className="text-gray-500">${componentDef.name} Component</p>\n`;
    jsx += `        </div>\n`;
  }
  
  jsx += `      </div>\n`;
  jsx += `    </section>\n`;
  jsx += `  );\n`;
  
  return jsx;
}

/**
 * Generate complete component code
 */
function generateComponentCode(componentDef, componentName) {
  const propsInterface = generatePropsInterface(componentDef);
  const jsx = generateComponentJSX(componentDef);
  
  // Get default props
  const defaultProps = generateDefaultProps(componentDef);
  
  let code = `import React from 'react';\n\n`;
  code += `${propsInterface}\n\n`;
  code += `const ${componentName}: React.FC<${toPascalCase(componentDef.id)}Props> = ({\n`;
  
  // Add props with defaults
  const props = componentDef.properties || {};
  const propEntries = Object.entries(props);
  
  if (propEntries.length > 0) {
    for (const [key, prop] of propEntries) {
      const defaultValue = prop.default !== undefined 
        ? formatDefaultValue(prop.default)
        : prop.type === 'array' ? '[]' : prop.type === 'object' ? '{}' : 'undefined';
      code += `  ${key}${prop.required ? '' : ` = ${defaultValue}`},\n`;
    }
  }
  
  code += `}) => {\n`;
  code += jsx;
  code += `};\n\n`;
  code += `export default ${componentName};\n`;
  
  return code;
}

/**
 * Generate default props object
 */
function generateDefaultProps(componentDef) {
  const props = componentDef.properties || {};
  const defaults = {};
  
  for (const [key, prop] of Object.entries(props)) {
    if (prop.default !== undefined) {
      defaults[key] = prop.default;
    }
  }
  
  return defaults;
}

/**
 * Generate React components for all component definitions
 */
export async function generateAllReactComponents(componentDefinitions) {
  console.log('[testing] ============================================');
  console.log('[testing] Generating React Components');
  console.log('[testing] ============================================');
  
  const results = [];
  
  for (const compDef of componentDefinitions) {
    try {
      // Find the component definition file
      const registryPath = join(__dirname, '../../sparti-cms/registry/components');
      const componentDefPath = join(registryPath, `${compDef.id}.json`);
      
      if (!existsSync(componentDefPath)) {
        console.warn(`[testing] Component definition not found: ${componentDefPath}`);
        results.push({
          componentId: compDef.id,
          error: 'Component definition file not found'
        });
        continue;
      }
      
      const result = await generateReactComponent(componentDefPath);
      results.push({
        componentId: compDef.id,
        ...result
      });
      
    } catch (error) {
      console.error(`[testing] Error generating React component for ${compDef.id}:`, error.message);
      results.push({
        componentId: compDef.id,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const skippedCount = results.filter(r => r.skipped).length;
  const errorCount = results.filter(r => r.error).length;
  
  console.log(`[testing] ============================================`);
  console.log(`[testing] React Component Generation Complete`);
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

