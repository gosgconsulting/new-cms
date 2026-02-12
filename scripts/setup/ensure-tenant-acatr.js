/**
 * Ensure Tenant ACATR Setup Script
 * 
 * This script ensures that tenant-acatr exists in the database and is properly configured.
 * Run this after setting up environment variables for ACATR deployment.
 */

import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';
import { initializeTenantDefaults } from '../../sparti-cms/db/tenant-initialization.js';
import { initializeTenantMediaFolders } from '../../sparti-cms/db/modules/media.js';

// Load environment variables
dotenv.config();

async function ensureTenantACATR() {
  console.log('========================================');
  console.log('Ensuring Tenant ACATR Setup');
  console.log('========================================\n');

  const tenantId = 'tenant-acatr';
  const tenantName = 'ACATR';
  const themeSlug = process.env.VITE_DEPLOY_THEME_SLUG || 'landingpage';

  try {
    // Step 1: Check if tenant exists
    console.log(`[1/4] Checking if tenant '${tenantId}' exists...`);
    const tenantCheck = await query(`
      SELECT id, name, slug, theme_id, storage_name, created_at
      FROM tenants 
      WHERE id = $1
    `, [tenantId]);

    if (tenantCheck.rows.length === 0) {
      console.log(`  ⚠️  Tenant '${tenantId}' not found. Creating...`);
      
      // Generate slug from tenant name
      const slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Create tenant
      await query(`
        INSERT INTO tenants (id, name, slug, theme_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [tenantId, tenantName, slug, themeSlug]);
      
      console.log(`  ✅ Tenant '${tenantId}' created successfully`);
      console.log(`     Name: ${tenantName}`);
      console.log(`     Slug: ${slug}`);
      console.log(`     Theme: ${themeSlug}\n`);
    } else {
      const tenant = tenantCheck.rows[0];
      console.log(`  ✅ Tenant '${tenantId}' already exists`);
      console.log(`     Name: ${tenant.name}`);
      console.log(`     Slug: ${tenant.slug}`);
      console.log(`     Theme: ${tenant.theme_id || 'Not set'}`);
      console.log(`     Storage: ${tenant.storage_name || 'Not set'}`);
      console.log(`     Created: ${tenant.created_at}\n`);

      // Update theme_id if DEPLOY_THEME_SLUG is set and different
      if (themeSlug && tenant.theme_id !== themeSlug) {
        console.log(`  Updating theme_id to '${themeSlug}'...`);
        await query(`
          UPDATE tenants 
          SET theme_id = $1, updated_at = NOW()
          WHERE id = $2
        `, [themeSlug, tenantId]);
        console.log(`  ✅ Theme updated\n`);
      }
    }

    // Step 2: Initialize tenant defaults
    console.log(`[2/4] Initializing tenant defaults for '${tenantId}'...`);
    try {
      const initResult = await initializeTenantDefaults(tenantId);
      console.log(`  ✅ Tenant defaults initialized`);
      console.log(`     Settings: ${initResult.summary?.settings || 0}`);
      console.log(`     Branding: ${initResult.summary?.branding || 0}\n`);
    } catch (error) {
      console.error(`  ⚠️  Error initializing defaults: ${error.message}`);
      console.log(`  Continuing...\n`);
    }

    // Step 3: Initialize media folders
    console.log(`[3/4] Initializing media folders for '${tenantId}'...`);
    try {
      const folders = await initializeTenantMediaFolders(tenantId);
      console.log(`  ✅ Media folders initialized: ${folders.length} folders\n`);
    } catch (error) {
      console.error(`  ⚠️  Error initializing media folders: ${error.message}`);
      console.log(`  Continuing...\n`);
    }

    // Step 4: Verify storage configuration
    console.log(`[4/4] Verifying storage configuration...`);
    const storageEnvKey = `STORAGE_${tenantId.toUpperCase().replace(/-/g, '_')}`;
    const storageEnv = process.env[storageEnvKey];
    
    const tenantResult = await query(`
      SELECT storage_name FROM tenants WHERE id = $1
    `, [tenantId]);
    
    const currentStorage = tenantResult.rows[0]?.storage_name;
    
    if (storageEnv) {
      console.log(`  ✅ Storage configured via ${storageEnvKey}: ${storageEnv}`);
      if (currentStorage !== storageEnv) {
        console.log(`  Updating database storage_name to match environment...`);
        await query(`
          UPDATE tenants 
          SET storage_name = $1, updated_at = NOW()
          WHERE id = $2
        `, [storageEnv, tenantId]);
        console.log(`  ✅ Storage name updated in database\n`);
      }
    } else if (currentStorage) {
      console.log(`  ✅ Storage configured in database: ${currentStorage}`);
      console.log(`  💡 Tip: Set ${storageEnvKey} environment variable (e.g. in Vercel) for custom storage\n`);
    } else {
      console.log(`  ⚠️  No storage configured`);
      console.log(`  💡 Tip: Set ${storageEnvKey} environment variable or update database\n`);
    }

    // Final summary
    console.log('========================================');
    console.log('Tenant ACATR Setup Complete!');
    console.log('========================================');
    console.log(`✅ Tenant ID: ${tenantId}`);
    console.log(`✅ Tenant Name: ${tenantName}`);
    console.log(`✅ Theme: ${themeSlug}`);
    console.log(`✅ Database: Connected`);
    console.log(`\n🎉 Tenant '${tenantId}' is ready for deployment!`);

    return true;
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run setup
ensureTenantACATR()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

