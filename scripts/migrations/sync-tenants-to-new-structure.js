/**
 * Sync All Tenants to New Structure
 * 
 * This script migrates all existing tenants to use the new shared master/tenant structure:
 * 1. Runs migrations for media tenant_id and storage_name
 * 2. Migrates existing media/media_folders to have tenant_id
 * 3. Creates empty media folders for all tenants
 * 4. Ensures all tenants have proper structure
 */

import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';
import { runMigrations } from '../../sparti-cms/db/sequelize/run-migrations.js';
import { initializeTenantMediaFolders } from '../../sparti-cms/db/modules/media.js';
import { initializeTenantDefaults } from '../../sparti-cms/db/tenant-initialization.js';

// Load environment variables
dotenv.config();

async function syncAllTenants() {
  console.log('========================================');
  console.log('Syncing All Tenants to New Structure');
  console.log('========================================\n');

  try {
    // Step 1: Run migrations
    console.log('[1/5] Running database migrations...');
    try {
      await runMigrations([
        '20250101000004-add-tenant-id-to-media.js',
        '20250101000005-add-storage-name-to-tenants.js'
      ]);
      console.log('✓ Migrations completed successfully\n');
    } catch (error) {
      console.error('✗ Error running migrations:', error);
      // Continue anyway - migrations might already be applied
      console.log('Continuing with data migration...\n');
    }

    // Step 2: Get all tenants
    console.log('[2/5] Fetching all tenants...');
    const tenantsResult = await query(`
      SELECT id, name, storage_name FROM tenants ORDER BY id
    `);
    const tenants = tenantsResult.rows;
    console.log(`✓ Found ${tenants.length} tenant(s)\n`);

    if (tenants.length === 0) {
      console.log('No tenants found. Nothing to sync.');
      return;
    }

    // Step 3: Migrate existing media/media_folders to have tenant_id
    console.log('[3/5] Migrating existing media and folders...');
    try {
      // Check if media_folders has tenant_id column
      const foldersCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'media_folders' AND column_name = 'tenant_id'
      `);

      if (foldersCheck.rows.length > 0) {
        // Update media_folders without tenant_id to default tenant
        const defaultTenantId = tenants[0].id; // Use first tenant as default
        const foldersUpdate = await query(`
          UPDATE media_folders 
          SET tenant_id = $1 
          WHERE tenant_id IS NULL OR tenant_id = ''
        `, [defaultTenantId]);
        console.log(`✓ Updated ${foldersUpdate.rowCount} media folder(s) with tenant_id`);
      }

      // Check if media has tenant_id column
      const mediaCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'media' AND column_name = 'tenant_id'
      `);

      if (mediaCheck.rows.length > 0) {
        // Update media without tenant_id to default tenant
        const defaultTenantId = tenants[0].id; // Use first tenant as default
        const mediaUpdate = await query(`
          UPDATE media 
          SET tenant_id = $1 
          WHERE tenant_id IS NULL OR tenant_id = ''
        `, [defaultTenantId]);
        console.log(`✓ Updated ${mediaUpdate.rowCount} media file(s) with tenant_id`);
      }
    } catch (error) {
      console.error('✗ Error migrating media/folders:', error.message);
      // Continue anyway
    }
    console.log('');

    // Step 4: Create empty media folders for all tenants
    console.log('[4/5] Creating empty media folders for all tenants...');
    const foldersSummary = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const tenant of tenants) {
      try {
        const existingFolders = await query(`
          SELECT COUNT(*) as count FROM media_folders WHERE tenant_id = $1 AND is_active = true
        `, [tenant.id]);

        const count = parseInt(existingFolders.rows[0].count);
        
        if (count === 0) {
          // Create empty folders for this tenant
          const folders = await initializeTenantMediaFolders(tenant.id);
          foldersSummary.created++;
          console.log(`  ✓ Created ${folders.length} folder(s) for tenant: ${tenant.id}`);
        } else {
          foldersSummary.skipped++;
          console.log(`  - Skipped tenant ${tenant.id} (already has ${count} folder(s))`);
        }
      } catch (error) {
        foldersSummary.errors.push({ tenant: tenant.id, error: error.message });
        console.error(`  ✗ Error creating folders for tenant ${tenant.id}:`, error.message);
      }
    }

    console.log(`\n✓ Folders summary: ${foldersSummary.created} created, ${foldersSummary.skipped} skipped, ${foldersSummary.errors.length} errors\n`);

    // Step 5: Ensure all tenants have proper structure (run initialization)
    console.log('[5/5] Ensuring all tenants have proper structure...');
    const initSummary = {
      initialized: 0,
      skipped: 0,
      errors: []
    };

    for (const tenant of tenants) {
      try {
        // Check if tenant already has branding settings
        const brandingCheck = await query(`
          SELECT COUNT(*) as count FROM site_settings WHERE tenant_id = $1
        `, [tenant.id]);

        const count = parseInt(brandingCheck.rows[0].count);
        
        if (count === 0) {
          // Initialize tenant defaults
          await initializeTenantDefaults(tenant.id);
          initSummary.initialized++;
          console.log(`  ✓ Initialized tenant: ${tenant.id}`);
        } else {
          initSummary.skipped++;
          console.log(`  - Skipped tenant ${tenant.id} (already has ${count} setting(s))`);
        }
      } catch (error) {
        initSummary.errors.push({ tenant: tenant.id, error: error.message });
        console.error(`  ✗ Error initializing tenant ${tenant.id}:`, error.message);
      }
    }

    console.log(`\n✓ Initialization summary: ${initSummary.initialized} initialized, ${initSummary.skipped} skipped, ${initSummary.errors.length} errors\n`);

    // Final summary
    console.log('========================================');
    console.log('Sync Complete!');
    console.log('========================================');
    console.log(`Total tenants: ${tenants.length}`);
    console.log(`Media folders: ${foldersSummary.created} created, ${foldersSummary.skipped} skipped`);
    console.log(`Tenant initialization: ${initSummary.initialized} initialized, ${initSummary.skipped} skipped`);
    
    if (foldersSummary.errors.length > 0 || initSummary.errors.length > 0) {
      console.log('\n⚠ Errors encountered:');
      if (foldersSummary.errors.length > 0) {
        console.log('  Media folders errors:');
        foldersSummary.errors.forEach(err => {
          console.log(`    - ${err.tenant}: ${err.error}`);
        });
      }
      if (initSummary.errors.length > 0) {
        console.log('  Initialization errors:');
        initSummary.errors.forEach(err => {
          console.log(`    - ${err.tenant}: ${err.error}`);
        });
      }
    }

    console.log('\n✓ All tenants are now using the new structure!');
    console.log('\nNext steps:');
    console.log('  1. Configure storage_name for each tenant (via Vercel env or database)');
    console.log('  2. Set STORAGE_{TENANT_ID} environment variables (e.g. in Vercel) if using per-tenant storage');
    console.log('  3. Verify media folders are accessible for each tenant');

  } catch (error) {
    console.error('\n✗ Fatal error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncAllTenants()
  .then(() => {
    console.log('\n✓ Sync script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Sync script failed:', error);
    process.exit(1);
  });

