import { query } from '../sparti-cms/db/index.js';
import { updateTenant } from '../sparti-cms/db/tenant-management.js';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script to connect STR tenant to STR theme
 * This ensures the tenant's theme_id and slug are set correctly
 */

async function connectSTRTenant() {
  try {
    console.log('[testing] Starting STR tenant connection process...\n');

    // Step 1: Query for STR tenant by name
    console.log('[testing] Step 1: Querying for STR tenant...');
    const tenantResult = await query(`
      SELECT id, name, slug, theme_id, created_at, updated_at
      FROM tenants
      WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1)
      ORDER BY created_at DESC
      LIMIT 5
    `, ['STR']);

    if (tenantResult.rows.length === 0) {
      console.log('[testing] ❌ No tenant found with name "STR"');
      console.log('[testing] Please provide the tenant ID to update.');
      console.log('[testing] You can find it by running: SELECT id, name, slug, theme_id FROM tenants;');
      return;
    }

    console.log(`[testing] Found ${tenantResult.rows.length} tenant(s) with name "STR":`);
    tenantResult.rows.forEach((tenant, index) => {
      console.log(`[testing]   ${index + 1}. ID: ${tenant.id}, Name: ${tenant.name}, Slug: ${tenant.slug || 'null'}, Theme: ${tenant.theme_id || 'null'}`);
    });

    // Use the first tenant found
    const tenant = tenantResult.rows[0];
    console.log(`[testing] Using tenant: ${tenant.id}\n`);

    // Step 2: Check current state
    console.log('[testing] Step 2: Current tenant state:');
    console.log(`[testing]   ID: ${tenant.id}`);
    console.log(`[testing]   Name: ${tenant.name}`);
    console.log(`[testing]   Slug: ${tenant.slug || 'null'} (should be: 'str')`);
    console.log(`[testing]   Theme ID: ${tenant.theme_id || 'null'} (should be: 'str')\n`);

    // Step 3: Update if needed
    const needsUpdate = tenant.theme_id !== 'str' || tenant.slug !== 'str';
    
    if (!needsUpdate) {
      console.log('[testing] ✅ Tenant is already correctly configured!');
      console.log(`[testing]   Theme ID: ${tenant.theme_id}`);
      console.log(`[testing]   Slug: ${tenant.slug}`);
      return;
    }

    console.log('[testing] Step 3: Updating tenant configuration...');
    const updatedTenant = await updateTenant(tenant.id, {
      theme_id: 'str',
      slug: 'str'
    });

    if (updatedTenant) {
      console.log('[testing] ✅ Tenant updated successfully!');
      console.log(`[testing]   New Theme ID: ${updatedTenant.theme_id}`);
      console.log(`[testing]   New Slug: ${updatedTenant.slug}\n`);
    } else {
      console.log('[testing] ❌ Failed to update tenant');
      return;
    }

    // Step 4: Verify assets
    console.log('[testing] Step 4: Verifying assets...');
    const assetPaths = [
      join(__dirname, '..', 'sparti-cms', 'theme', 'str', 'assets', 'logos', 'str-logo-1-1024x604.png'),
      join(__dirname, '..', 'sparti-cms', 'theme', 'str', 'assets', 'hero', 'hero-background.jpg'),
      join(__dirname, '..', 'public', 'theme', 'str', 'assets', 'logos', 'str-logo-1-1024x604.png'),
      join(__dirname, '..', 'public', 'theme', 'str', 'assets', 'hero', 'hero-background.jpg')
    ];

    const assetChecks = assetPaths.map(path => ({
      path,
      exists: existsSync(path)
    }));

    console.log('[testing] Asset verification:');
    assetChecks.forEach(({ path, exists }) => {
      const status = exists ? '✅' : '❌';
      const relativePath = path.replace(join(__dirname, '..') + '/', '');
      console.log(`[testing]   ${status} ${relativePath}`);
    });

    const allAssetsExist = assetChecks.every(check => check.exists);
    if (allAssetsExist) {
      console.log('[testing] ✅ All required assets exist\n');
    } else {
      console.log('[testing] ⚠️  Some assets are missing, but theme will still work\n');
    }

    // Step 5: Verify pages
    console.log('[testing] Step 5: Verifying theme pages...');
    const pageFiles = [
      join(__dirname, '..', 'sparti-cms', 'theme', 'str', 'index.tsx'),
      join(__dirname, '..', 'sparti-cms', 'theme', 'str', 'booking.tsx'),
      join(__dirname, '..', 'sparti-cms', 'theme', 'str', 'packages.tsx'),
      join(__dirname, '..', 'sparti-cms', 'theme', 'str', 'pages.json')
    ];

    const pageChecks = pageFiles.map(path => ({
      path,
      exists: existsSync(path)
    }));

    console.log('[testing] Page verification:');
    pageChecks.forEach(({ path, exists }) => {
      const status = exists ? '✅' : '❌';
      const relativePath = path.replace(join(__dirname, '..') + '/', '');
      console.log(`[testing]   ${status} ${relativePath}`);
    });

    const allPagesExist = pageChecks.every(check => check.exists);
    if (allPagesExist) {
      console.log('[testing] ✅ All theme pages exist\n');
    } else {
      console.log('[testing] ⚠️  Some pages are missing\n');
    }

    // Final summary
    console.log('[testing] ========================================');
    console.log('[testing] Connection Summary:');
    console.log(`[testing]   Tenant ID: ${updatedTenant.id}`);
    console.log(`[testing]   Tenant Name: ${updatedTenant.name}`);
    console.log(`[testing]   Tenant Slug: ${updatedTenant.slug}`);
    console.log(`[testing]   Theme ID: ${updatedTenant.theme_id}`);
    console.log('[testing] ========================================');
    console.log('[testing] ✅ STR tenant is now connected to STR theme!');
    console.log('[testing]');
    console.log('[testing] You can now access:');
    console.log('[testing]   - Homepage: /theme/str/');
    console.log('[testing]   - Booking: /theme/str/booking');
    console.log('[testing]   - Packages: /theme/str/packages');
    console.log('[testing]   - Assets: /theme/str/assets/logos/str-logo-1-1024x604.png');

  } catch (error) {
    console.error('[testing] ❌ Error connecting STR tenant:', error);
    throw error;
  }
}

// Run the script
connectSTRTenant()
  .then(() => {
    console.log('[testing] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] Script failed:', error);
    process.exit(1);
  });
