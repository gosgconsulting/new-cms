import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { analyzeAllTenantComponents } from './analyze-tenant-components.js';
import { analyzeComponentRegistry, getAllComponentTypes, hasComponentType } from './component-registry-analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Compare database component usage with registry and identify missing components
 */
export async function generateMissingComponentsReport() {
  console.log('[testing] ============================================');
  console.log('[testing] Generating Missing Components Report');
  console.log('[testing] ============================================');
  
  try {
    // Run both analyses
    console.log('[testing] Analyzing database component usage...');
    const dbAnalysis = await analyzeAllTenantComponents();
    
    console.log('[testing] Analyzing component registry...');
    const registryAnalysis = await analyzeComponentRegistry();
    
    // Extract component types from database
    const dbComponentTypes = new Set(
      dbAnalysis.components.map(comp => comp.type)
    );
    
    // Extract component types from registry
    const registryComponentTypes = new Set(
      getAllComponentTypes(registryAnalysis)
    );
    
    // Find missing components (used in DB but not in registry)
    const missingComponentTypes = Array.from(dbComponentTypes).filter(
      type => !hasComponentType(registryAnalysis, type)
    );
    
    // Find components in registry but not used in DB
    const unusedComponentTypes = Array.from(registryComponentTypes).filter(
      type => !dbComponentTypes.has(type)
    );
    
    // Build detailed missing components report
    const missingComponents = missingComponentTypes.map(componentType => {
      const dbComponent = dbAnalysis.components.find(c => c.type === componentType);
      
      // Analyze props from samples to infer structure
      const allProps = new Map();
      const propTypes = new Map();
      
      for (const sample of dbComponent.samples || []) {
        const props = sample.component.props || {};
        
        for (const [key, value] of Object.entries(props)) {
          if (!allProps.has(key)) {
            allProps.set(key, []);
            propTypes.set(key, new Set());
          }
          
          allProps.get(key).push(value);
          
          // Infer type
          const valueType = inferType(value);
          propTypes.get(key).add(valueType);
        }
      }
      
      // Build properties structure
      const inferredProperties = {};
      for (const [key, values] of allProps.entries()) {
        const types = Array.from(propTypes.get(key));
        const primaryType = types[0] || 'string';
        
        // Get a sample value
        const sampleValue = values[0];
        
        inferredProperties[key] = {
          type: primaryType,
          description: `Property: ${key}`,
          editable: true,
          required: false,
          default: sampleValue
        };
      }
      
      return {
        type: componentType,
        totalUsage: dbComponent.totalCount,
        tenantCount: dbComponent.tenantCount,
        tenants: dbComponent.tenants,
        pageCount: dbComponent.pageCount,
        samples: dbComponent.samples,
        inferredProperties,
        recommendedId: generateComponentId(componentType),
        recommendedCategory: inferCategory(componentType),
        recommendedEditor: inferEditor(componentType, inferredProperties)
      };
    });
    
    // Sort by usage
    missingComponents.sort((a, b) => b.totalUsage - a.totalUsage);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDbComponentTypes: dbComponentTypes.size,
        totalRegistryComponentTypes: registryComponentTypes.size,
        missingComponentCount: missingComponents.length,
        unusedComponentCount: unusedComponentTypes.length
      },
      missingComponents,
      unusedComponents: unusedComponentTypes.map(type => ({
        type,
        registryInfo: registryAnalysis.byId[type] || null
      })),
      dbComponentTypes: Array.from(dbComponentTypes).sort(),
      registryComponentTypes: Array.from(registryComponentTypes).sort()
    };
    
    // Save JSON report
    const reportsDir = join(__dirname, 'reports');
    mkdirSync(reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonReportPath = join(reportsDir, `missing-components-${timestamp}.json`);
    writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
    console.log(`[testing] JSON report saved to: ${jsonReportPath}`);
    
    // Generate markdown report
    const mdReport = generateMarkdownReport(report);
    const mdReportPath = join(reportsDir, `missing-components-${timestamp}.md`);
    writeFileSync(mdReportPath, mdReport);
    console.log(`[testing] Markdown report saved to: ${mdReportPath}`);
    
    console.log(`[testing] ============================================`);
    console.log(`[testing] Report Generation Complete`);
    console.log(`[testing] Missing components: ${missingComponents.length}`);
    console.log(`[testing] ============================================`);
    
    return report;
    
  } catch (error) {
    console.error('[testing] Error generating report:', error);
    throw error;
  }
}

/**
 * Infer property type from value
 */
function inferType(value) {
  if (value === null || value === undefined) {
    return 'string';
  }
  
  if (Array.isArray(value)) {
    return 'array';
  }
  
  if (typeof value === 'object') {
    return 'object';
  }
  
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  
  if (typeof value === 'number') {
    return 'number';
  }
  
  return 'string';
}

/**
 * Generate component ID from type
 */
function generateComponentId(type) {
  // Convert type to kebab-case
  return type
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Infer component category from type
 */
function inferCategory(type) {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('header') || lowerType.includes('footer') || lowerType.includes('nav')) {
    return 'layout';
  }
  
  if (lowerType.includes('hero') || lowerType.includes('banner')) {
    return 'content';
  }
  
  if (lowerType.includes('button') || lowerType.includes('cta')) {
    return 'interactive';
  }
  
  if (lowerType.includes('image') || lowerType.includes('gallery') || lowerType.includes('media')) {
    return 'media';
  }
  
  if (lowerType.includes('form') || lowerType.includes('input')) {
    return 'form';
  }
  
  return 'content';
}

/**
 * Infer editor type from component type and properties
 */
function inferEditor(type, properties) {
  const lowerType = type.toLowerCase();
  const propKeys = Object.keys(properties);
  
  if (lowerType.includes('image') || propKeys.some(k => k.toLowerCase().includes('image'))) {
    return 'ImageEditor';
  }
  
  if (lowerType.includes('video')) {
    return 'VideoEditor';
  }
  
  if (lowerType.includes('button') || lowerType.includes('cta')) {
    return 'ButtonEditor';
  }
  
  if (lowerType.includes('link')) {
    return 'LinkEditor';
  }
  
  if (lowerType.includes('input') || lowerType.includes('form')) {
    return 'InputEditor';
  }
  
  if (propKeys.some(k => k.toLowerCase().includes('text') || k.toLowerCase().includes('content'))) {
    return 'TextEditor';
  }
  
  return 'ContainerEditor';
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  let md = `# Missing Components Report\n\n`;
  md += `Generated: ${report.timestamp}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Total Component Types in Database**: ${report.summary.totalDbComponentTypes}\n`;
  md += `- **Total Component Types in Registry**: ${report.summary.totalRegistryComponentTypes}\n`;
  md += `- **Missing Components**: ${report.summary.missingComponentCount}\n`;
  md += `- **Unused Components**: ${report.summary.unusedComponentCount}\n\n`;
  
  if (report.missingComponents.length > 0) {
    md += `## Missing Components\n\n`;
    md += `These components are used in the database but not defined in the registry:\n\n`;
    
    for (const comp of report.missingComponents) {
      md += `### ${comp.type}\n\n`;
      md += `- **Recommended ID**: \`${comp.recommendedId}\`\n`;
      md += `- **Category**: ${comp.recommendedCategory}\n`;
      md += `- **Editor**: ${comp.recommendedEditor}\n`;
      md += `- **Usage Count**: ${comp.totalUsage}\n`;
      md += `- **Tenants Using**: ${comp.tenantCount} (${comp.tenants.join(', ')})\n`;
      md += `- **Pages Using**: ${comp.pageCount}\n\n`;
      
      if (Object.keys(comp.inferredProperties).length > 0) {
        md += `**Inferred Properties:**\n\n`;
        for (const [key, prop] of Object.entries(comp.inferredProperties)) {
          md += `- \`${key}\`: ${prop.type}${prop.required ? ' (required)' : ''}\n`;
        }
        md += `\n`;
      }
      
      if (comp.samples && comp.samples.length > 0) {
        md += `**Sample Usage:**\n\n`;
        md += `\`\`\`json\n`;
        md += JSON.stringify(comp.samples[0].component, null, 2);
        md += `\n\`\`\`\n\n`;
      }
    }
  }
  
  if (report.unusedComponents.length > 0) {
    md += `## Unused Components\n\n`;
    md += `These components are in the registry but not used in any database:\n\n`;
    for (const comp of report.unusedComponents) {
      md += `- \`${comp.type}\`\n`;
    }
    md += `\n`;
  }
  
  return md;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMissingComponentsReport()
    .then(() => {
      console.log('[testing] Report generation complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('[testing] Report generation failed:', error);
      process.exit(1);
    });
}

