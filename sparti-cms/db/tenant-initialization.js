/**
 * Tenant Initialization Module
 * 
 * This module handles copying master/default data (tenant_id = NULL) 
 * to new tenants when they are created.
 */

import { query } from './index.js';

/**
 * Initialize default data for a new tenant by copying master records
 * @param {string} tenantId - The ID of the tenant to initialize
 * @returns {Promise<Object>} Summary of initialized records
 */
export async function initializeTenantDefaults(tenantId) {
  console.log(`[testing] Initializing defaults for tenant: ${tenantId}`);
  
  const summary = {
    settings: { inserted: 0, skipped: 0 },
    sitemap: { inserted: 0, skipped: 0 },
    robots: { inserted: 0, skipped: 0 },
    blog: { 
      categories: { inserted: 0, skipped: 0 },
      tags: { inserted: 0, skipped: 0 }
    },
    errors: []
  };

  try {
    // 1. Copy site_settings from master (tenant_id IS NULL) to tenant
    console.log(`[testing] Copying site_settings for tenant ${tenantId}...`);
    const settingsResult = await query(`
      INSERT INTO site_settings (
        setting_key, setting_value, setting_type, setting_category,
        is_public, tenant_id, theme_id, created_at, updated_at
      )
      SELECT 
        setting_key, setting_value, setting_type, setting_category,
        is_public, $1 as tenant_id, theme_id, NOW(), NOW()
      FROM site_settings
      WHERE tenant_id IS NULL
      ON CONFLICT (setting_key, COALESCE(tenant_id, ''), COALESCE(theme_id, '')) 
      DO NOTHING
    `, [tenantId]);

    summary.settings.inserted = settingsResult.rowCount || 0;
    console.log(`[testing] Copied ${summary.settings.inserted} site_settings`);

    // 2. Copy sitemap_entries from master to tenant
    console.log(`[testing] Copying sitemap_entries for tenant ${tenantId}...`);
    // Check for existing entries first to avoid conflicts
    const existingSitemap = await query(`
      SELECT url FROM sitemap_entries WHERE tenant_id = $1
    `, [tenantId]);
    const existingUrls = new Set(existingSitemap.rows.map(r => r.url));
    
    const sitemapToInsert = await query(`
      SELECT url, changefreq, priority, lastmod, sitemap_type,
        is_active, object_id, object_type, title, description, image_url
      FROM sitemap_entries
      WHERE tenant_id IS NULL
    `);
    
    let sitemapInserted = 0;
    for (const entry of sitemapToInsert.rows) {
      if (!existingUrls.has(entry.url)) {
        await query(`
          INSERT INTO sitemap_entries (
            url, changefreq, priority, lastmod, sitemap_type,
            is_active, object_id, object_type, title, description, image_url,
            tenant_id, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        `, [
          entry.url,
          entry.changefreq,
          entry.priority,
          entry.lastmod,
          entry.sitemap_type,
          entry.is_active,
          entry.object_id,
          entry.object_type,
          entry.title,
          entry.description,
          entry.image_url,
          tenantId
        ]);
        sitemapInserted++;
      }
    }
    
    const sitemapResult = { rowCount: sitemapInserted };

    summary.sitemap.inserted = sitemapResult.rowCount || 0;
    console.log(`[testing] Copied ${summary.sitemap.inserted} sitemap_entries`);

    // 3. Copy robots_config from master to tenant
    // Note: robots_config doesn't have a unique constraint, so we check for duplicates manually
    console.log(`[testing] Copying robots_config for tenant ${tenantId}...`);
    const existingRobots = await query(`
      SELECT user_agent, directive, path
      FROM robots_config
      WHERE tenant_id = $1
    `, [tenantId]);
    
    const existingRobotsSet = new Set(
      existingRobots.rows.map(r => `${r.user_agent}:${r.directive}:${r.path}`)
    );
    
    const robotsToInsert = await query(`
      SELECT user_agent, directive, path, is_active, notes
      FROM robots_config
      WHERE tenant_id IS NULL
    `);
    
    let robotsInserted = 0;
    for (const robot of robotsToInsert.rows) {
      const key = `${robot.user_agent}:${robot.directive}:${robot.path}`;
      if (!existingRobotsSet.has(key)) {
        await query(`
          INSERT INTO robots_config (
            user_agent, directive, path, is_active, notes,
            tenant_id, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [
          robot.user_agent,
          robot.directive,
          robot.path,
          robot.is_active,
          robot.notes,
          tenantId
        ]);
        robotsInserted++;
      }
    }
    
    const robotsResult = { rowCount: robotsInserted };

    summary.robots.inserted = robotsResult.rowCount || 0;
    console.log(`[testing] Copied ${summary.robots.inserted} robots_config rules`);

    // 4. Copy categories from master to tenant
    console.log(`[testing] Copying categories for tenant ${tenantId}...`);
    const categoriesResult = await query(`
      INSERT INTO categories (
        name, slug, description, parent_id, meta_title, meta_description,
        post_count, tenant_id, created_at, updated_at
      )
      SELECT 
        name, slug, description, parent_id, meta_title, meta_description,
        post_count, $1 as tenant_id, NOW(), NOW()
      FROM categories
      WHERE tenant_id IS NULL
      ON CONFLICT (slug, COALESCE(tenant_id, '')) 
      DO NOTHING
    `, [tenantId]);

    summary.blog.categories.inserted = categoriesResult.rowCount || 0;
    console.log(`[testing] Copied ${summary.blog.categories.inserted} categories`);

    // 5. Copy tags from master to tenant
    console.log(`[testing] Copying tags for tenant ${tenantId}...`);
    const tagsResult = await query(`
      INSERT INTO tags (
        name, slug, description, meta_title, meta_description,
        post_count, tenant_id, created_at, updated_at
      )
      SELECT 
        name, slug, description, meta_title, meta_description,
        post_count, $1 as tenant_id, NOW(), NOW()
      FROM tags
      WHERE tenant_id IS NULL
      ON CONFLICT (slug, COALESCE(tenant_id, '')) 
      DO NOTHING
    `, [tenantId]);

    summary.blog.tags.inserted = tagsResult.rowCount || 0;
    console.log(`[testing] Copied ${summary.blog.tags.inserted} tags`);

    // 6. Create Header and Footer pages for the tenant
    console.log(`[testing] Creating Header and Footer pages for tenant ${tenantId}...`);
    const { createPage } = await import('./modules/pages.js');
    
    // Create Header page
    try {
      const headerCheck = await query(`
        SELECT id FROM pages WHERE tenant_id = $1 AND page_type = 'header'
      `, [tenantId]);
      
      if (headerCheck.rows.length === 0) {
        await createPage({
          page_name: 'Header',
          slug: '/header',
          page_type: 'header',
          status: 'published',
          seo_index: false,
          tenant_id: tenantId,
          meta_title: 'Header',
          meta_description: 'Site header configuration'
        });
        console.log(`[testing] Created Header page for tenant ${tenantId}`);
      }
    } catch (headerError) {
      console.error(`[testing] Error creating Header page:`, headerError);
      summary.errors.push(`Header page creation: ${headerError.message}`);
    }
    
    // Create Footer page
    try {
      const footerCheck = await query(`
        SELECT id FROM pages WHERE tenant_id = $1 AND page_type = 'footer'
      `, [tenantId]);
      
      if (footerCheck.rows.length === 0) {
        await createPage({
          page_name: 'Footer',
          slug: '/footer',
          page_type: 'footer',
          status: 'published',
          seo_index: false,
          tenant_id: tenantId,
          meta_title: 'Footer',
          meta_description: 'Site footer configuration'
        });
        console.log(`[testing] Created Footer page for tenant ${tenantId}`);
      }
    } catch (footerError) {
      console.error(`[testing] Error creating Footer page:`, footerError);
      summary.errors.push(`Footer page creation: ${footerError.message}`);
    }

    // Optional: Copy posts from master (if any exist)
    // We'll skip this for now as posts are typically tenant-specific content

    console.log(`[testing] Tenant initialization complete for ${tenantId}`);
    console.log(`[testing] Summary:`, JSON.stringify(summary, null, 2));

    return summary;
  } catch (error) {
    console.error(`[testing] Error initializing tenant ${tenantId}:`, error);
    summary.errors.push(error.message);
    throw error;
  }
}

/**
 * Check if a tenant has been initialized (has any default data)
 * @param {string} tenantId - The ID of the tenant to check
 * @returns {Promise<boolean>} True if tenant has been initialized
 */
export async function isTenantInitialized(tenantId) {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM site_settings
      WHERE tenant_id = $1
      LIMIT 1
    `, [tenantId]);

    return parseInt(result.rows[0]?.count || 0) > 0;
  } catch (error) {
    console.error(`[testing] Error checking tenant initialization status:`, error);
    return false;
  }
}

/**
 * Get initialization summary for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Promise<Object>} Summary of initialized records
 */
export async function getTenantInitializationSummary(tenantId) {
  try {
    const [settingsCount, sitemapCount, robotsCount, categoriesCount, tagsCount] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM site_settings WHERE tenant_id = $1`, [tenantId]),
      query(`SELECT COUNT(*) as count FROM sitemap_entries WHERE tenant_id = $1`, [tenantId]),
      query(`SELECT COUNT(*) as count FROM robots_config WHERE tenant_id = $1`, [tenantId]),
      query(`SELECT COUNT(*) as count FROM categories WHERE tenant_id = $1`, [tenantId]),
      query(`SELECT COUNT(*) as count FROM tags WHERE tenant_id = $1`, [tenantId])
    ]);

    return {
      settings: parseInt(settingsCount.rows[0]?.count || 0),
      sitemap: parseInt(sitemapCount.rows[0]?.count || 0),
      robots: parseInt(robotsCount.rows[0]?.count || 0),
      categories: parseInt(categoriesCount.rows[0]?.count || 0),
      tags: parseInt(tagsCount.rows[0]?.count || 0)
    };
  } catch (error) {
    console.error(`[testing] Error getting tenant initialization summary:`, error);
    throw error;
  }
}

