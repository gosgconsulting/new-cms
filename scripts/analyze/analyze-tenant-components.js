import dotenv from 'dotenv';
import { Pool } from 'pg';
import { query } from '../../sparti-cms/db/index.js';
import { getAllTenants, getTenantDatabaseDetails } from '../../sparti-cms/db/tenant-management.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/**
 * Get password for tenant database (needs to be retrieved from tenant_databases)
 */
async function getTenantDatabasePassword(tenantId) {
  try {
    // Query tenant_databases to get password
    // Note: Password may be stored in the database or may need to be retrieved from environment
    const result = await query(`
      SELECT password 
      FROM tenant_databases 
      WHERE tenant_id = $1
    `, [tenantId]);
    
    const password = result.rows[0]?.password;
    
    // If password is not in database, try to extract from database_url if available
    if (!password) {
      const tenantResult = await query(`
        SELECT database_url 
        FROM tenants 
        WHERE id = $1
      `, [tenantId]);
      
      const dbUrl = tenantResult.rows[0]?.database_url;
      if (dbUrl) {
        try {
          const url = new URL(dbUrl.replace('postgresql://', 'http://'));
          return url.password || null;
        } catch (e) {
          // URL parsing failed
        }
      }
    }
    
    return password || null;
  } catch (error) {
    console.error(`[testing] Error getting password for tenant ${tenantId}:`, error.message);
    return null;
  }
}

/**
 * Extract component types from layout_json for a tenant
 */
async function extractComponentsFromTenant(tenantId, tenantName, useSeparateDb = false, dbDetails = null, tenant = null) {
  const components = new Map(); // Map of component type -> { count, samples, tenants }
  
  try {
    let result;
    
    if (useSeparateDb && dbDetails) {
      // Connect to separate database
      const password = await getTenantDatabasePassword(tenantId);
      
      // Try to use database_url first if available
      let connectionString = null;
      if (tenant && tenant.database_url) {
        connectionString = tenant.database_url;
      } else if (password && dbDetails.host) {
        connectionString = `postgresql://${dbDetails.username}:${password}@${dbDetails.host}:${dbDetails.port || 5432}/${dbDetails.database_name}`;
      }
      
      if (!connectionString) {
        console.warn(`[testing] Could not construct connection string for tenant ${tenantId}, skipping separate DB connection`);
        return components;
      }
      
      const pool = new Pool({
        connectionString,
        ssl: dbDetails.ssl ? { rejectUnauthorized: false } : false,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      
      try {
        // Query page_layouts from separate database
        result = await pool.query(`
          SELECT 
            pl.layout_json,
            p.id as page_id,
            p.slug,
            p.page_name
          FROM page_layouts pl
          JOIN pages p ON pl.page_id = p.id
          WHERE pl.language = 'default' OR pl.language IS NULL
        `);
      } catch (dbError) {
        console.error(`[testing] Error querying separate database for tenant ${tenantId}:`, dbError.message);
        return components;
      } finally {
        await pool.end();
      }
    } else {
      // Query from shared database with tenant_id filter
      result = await query(`
        SELECT 
          pl.layout_json,
          p.id as page_id,
          p.slug,
          p.page_name
        FROM page_layouts pl
        JOIN pages p ON pl.page_id = p.id
        WHERE p.tenant_id = $1
          AND (pl.language = 'default' OR pl.language IS NULL)
      `, [tenantId]);
    }
    
    // Process each layout
    for (const row of result.rows) {
      const layoutJson = row.layout_json;
      
      if (!layoutJson || !layoutJson.components || !Array.isArray(layoutJson.components)) {
        continue;
      }
      
      // Extract component types
      for (const component of layoutJson.components) {
        const componentType = component.type || component.id;
        
        if (!componentType) {
          continue;
        }
        
        if (!components.has(componentType)) {
          components.set(componentType, {
            type: componentType,
            count: 0,
            tenants: new Set(),
            samples: [],
            pages: []
          });
        }
        
        const compData = components.get(componentType);
        compData.count++;
        compData.tenants.add(tenantId);
        
        // Store sample (limit to 3 samples per component type)
        if (compData.samples.length < 3) {
          compData.samples.push({
            tenantId,
            tenantName,
            pageId: row.page_id,
            pageSlug: row.slug,
            pageName: row.page_name,
            component: {
              id: component.id,
              type: component.type,
              props: component.props || {}
            }
          });
        }
        
        // Track pages using this component
        const pageKey = `${row.page_id}-${row.slug}`;
        if (!compData.pages.includes(pageKey)) {
          compData.pages.push(pageKey);
        }
      }
    }
    
    console.log(`[testing] Extracted ${components.size} unique component types from tenant ${tenantName} (${tenantId})`);
    
  } catch (error) {
    console.error(`[testing] Error extracting components from tenant ${tenantId} (${tenantName}):`, error.message);
    // Don't throw - continue with other tenants
  }
  
  return components;
}

/**
 * Main analysis function
 */
export async function analyzeAllTenantComponents() {
  console.log('[testing] ============================================');
  console.log('[testing] Starting Tenant Component Analysis');
  console.log('[testing] ============================================');
  
  try {
    // Get all tenants
    const tenants = await getAllTenants();
    console.log(`[testing] Found ${tenants.length} tenants to analyze`);
    
    // Aggregate all components across all tenants
    const allComponents = new Map();
    
    // Process each tenant
    for (const tenant of tenants) {
      console.log(`[testing] Analyzing tenant: ${tenant.name} (${tenant.id})`);
      
      const hasSeparateDb = tenant.database && tenant.database.host;
      
      if (hasSeparateDb) {
        console.log(`[testing]   Tenant has separate database: ${tenant.database.host}:${tenant.database.port}/${tenant.database.database_name}`);
      } else {
        console.log(`[testing]   Tenant uses shared database`);
      }
      
      const tenantComponents = await extractComponentsFromTenant(
        tenant.id,
        tenant.name,
        hasSeparateDb,
        tenant.database,
        tenant
      );
      
      // Merge into allComponents
      for (const [componentType, compData] of tenantComponents.entries()) {
        if (!allComponents.has(componentType)) {
          allComponents.set(componentType, {
            type: componentType,
            totalCount: 0,
            tenants: new Set(),
            samples: [],
            pages: []
          });
        }
        
        const allCompData = allComponents.get(componentType);
        allCompData.totalCount += compData.count;
        
        // Merge tenants
        for (const tenantId of compData.tenants) {
          allCompData.tenants.add(tenantId);
        }
        
        // Merge samples (limit to 5 total)
        for (const sample of compData.samples) {
          if (allCompData.samples.length < 5) {
            allCompData.samples.push(sample);
          }
        }
        
        // Merge pages
        for (const page of compData.pages) {
          if (!allCompData.pages.includes(page)) {
            allCompData.pages.push(page);
          }
        }
      }
    }
    
    // Convert to array format for easier processing
    const componentsArray = Array.from(allComponents.values()).map(comp => ({
      type: comp.type,
      totalCount: comp.totalCount,
      tenantCount: comp.tenants.size,
      tenants: Array.from(comp.tenants),
      samples: comp.samples,
      pageCount: comp.pages.length
    }));
    
    // Sort by usage count
    componentsArray.sort((a, b) => b.totalCount - a.totalCount);
    
    console.log(`[testing] ============================================`);
    console.log(`[testing] Analysis Complete`);
    console.log(`[testing] Found ${componentsArray.length} unique component types`);
    console.log(`[testing] ============================================`);
    
    return {
      timestamp: new Date().toISOString(),
      totalTenants: tenants.length,
      totalComponentTypes: componentsArray.length,
      components: componentsArray,
      tenants: tenants.map(t => ({
        id: t.id,
        name: t.name,
        hasSeparateDb: !!t.database
      }))
    };
    
  } catch (error) {
    console.error('[testing] Error in analysis:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeAllTenantComponents()
    .then(result => {
      console.log('\n[testing] Analysis Results:');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('[testing] Analysis failed:', error);
      process.exit(1);
    });
}

