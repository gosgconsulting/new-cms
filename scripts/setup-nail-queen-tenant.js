/**
 * Setup nail-queen tenant with pages and settings
 */

import { query } from '../sparti-cms/db/index.js';
import { readThemePages } from '../sparti-cms/services/themeSync.js';

const TENANT_ID = 'tenant-nail-queen';
const THEME_SLUG = 'nail-queen';

async function setupNailQueenTenant() {
  try {
    console.log('[testing] Setting up nail-queen tenant...');

    // Step 1: Verify tenant exists
    const tenantCheck = await query(`
      SELECT id, name, slug, theme_id FROM tenants WHERE id = $1
    `, [TENANT_ID]);

    if (tenantCheck.rows.length === 0) {
      console.log('[testing] Creating tenant-nail-queen...');
      await query(`
        INSERT INTO tenants (id, name, slug, theme_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          theme_id = EXCLUDED.theme_id
      `, [TENANT_ID, 'Nail Queen', 'nail-queen', THEME_SLUG]);
      console.log('[testing] Tenant created/updated');
    } else {
      console.log('[testing] Tenant exists:', tenantCheck.rows[0]);
    }

    // Step 2: Read pages from pages.json
    const pages = readThemePages(THEME_SLUG);
    console.log(`[testing] Found ${pages.length} pages in pages.json`);

    // Step 3: Create/update pages for tenant
    let createdCount = 0;
    let updatedCount = 0;

    for (const pageData of pages) {
      try {
        // Check if page exists for this tenant
        const existingPage = await query(`
          SELECT id FROM pages
          WHERE slug = $1 AND tenant_id = $2
          LIMIT 1
        `, [pageData.slug, TENANT_ID]);

        const now = new Date().toISOString();

        if (existingPage.rows.length > 0) {
          // Update existing page
          await query(`
            UPDATE pages
            SET page_name = $1,
                meta_title = $2,
                meta_description = $3,
                seo_index = $4,
                status = $5,
                page_type = $6,
                updated_at = $7
            WHERE id = $8
          `, [
            pageData.page_name,
            pageData.meta_title || null,
            pageData.meta_description || null,
            pageData.seo_index !== undefined ? pageData.seo_index : true,
            pageData.status || 'published',
            pageData.page_type || 'page',
            now,
            existingPage.rows[0].id
          ]);
          updatedCount++;
          console.log(`[testing] Updated page: ${pageData.page_name}`);
        } else {
          // Create new page
          await query(`
            INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, page_type, theme_id, tenant_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            pageData.page_name,
            pageData.slug,
            pageData.meta_title || null,
            pageData.meta_description || null,
            pageData.seo_index !== undefined ? pageData.seo_index : true,
            pageData.status || 'published',
            pageData.page_type || 'page',
            THEME_SLUG,
            TENANT_ID,
            now,
            now
          ]);
          createdCount++;
          console.log(`[testing] Created page: ${pageData.page_name}`);
        }
      } catch (pageError) {
        console.error(`[testing] Error processing page ${pageData.slug}:`, pageError.message);
      }
    }

    // Step 4: Ensure site settings exist
    const settingsCheck = await query(`
      SELECT COUNT(*) as count FROM site_settings WHERE tenant_id = $1
    `, [TENANT_ID]);

    if (parseInt(settingsCheck.rows[0].count) === 0) {
      console.log('[testing] Creating default site settings...');
      await query(`
        INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
        VALUES 
          ($1, 'site_name', 'Nail Queen', NOW(), NOW()),
          ($1, 'site_tagline', 'Nail Queen by Michelle Tran', NOW(), NOW()),
          ($1, 'site_description', 'Professional nail services in Far East Plaza, Singapore', NOW(), NOW())
        ON CONFLICT (tenant_id, setting_key) DO NOTHING
      `, [TENANT_ID]);
      console.log('[testing] Site settings created');
    }

    console.log('\n[testing] ========================================');
    console.log('[testing] Setup Summary:');
    console.log(`[testing]   Pages created: ${createdCount}`);
    console.log(`[testing]   Pages updated: ${updatedCount}`);
    console.log('[testing] ========================================\n');

    console.log('[testing] Nail Queen tenant setup completed successfully!');

  } catch (error) {
    console.error('[testing] Error setting up tenant:', error);
    throw error;
  }
}

setupNailQueenTenant()
  .then(() => {
    console.log('[testing] Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] Script failed:', error);
    process.exit(1);
  });
