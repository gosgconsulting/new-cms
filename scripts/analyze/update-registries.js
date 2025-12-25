import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Update the component registry index.ts to include newly created components
 */
export async function updateRegistryIndex() {
  console.log('[testing] ============================================');
  console.log('[testing] Updating Component Registry Index');
  console.log('[testing] ============================================');
  
  const registryPath = join(__dirname, '../../sparti-cms/registry');
  const componentsPath = join(registryPath, 'components');
  const indexPath = join(registryPath, 'index.ts');
  
  // Read all component JSON files
  const componentFiles = readdirSync(componentsPath)
    .filter(file => file.endsWith('.json'))
    .sort();
  
  console.log(`[testing] Found ${componentFiles.length} component definition files`);
  
  // Read existing index.ts
  const existingIndex = readFileSync(indexPath, 'utf-8');
  
  // Extract existing imports to avoid duplicates
  const existingImports = new Set();
  const importRegex = /import (\w+)Component from '\.\/components\/(\w+)\.json';/g;
  let match;
  while ((match = importRegex.exec(existingIndex)) !== null) {
    existingImports.add(match[2]); // component file name without .json
  }
  
  // Generate new imports for components not yet imported
  const newImports = [];
  const componentNames = [];
  
  for (const file of componentFiles) {
    const componentName = file.replace('.json', '');
    
    if (!existingImports.has(componentName)) {
      // Generate import variable name
      const importVarName = `${componentName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Component`;
      newImports.push(`import ${importVarName} from './components/${componentName}.json';`);
      
      // Read component to get its category for grouping
      try {
        const componentDef = JSON.parse(readFileSync(join(componentsPath, file), 'utf-8'));
        componentNames.push({
          name: componentName,
          importVar: importVarName,
          category: componentDef.category || 'content',
          id: componentDef.id
        });
      } catch (error) {
        console.warn(`[testing] Could not read component ${file}:`, error.message);
      }
    } else {
      // Component already imported, just track it
      const importVarName = `${componentName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Component`;
      componentNames.push({
        name: componentName,
        importVar: importVarName,
        category: 'existing',
        id: componentName
      });
    }
  }
  
  if (newImports.length === 0) {
    console.log('[testing] No new components to add to registry index');
    return { updated: false, newComponents: 0 };
  }
  
  console.log(`[testing] Found ${newImports.length} new components to add`);
  
  // Find insertion point (after existing imports, before class definition)
  const classIndex = existingIndex.indexOf('class ComponentRegistry');
  if (classIndex === -1) {
    throw new Error('Could not find ComponentRegistry class in index.ts');
  }
  
  // Find the last import statement
  const lastImportIndex = existingIndex.lastIndexOf('import ', classIndex);
  const lastImportLineEnd = existingIndex.indexOf('\n', lastImportIndex);
  
  // Insert new imports
  const beforeImports = existingIndex.substring(0, lastImportLineEnd + 1);
  const afterImports = existingIndex.substring(lastImportLineEnd + 1);
  
  const newImportsText = newImports.length > 0 ? '\n// Import auto-generated components\n' + newImports.join('\n') + '\n' : '';
  const updatedIndex = beforeImports + newImportsText + afterImports;
  
  // Now update the loadLocalComponents method to include new components
  // Find the gosgComponents array
  const componentsArrayStart = updatedIndex.indexOf('const gosgComponents = [');
  const componentsArrayEnd = updatedIndex.indexOf('];', componentsArrayStart);
  
  if (componentsArrayStart === -1 || componentsArrayEnd === -1) {
    throw new Error('Could not find gosgComponents array in index.ts');
  }
  
  const beforeArray = updatedIndex.substring(0, componentsArrayEnd);
  const afterArray = updatedIndex.substring(componentsArrayEnd);
  
  // Group components by category
  const categorized = {
    layout: componentNames.filter(c => c.category === 'layout'),
    content: componentNames.filter(c => c.category === 'content'),
    media: componentNames.filter(c => c.category === 'media'),
    interactive: componentNames.filter(c => c.category === 'interactive'),
    form: componentNames.filter(c => c.category === 'form'),
    other: componentNames.filter(c => !['layout', 'content', 'media', 'interactive', 'form'].includes(c.category))
  };
  
  // Generate component list entries
  const newComponentEntries = [];
  for (const comp of componentNames) {
    if (comp.category !== 'existing') {
      newComponentEntries.push(`      ${comp.importVar} as ComponentDefinition,`);
    }
  }
  
  // Insert new components before the closing bracket
  const newArrayContent = beforeArray + 
    (newComponentEntries.length > 0 ? '\n      // Auto-generated components\n' + newComponentEntries.join('\n') : '') +
    afterArray;
  
  // Write updated index.ts
  writeFileSync(indexPath, newArrayContent);
  console.log(`[testing] Updated registry index.ts with ${newImports.length} new components`);
  
  return {
    updated: true,
    newComponents: newImports.length,
    components: componentNames.filter(c => c.category !== 'existing')
  };
}

/**
 * Update the theme component registry
 */
export async function updateThemeRegistry() {
  console.log('[testing] ============================================');
  console.log('[testing] Updating Theme Component Registry');
  console.log('[testing] ============================================');
  
  const themePath = join(__dirname, '../../sparti-cms/theme/gosgconsulting/components');
  const registryPath = join(themePath, 'registry.ts');
  
  // Read all component files
  const componentFiles = readdirSync(themePath)
    .filter(file => file.endsWith('.tsx') && file !== 'registry.ts')
    .sort();
  
  console.log(`[testing] Found ${componentFiles.length} component files`);
  
  // Read existing registry
  const existingRegistry = readFileSync(registryPath, 'utf-8');
  
  // Extract existing imports
  const existingImports = new Set();
  const importRegex = /import (\w+) from '\.\/(\w+)';/g;
  let match;
  while ((match = importRegex.exec(existingRegistry)) !== null) {
    existingImports.add(match[2]); // component file name without extension
  }
  
  // Find new components
  const newImports = [];
  const newComponents = [];
  
  for (const file of componentFiles) {
    const componentName = file.replace('.tsx', '');
    const pascalName = componentName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    if (!existingImports.has(componentName)) {
      newImports.push(`import ${pascalName} from './${componentName}';`);
      newComponents.push({
        name: componentName,
        pascalName,
        importVar: pascalName
      });
    }
  }
  
  if (newImports.length === 0) {
    console.log('[testing] No new components to add to theme registry');
    return { updated: false, newComponents: 0 };
  }
  
  console.log(`[testing] Found ${newImports.length} new components to add`);
  
  // Find insertion point for imports (after existing imports, before registry object)
  const registryObjectIndex = existingRegistry.indexOf('export const componentRegistry');
  if (registryObjectIndex === -1) {
    throw new Error('Could not find componentRegistry object in registry.ts');
  }
  
  const lastImportIndex = existingRegistry.lastIndexOf('import ', registryObjectIndex);
  const lastImportLineEnd = existingRegistry.indexOf('\n', lastImportIndex);
  
  // Insert new imports
  const beforeImports = existingRegistry.substring(0, lastImportLineEnd + 1);
  const afterImports = existingRegistry.substring(lastImportLineEnd + 1);
  
  const newImportsText = newImports.length > 0 ? '\n// Auto-generated component imports\n' + newImports.join('\n') + '\n' : '';
  const updatedRegistry = beforeImports + newImportsText + afterImports;
  
  // Find componentRegistry object and add new components
  const registryStart = updatedRegistry.indexOf('export const componentRegistry = {');
  const registryEnd = updatedRegistry.indexOf('};', registryStart);
  
  if (registryStart === -1 || registryEnd === -1) {
    throw new Error('Could not find componentRegistry object boundaries');
  }
  
  const beforeRegistry = updatedRegistry.substring(0, registryEnd);
  const afterRegistry = updatedRegistry.substring(registryEnd);
  
  // Generate component entries
  const newEntries = newComponents.map(comp => {
    // Determine category based on component name
    const lowerName = comp.name.toLowerCase();
    let category = '  // Other components';
    
    if (lowerName.includes('hero') || lowerName.includes('banner')) {
      category = '  // Hero components';
    } else if (lowerName.includes('header') || lowerName.includes('footer') || lowerName.includes('nav')) {
      category = '  // Layout components';
    } else if (lowerName.includes('simple')) {
      category = '  // Simple components';
    } else if (lowerName.includes('ui')) {
      category = '  // UI components';
    }
    
    return `  ${comp.pascalName},`;
  });
  
  // Group by category (simplified - just add at the end)
  const newRegistryContent = beforeRegistry + 
    (newEntries.length > 0 ? '\n  // Auto-generated components\n' + newEntries.join('\n') : '') +
    afterRegistry;
  
  // Write updated registry
  writeFileSync(registryPath, newRegistryContent);
  console.log(`[testing] Updated theme registry.ts with ${newImports.length} new components`);
  
  return {
    updated: true,
    newComponents: newImports.length,
    components: newComponents
  };
}

/**
 * Update both registries
 */
export async function updateAllRegistries() {
  const results = {
    registryIndex: await updateRegistryIndex(),
    themeRegistry: await updateThemeRegistry()
  };
  
  console.log('[testing] ============================================');
  console.log('[testing] Registry Updates Complete');
  console.log(`[testing] Registry Index: ${results.registryIndex.newComponents || 0} new components`);
  console.log(`[testing] Theme Registry: ${results.themeRegistry.newComponents || 0} new components`);
  console.log('[testing] ============================================');
  
  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAllRegistries()
    .then(() => {
      console.log('[testing] Registry updates completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('[testing] Registry updates failed:', error);
      process.exit(1);
    });
}

