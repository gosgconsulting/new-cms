import dotenv from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateMissingComponentsReport } from './generate-missing-components-report.js';
import { generateAllComponentDefinitions } from './generate-component-definition.js';
import { generateAllReactComponents } from './generate-react-component.js';
import { updateAllRegistries } from './update-registries.js';
import { readdirSync, readFileSync } from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main orchestrator function
 */
async function runFullAnalysis() {
  console.log('[testing] ============================================');
  console.log('[testing] Starting Full Tenant Component Analysis');
  console.log('[testing] ============================================');
  console.log('');
  
  const startTime = Date.now();
  const reportsDir = join(__dirname, 'reports');
  mkdirSync(reportsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const summary = {
    timestamp: new Date().toISOString(),
    steps: [],
    errors: [],
    results: {}
  };
  
  try {
    // Step 1: Generate missing components report
    console.log('[testing] Step 1: Analyzing and generating missing components report...');
    console.log('');
    
    let missingComponentsReport;
    try {
      missingComponentsReport = await generateMissingComponentsReport();
      summary.steps.push({
        step: 'generate-missing-components-report',
        status: 'success',
        missingCount: missingComponentsReport.missingComponents.length
      });
      summary.results.missingComponentsReport = missingComponentsReport;
      console.log(`[testing] ✓ Found ${missingComponentsReport.missingComponents.length} missing components\n`);
    } catch (error) {
      console.error('[testing] ✗ Error generating missing components report:', error.message);
      summary.steps.push({
        step: 'generate-missing-components-report',
        status: 'error',
        error: error.message
      });
      summary.errors.push({
        step: 'generate-missing-components-report',
        error: error.message
      });
      throw error;
    }
    
    // Step 2: Generate component definitions (JSON files)
    if (missingComponentsReport.missingComponents.length > 0) {
      console.log('[testing] Step 2: Generating component definitions (JSON)...');
      console.log('');
      
      let componentDefinitionsResult;
      try {
        componentDefinitionsResult = await generateAllComponentDefinitions(missingComponentsReport);
        summary.steps.push({
          step: 'generate-component-definitions',
          status: 'success',
          ...componentDefinitionsResult.summary
        });
        summary.results.componentDefinitions = componentDefinitionsResult;
        console.log(`[testing] ✓ Generated ${componentDefinitionsResult.summary.success} component definitions\n`);
      } catch (error) {
        console.error('[testing] ✗ Error generating component definitions:', error.message);
        summary.steps.push({
          step: 'generate-component-definitions',
          status: 'error',
          error: error.message
        });
        summary.errors.push({
          step: 'generate-component-definitions',
          error: error.message
        });
        // Continue even if some fail
      }
      
      // Step 3: Generate React components
      if (componentDefinitionsResult && componentDefinitionsResult.summary.success > 0) {
        console.log('[testing] Step 3: Generating React components...');
        console.log('');
        
        // Get list of successfully created component definitions
        const createdComponents = componentDefinitionsResult.results
          .filter(r => r.success)
          .map(r => {
            // Read the component definition to get full details
            const componentDefPath = join(__dirname, '../../sparti-cms/registry/components', `${r.componentType || r.componentId}.json`);
            try {
              return JSON.parse(readFileSync(componentDefPath, 'utf-8'));
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);
        
        if (createdComponents.length > 0) {
          let reactComponentsResult;
          try {
            reactComponentsResult = await generateAllReactComponents(createdComponents);
            summary.steps.push({
              step: 'generate-react-components',
              status: 'success',
              ...reactComponentsResult.summary
            });
            summary.results.reactComponents = reactComponentsResult;
            console.log(`[testing] ✓ Generated ${reactComponentsResult.summary.success} React components\n`);
            
            // Step 4: Update registries
            if (reactComponentsResult.summary.success > 0) {
              console.log('[testing] Step 4: Updating component registries...');
              console.log('');
              
              try {
                const registryUpdateResult = await updateAllRegistries();
                summary.steps.push({
                  step: 'update-registries',
                  status: 'success',
                  registryIndexUpdates: registryUpdateResult.registryIndex.newComponents || 0,
                  themeRegistryUpdates: registryUpdateResult.themeRegistry.newComponents || 0
                });
                summary.results.registryUpdates = registryUpdateResult;
                console.log(`[testing] ✓ Updated registries\n`);
              } catch (error) {
                console.error('[testing] ✗ Error updating registries:', error.message);
                summary.steps.push({
                  step: 'update-registries',
                  status: 'error',
                  error: error.message
                });
                summary.errors.push({
                  step: 'update-registries',
                  error: error.message
                });
                // Continue even if registry update fails
              }
            }
          } catch (error) {
            console.error('[testing] ✗ Error generating React components:', error.message);
            summary.steps.push({
              step: 'generate-react-components',
              status: 'error',
              error: error.message
            });
            summary.errors.push({
              step: 'generate-react-components',
              error: error.message
            });
            // Continue even if some fail
          }
        } else {
          console.log('[testing] No component definitions to generate React components from\n');
        }
      }
    } else {
      console.log('[testing] No missing components found. All components are already in the registry.\n');
    }
    
    // Step 4: Generate final summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    summary.duration = `${duration}s`;
    summary.completed = true;
    
    // Save summary report
    const summaryPath = join(reportsDir, `analysis-summary-${timestamp}.json`);
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`[testing] Summary report saved to: ${summaryPath}`);
    
    // Generate markdown summary
    const mdSummary = generateMarkdownSummary(summary);
    const mdSummaryPath = join(reportsDir, `analysis-summary-${timestamp}.md`);
    writeFileSync(mdSummaryPath, mdSummary);
    console.log(`[testing] Markdown summary saved to: ${mdSummaryPath}`);
    
    console.log('');
    console.log('[testing] ============================================');
    console.log('[testing] Analysis Complete');
    console.log('[testing] ============================================');
    console.log(`[testing] Duration: ${duration}s`);
    console.log(`[testing] Missing components found: ${missingComponentsReport?.missingComponents?.length || 0}`);
    console.log(`[testing] Component definitions created: ${summary.results.componentDefinitions?.summary?.success || 0}`);
    console.log(`[testing] React components created: ${summary.results.reactComponents?.summary?.success || 0}`);
    console.log(`[testing] Registry updates: ${summary.results.registryUpdates?.registryIndex?.newComponents || 0} (index), ${summary.results.registryUpdates?.themeRegistry?.newComponents || 0} (theme)`);
    console.log(`[testing] Errors: ${summary.errors.length}`);
    console.log('[testing] ============================================');
    
    return summary;
    
  } catch (error) {
    console.error('[testing] ============================================');
    console.error('[testing] Analysis Failed');
    console.error('[testing] ============================================');
    console.error('[testing] Error:', error.message);
    console.error('[testing] Stack:', error.stack);
    
    summary.completed = false;
    summary.fatalError = error.message;
    
    // Save error summary
    const summaryPath = join(reportsDir, `analysis-summary-${timestamp}.json`);
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    throw error;
  }
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(summary) {
  let md = `# Component Analysis Summary\n\n`;
  md += `Generated: ${summary.timestamp}\n`;
  md += `Duration: ${summary.duration}\n`;
  md += `Status: ${summary.completed ? '✅ Completed' : '❌ Failed'}\n\n`;
  
  if (summary.fatalError) {
    md += `## Fatal Error\n\n`;
    md += `\`\`\`\n${summary.fatalError}\n\`\`\`\n\n`;
  }
  
  md += `## Steps\n\n`;
  for (const step of summary.steps) {
    const statusIcon = step.status === 'success' ? '✅' : '❌';
    md += `### ${statusIcon} ${step.step}\n\n`;
    md += `- Status: ${step.status}\n`;
    if (step.error) {
      md += `- Error: ${step.error}\n`;
    }
    if (step.missingCount !== undefined) {
      md += `- Missing Components: ${step.missingCount}\n`;
    }
    if (step.success !== undefined) {
      md += `- Created: ${step.success}\n`;
    }
    if (step.skipped !== undefined) {
      md += `- Skipped: ${step.skipped}\n`;
    }
    if (step.errors !== undefined) {
      md += `- Errors: ${step.errors}\n`;
    }
    md += `\n`;
  }
  
  if (summary.errors.length > 0) {
    md += `## Errors\n\n`;
    for (const error of summary.errors) {
      md += `- **${error.step}**: ${error.error}\n`;
    }
    md += `\n`;
  }
  
  if (summary.results.missingComponentsReport) {
    const report = summary.results.missingComponentsReport;
    md += `## Missing Components\n\n`;
    md += `Total missing: ${report.missingComponents.length}\n\n`;
    
    if (report.missingComponents.length > 0) {
      md += `| Component Type | Usage Count | Tenants | Recommended ID |\n`;
      md += `|---------------|-------------|---------|----------------|\n`;
      
      for (const comp of report.missingComponents.slice(0, 20)) {
        md += `| ${comp.type} | ${comp.totalUsage} | ${comp.tenantCount} | \`${comp.recommendedId}\` |\n`;
      }
      
      if (report.missingComponents.length > 20) {
        md += `\n... and ${report.missingComponents.length - 20} more\n`;
      }
    }
  }
  
  return md;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullAnalysis()
    .then(() => {
      console.log('[testing] Analysis completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('[testing] Analysis failed:', error);
      process.exit(1);
    });
}

export { runFullAnalysis };

