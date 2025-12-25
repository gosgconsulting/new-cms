/**
 * Migration script to set initial tenant integration status
 * Sets:
 * - Moski (tenant-a3532ae1) -> WooCommerce: Active
 * - GO SG CONSULTING (tenant-gosg) -> WordPress: Active
 */

import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';

// Load environment variables
dotenv.config();

async function setTenantIntegrations() {
  console.log('[testing] Starting tenant integrations setup...');
  
  try {
    // Check if tenant_integrations table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenant_integrations'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('[testing] tenant_integrations table does not exist. Please run the migration first.');
      console.log('[testing] Run: npx sequelize-cli db:migrate');
      return;
    }

    // Find tenant IDs by name (case-insensitive search)
    const moskiTenant = await query(`
      SELECT id, name FROM tenants 
      WHERE LOWER(name) LIKE '%moski%' 
      LIMIT 1
    `);

    const gosgTenant = await query(`
      SELECT id, name FROM tenants 
      WHERE LOWER(name) LIKE '%go sg%' OR LOWER(name) LIKE '%gosg%' OR id = 'tenant-gosg'
      LIMIT 1
    `);

    console.log('[testing] Found tenants:');
    if (moskiTenant.rows.length > 0) {
      console.log(`[testing]   - Moski: ${moskiTenant.rows[0].id} (${moskiTenant.rows[0].name})`);
    } else {
      console.log('[testing]   - Moski: Not found');
    }
    if (gosgTenant.rows.length > 0) {
      console.log(`[testing]   - GO SG CONSULTING: ${gosgTenant.rows[0].id} (${gosgTenant.rows[0].name})`);
    } else {
      console.log('[testing]   - GO SG CONSULTING: Not found');
    }

    // Set Moski WooCommerce integration
    if (moskiTenant.rows.length > 0) {
      const moskiId = moskiTenant.rows[0].id;
      
      await query(`
        INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
        VALUES ($1, 'woocommerce', true, NULL)
        ON CONFLICT (tenant_id, integration_type)
        DO UPDATE SET
          is_active = true,
          updated_at = NOW()
      `, [moskiId]);

      console.log(`[testing] ✓ Set WooCommerce integration for Moski (${moskiId})`);
    }

    // Set GO SG CONSULTING WordPress integration
    if (gosgTenant.rows.length > 0) {
      const gosgId = gosgTenant.rows[0].id;
      
      await query(`
        INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
        VALUES ($1, 'wordpress', true, NULL)
        ON CONFLICT (tenant_id, integration_type)
        DO UPDATE SET
          is_active = true,
          updated_at = NOW()
      `, [gosgId]);

      console.log(`[testing] ✓ Set WordPress integration for GO SG CONSULTING (${gosgId})`);
    }

    // Also try direct tenant IDs if name search didn't work
    if (moskiTenant.rows.length === 0) {
      try {
        await query(`
          INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
          VALUES ($1, 'woocommerce', true, NULL)
          ON CONFLICT (tenant_id, integration_type)
          DO UPDATE SET
            is_active = true,
            updated_at = NOW()
        `, ['tenant-a3532ae1']);
        console.log('[testing] ✓ Set WooCommerce integration for tenant-a3532ae1 (Moski)');
      } catch (error) {
        console.log('[testing] Could not set integration for tenant-a3532ae1:', error.message);
      }
    }

    if (gosgTenant.rows.length === 0) {
      try {
        await query(`
          INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
          VALUES ($1, 'wordpress', true, NULL)
          ON CONFLICT (tenant_id, integration_type)
          DO UPDATE SET
            is_active = true,
            updated_at = NOW()
        `, ['tenant-gosg']);
        console.log('[testing] ✓ Set WordPress integration for tenant-gosg (GO SG CONSULTING)');
      } catch (error) {
        console.log('[testing] Could not set integration for tenant-gosg:', error.message);
      }
    }

    console.log('[testing] Tenant integrations setup completed!');
  } catch (error) {
    console.error('[testing] Error setting tenant integrations:', error);
    throw error;
  }
}

// Run the migration
setTenantIntegrations()
  .then(() => {
    console.log('[testing] Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] Migration failed:', error);
    process.exit(1);
  });

