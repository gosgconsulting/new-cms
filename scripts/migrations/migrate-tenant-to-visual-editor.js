import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';
import { getAllTenants, getTenantDatabaseDetails } from '../../sparti-cms/db/tenant-management.js';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Analyze tenant's page layouts for visual editor migration
 */
export async function analyzeTenantForMigration(tenantId) {
  console.log(`[testing] ============================================`);
  console.log(`[testing] Analyzing Tenant: ${tenantId}`);
  console.log(`[testing] ============================================`);

  try {
    // Get tenant info
    const tenantsResult = await query(`
      SELECT id, name, slug
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    if (tenantsResult.rows.length === 0) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const tenant = tenantsResult.rows[0];
    console.log(`[testing] Tenant: ${tenant.name} (${tenant.id})`);

    // Check if tenant has separate database
    const dbDetailsResult = await query(`
      SELECT host, port, database_name, username, ssl
      FROM tenant_databases
      WHERE tenant_id = $1
    `, [tenantId]);

    const hasSeparateDb = dbDetailsResult.rows.length > 0;
    const dbDetails = hasSeparateDb ? dbDetailsResult.rows[0] : null;

    // Query page layouts
    let layoutsResult;
    if (hasSeparateDb) {
      // Connect to separate database
      const passwordResult = await query(`
        SELECT password FROM tenant_databases WHERE tenant_id = $1
      `, [tenantId]);
      const password = passwordResult.rows[0]?.password;

      if (!password) {
        // Try database_url
        const tenantResult = await query(`
          SELECT database_url FROM tenants WHERE id = $1
        `, [tenantId]);
        const dbUrl = tenantResult.rows[0]?.database_url;

        if (!dbUrl) {
          throw new Error(`Cannot get database connection for tenant ${tenantId}`);
        }

        const pool = new Pool({
          connectionString: dbUrl,
          ssl: dbDetails.ssl ? { rejectUnauthorized: false } : false,
        });

        layoutsResult = await pool.query(`
          SELECT 
            pl.id,
            pl.page_id,
            pl.layout_json,
            pl.language,
            p.slug,
            p.page_name
          FROM page_layouts pl
          JOIN pages p ON pl.page_id = p.id
          WHERE pl.language = 'default' OR pl.language IS NULL
        `);

        await pool.end();
      } else {
        const connectionString = `postgresql://${dbDetails.username}:${password}@${dbDetails.host}:${dbDetails.port}/${dbDetails.database_name}`;
        const pool = new Pool({
          connectionString,
          ssl: dbDetails.ssl ? { rejectUnauthorized: false } : false,
        });

        layoutsResult = await pool.query(`
          SELECT 
            pl.id,
            pl.page_id,
            pl.layout_json,
            pl.language,
            p.slug,
            p.page_name
          FROM page_layouts pl
          JOIN pages p ON pl.page_id = p.id
          WHERE pl.language = 'default' OR pl.language IS NULL
        `);

        await pool.end();
      }
    } else {
      // Query from shared database
      layoutsResult = await query(`
        SELECT 
          pl.id,
          pl.page_id,
          pl.layout_json,
          pl.language,
          p.slug,
          p.page_name
        FROM page_layouts pl
        JOIN pages p ON pl.page_id = p.id
        WHERE p.tenant_id = $1
          AND (pl.language = 'default' OR pl.language IS NULL)
      `, [tenantId]);
    }

    const pages = layoutsResult.rows;
    console.log(`[testing] Found ${pages.length} pages with layouts`);

    // Analyze components
    const componentAnalysis = {
      totalPages: pages.length,
      totalComponents: 0,
      componentTypes: new Map(),
      pagesWithIssues: [],
      migrationNeeded: false,
      issues: []
    };

    for (const page of pages) {
      const layoutJson = page.layout_json;
      if (!layoutJson || !layoutJson.components || !Array.isArray(layoutJson.components)) {
        continue;
      }

      const pageIssues = [];
      for (const component of layoutJson.components) {
        componentAnalysis.totalComponents++;
        const componentType = component.type || component.id;

        if (!componentType) {
          pageIssues.push({
            component: component,
            issue: 'Missing component type'
          });
          continue;
        }

        // Track component type usage
        if (!componentAnalysis.componentTypes.has(componentType)) {
          componentAnalysis.componentTypes.set(componentType, {
            type: componentType,
            count: 0,
            hasProps: false,
            hasItems: false,
            sampleComponent: component
          });
        }

        const typeData = componentAnalysis.componentTypes.get(componentType);
        typeData.count++;

        // Check if component has props or items
        if (component.props && Object.keys(component.props).length > 0) {
          typeData.hasProps = true;
        }
        if (component.items && Array.isArray(component.items) && component.items.length > 0) {
          typeData.hasItems = true;
        }

        // Check if component needs migration
        // Components with empty props but no items might need migration
        if (!component.props || Object.keys(component.props).length === 0) {
          if (!component.items || component.items.length === 0) {
            pageIssues.push({
              component: component,
              issue: 'Component has no props or items'
            });
          }
        }
      }

      if (pageIssues.length > 0) {
        componentAnalysis.pagesWithIssues.push({
          pageId: page.page_id,
          pageSlug: page.slug,
          pageName: page.page_name,
          issues: pageIssues
        });
      }
    }

    // Convert Map to Array
    const componentTypesArray = Array.from(componentAnalysis.componentTypes.values());
    componentAnalysis.componentTypes = componentTypesArray;

    // Determine if migration is needed
    componentAnalysis.migrationNeeded = 
      componentAnalysis.pagesWithIssues.length > 0 ||
      componentTypesArray.some(ct => !ct.hasProps && !ct.hasItems);

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
      },
      analysis: componentAnalysis,
      recommendations: generateRecommendations(componentAnalysis)
    };

    // Save report
    const reportsDir = join(__dirname, 'reports');
    mkdirSync(reportsDir, { recursive: true });
    const reportPath = join(reportsDir, `tenant-migration-${tenantId}-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`[testing] Report saved to: ${reportPath}`);

    return report;

  } catch (error) {
    console.error(`[testing] Error analyzing tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Generate migration recommendations
 */
function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.pagesWithIssues.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${analysis.pagesWithIssues.length} page(s) have components with issues that may need attention`,
      action: 'Review pages with issues before migration'
    });
  }

  const componentsWithoutData = analysis.componentTypes.filter(ct => !ct.hasProps && !ct.hasItems);
  if (componentsWithoutData.length > 0) {
    recommendations.push({
      type: 'info',
      message: `${componentsWithoutData.length} component type(s) have no data (empty props and items)`,
      action: 'These components may need data to be added manually'
    });
  }

  const componentsWithItems = analysis.componentTypes.filter(ct => ct.hasItems);
  if (componentsWithItems.length > 0) {
    recommendations.push({
      type: 'success',
      message: `${componentsWithItems.length} component type(s) use items format (schema-based)`,
      action: 'These components should work with VisualEditorRenderer'
    });
  }

  const componentsWithProps = analysis.componentTypes.filter(ct => ct.hasProps);
  if (componentsWithProps.length > 0) {
    recommendations.push({
      type: 'success',
      message: `${componentsWithProps.length} component type(s) use props format`,
      action: 'These components should work with VisualEditorRenderer after props mapping'
    });
  }

  return recommendations;
}

/**
 * List all tenants for migration
 */
export async function listTenantsForMigration() {
  const tenants = await getAllTenants();
  
  console.log(`[testing] ============================================`);
  console.log(`[testing] Tenants Available for Migration`);
  console.log(`[testing] ============================================`);
  
  for (const tenant of tenants) {
    console.log(`[testing] - ${tenant.name} (${tenant.id})`);
  }
  
  return tenants.map(t => ({ id: t.id, name: t.name }));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tenantId = process.argv[2];
  
  if (!tenantId) {
    console.log('[testing] Usage: node migrate-tenant-to-visual-editor.js <tenant-id>');
    console.log('[testing] Or use: node migrate-tenant-to-visual-editor.js --list');
    process.exit(1);
  }

  if (tenantId === '--list') {
    listTenantsForMigration()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('[testing] Error:', error);
        process.exit(1);
      });
  } else {
    analyzeTenantForMigration(tenantId)
      .then(report => {
        console.log('\n[testing] Analysis Complete');
        console.log(`[testing] Total Pages: ${report.analysis.totalPages}`);
        console.log(`[testing] Total Components: ${report.analysis.totalComponents}`);
        console.log(`[testing] Component Types: ${report.analysis.componentTypes.length}`);
        console.log(`[testing] Migration Needed: ${report.analysis.migrationNeeded ? 'Yes' : 'No'}`);
        process.exit(0);
      })
      .catch(error => {
        console.error('[testing] Error:', error);
        process.exit(1);
      });
  }
}

