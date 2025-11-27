/**
 * Fix Tenants Page Script
 * 
 * This script ensures that the tenant tables are properly initialized in the database
 * and creates a default tenant if none exists.
 */

import { query } from '../../sparti-cms/db/index.js';

async function fixTenants() {
  console.log('Starting tenants fix script...');
  
  try {
    // Note: Tenant tables should be created via Sequelize migrations
    // Run: npm run sequelize:migrate
    console.log('Note: Ensure tenant tables exist (run: npm run sequelize:migrate)');
    
    // Check if default tenant exists
    console.log('Checking for default tenant...');
    const tenantResult = await query(`SELECT id, name FROM tenants WHERE id = 'tenant-gosg'`);
    
    if (tenantResult.rows.length === 0) {
      console.log('Default tenant not found, creating...');
      
      // Create default tenant
      await query(`
        INSERT INTO tenants (id, name, created_at)
        VALUES ('tenant-gosg', 'GO SG CONSULTING', NOW())
      `);
      
      console.log('Default tenant created successfully');
    } else {
      console.log(`Default tenant found: ${tenantResult.rows[0].name}`);
    }
    
    // List all tenants
    const allTenantsResult = await query(`SELECT id, name, created_at FROM tenants ORDER BY created_at`);
    
    console.log('\nAvailable tenants:');
    allTenantsResult.rows.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name} (${tenant.id}) - Created: ${tenant.created_at}`);
    });
    
    console.log('\nTenants fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing tenants:', error);
    process.exit(1);
  }
}

// Run the fix
fixTenants();
