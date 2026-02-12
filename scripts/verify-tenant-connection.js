/**
 * Verify Tenant Connection Script
 * 
 * This script verifies that:
 * 1. Environment variables are correctly set
 * 2. Database connection works
 * 3. Tenant exists in database
 * 4. Tenant is properly initialized
 */

import dotenv from 'dotenv';
import { query } from '../sparti-cms/db/index.js';
import { getConnectionInfo } from '../sparti-cms/db/connection.js';

// Load environment variables
dotenv.config();

async function verifyTenantConnection() {
  console.log('========================================');
  console.log('Tenant Connection Verification');
  console.log('========================================\n');

  const tenantId = process.env.CMS_TENANT || 'tenant-acatr';
  
  try {
    // Step 1: Verify environment variables
    console.log('[1/5] Verifying environment variables...');
    const envVars = {
      DEPLOY_THEME_SLUG: process.env.VITE_DEPLOY_THEME_SLUG,
      CMS_TENANT: process.env.CMS_TENANT,
      DATABASE_PUBLIC_URL: process.env.DATABASE_PUBLIC_URL ? 'Set ✅' : 'Missing ❌',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌',
      NODE_ENV: process.env.NODE_ENV,
      VITE_BACKEND_SERVER_URL: process.env.VITE_BACKEND_SERVER_URL,
      VITE_USE_BACKEND_SERVER: process.env.VITE_USE_BACKEND_SERVER,
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
      PORT: process.env.PORT,
      BACKEND_PORT: process.env.BACKEND_PORT
    };

    console.log('Environment Variables:');
    Object.entries(envVars).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${key}: ${value || 'Not set'}`);
    });

    // Check for required variables
    const requiredVars = ['DATABASE_PUBLIC_URL', 'DATABASE_URL', 'NODE_ENV', 'PORT'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.error(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
      return false;
    }
    console.log('✅ All required environment variables are set\n');

    // Step 2: Verify database connection
    console.log('[2/5] Verifying database connection...');
    try {
      const connInfo = getConnectionInfo();
      console.log(`  Connection source: ${connInfo.source}`);
      console.log(`  Host: ${connInfo.host}`);
      console.log(`  Port: ${connInfo.port}`);
      console.log(`  Database: ${connInfo.database}`);
      console.log(`  User: ${connInfo.user}`);

      // Test connection
      const testResult = await query('SELECT NOW() as current_time, version() as pg_version');
      console.log(`  ✅ Database connection successful`);
      console.log(`  Current time: ${testResult.rows[0].current_time}`);
      console.log(`  PostgreSQL version: ${testResult.rows[0].pg_version.split(' ')[0]} ${testResult.rows[0].pg_version.split(' ')[1]}\n`);
    } catch (error) {
      console.error(`  ❌ Database connection failed: ${error.message}`);
      return false;
    }

    // Step 3: Verify tenant exists
    console.log(`[3/5] Verifying tenant '${tenantId}' exists...`);
    try {
      const tenantResult = await query(`
        SELECT id, name, slug, theme_id, storage_name, created_at, updated_at
        FROM tenants 
        WHERE id = $1
      `, [tenantId]);

      if (tenantResult.rows.length === 0) {
        console.log(`  ⚠️  Tenant '${tenantId}' not found in database`);
        console.log(`  Creating tenant '${tenantId}'...`);
        
        // Create tenant
        const createResult = await query(`
          INSERT INTO tenants (id, name, slug, theme_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING *
        `, [
          tenantId,
          'ACATR',
          'acatr',
          process.env.VITE_DEPLOY_THEME_SLUG || 'landingpage'
        ]);

        console.log(`  ✅ Tenant '${tenantId}' created successfully`);
        console.log(`  Name: ${createResult.rows[0].name}`);
        console.log(`  Slug: ${createResult.rows[0].slug}`);
        console.log(`  Theme: ${createResult.rows[0].theme_id}\n`);
      } else {
        const tenant = tenantResult.rows[0];
        console.log(`  ✅ Tenant '${tenantId}' found`);
        console.log(`  Name: ${tenant.name}`);
        console.log(`  Slug: ${tenant.slug}`);
        console.log(`  Theme: ${tenant.theme_id || 'Not set'}`);
        console.log(`  Storage: ${tenant.storage_name || 'Not set'}`);
        console.log(`  Created: ${tenant.created_at}\n`);

        // Update theme_id if DEPLOY_THEME_SLUG is set and different
        if (process.env.VITE_DEPLOY_THEME_SLUG && tenant.theme_id !== process.env.VITE_DEPLOY_THEME_SLUG) {
          console.log(`  Updating theme_id to '${process.env.VITE_DEPLOY_THEME_SLUG}'...`);
          await query(`
            UPDATE tenants 
            SET theme_id = $1, updated_at = NOW()
            WHERE id = $2
          `, [process.env.VITE_DEPLOY_THEME_SLUG, tenantId]);
          console.log(`  ✅ Theme updated\n`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error checking tenant: ${error.message}`);
      return false;
    }

    // Step 4: Verify tenant initialization
    console.log(`[4/5] Verifying tenant '${tenantId}' initialization...`);
    try {
      // Check if tenant has branding settings
      const brandingCheck = await query(`
        SELECT COUNT(*) as count FROM site_settings WHERE tenant_id = $1
      `, [tenantId]);
      const brandingCount = parseInt(brandingCheck.rows[0].count);

      // Check if tenant has media folders
      const foldersCheck = await query(`
        SELECT COUNT(*) as count FROM media_folders WHERE tenant_id = $1 AND is_active = true
      `, [tenantId]);
      const foldersCount = parseInt(foldersCheck.rows[0].count);

      console.log(`  Branding settings: ${brandingCount > 0 ? '✅ Initialized' : '⚠️  Not initialized'}`);
      console.log(`  Media folders: ${foldersCount > 0 ? '✅ Initialized' : '⚠️  Not initialized'}`);

      if (brandingCount === 0 || foldersCount === 0) {
        console.log(`  Running tenant initialization...`);
        const { initializeTenantDefaults } = await import('../sparti-cms/db/tenant-initialization.js');
        await initializeTenantDefaults(tenantId);
        console.log(`  ✅ Tenant initialization complete\n`);
      } else {
        console.log(`  ✅ Tenant is properly initialized\n`);
      }
    } catch (error) {
      console.error(`  ❌ Error checking tenant initialization: ${error.message}`);
      return false;
    }

    // Step 5: Verify storage configuration
    console.log(`[5/5] Verifying storage configuration...`);
    try {
      const storageEnvKey = `STORAGE_${tenantId.toUpperCase().replace(/-/g, '_')}`;
      const storageEnv = process.env[storageEnvKey];
      
      const tenantResult = await query(`
        SELECT storage_name FROM tenants WHERE id = $1
      `, [tenantId]);
      
      const storageName = tenantResult.rows[0]?.storage_name || storageEnv || tenantId;
      
      console.log(`  Storage name: ${storageName}`);
      if (storageEnv) {
        console.log(`  ✅ Storage configured via ${storageEnvKey} environment variable`);
      } else if (tenantResult.rows[0]?.storage_name) {
        console.log(`  ✅ Storage configured in database`);
      } else {
        console.log(`  ⚠️  Using default storage (tenant ID): ${tenantId}`);
        console.log(`  💡 Tip: Set ${storageEnvKey} environment variable for custom storage`);
      }
      console.log('');
    } catch (error) {
      console.error(`  ❌ Error checking storage: ${error.message}`);
    }

    // Final summary
    console.log('========================================');
    console.log('Verification Complete!');
    console.log('========================================');
    console.log(`✅ Tenant: ${tenantId}`);
    console.log(`✅ Database: Connected`);
    console.log(`✅ Theme: ${process.env.VITE_DEPLOY_THEME_SLUG || 'Not set'}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV}`);
    console.log(`\n🎉 Tenant '${tenantId}' is ready for deployment!`);

    return true;
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run verification
verifyTenantConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

