/**
 * Tenant Initialization Module
 * 
 * This module handles initializing minimal tenant-specific data for new tenants.
 * Shared tables (Blog, Settings, SEO, Branding) use master data (tenant_id = NULL)
 * that is automatically accessible to all tenants. Only tenant-specific overrides
 * are created here. Pages remain fully tenant-specific with custom JSON schemas.
 */

import { query } from './index.js';

/**
 * Initialize minimal default data for a new tenant
 * Creates only tenant-specific records that link to shared master data
 * @param {string} tenantId - The ID of the tenant to initialize
 * @returns {Promise<Object>} Summary of initialized records
 */
export async function initializeTenantDefaults(tenantId) {
  console.log(`[testing] Initializing defaults for tenant: ${tenantId}`);
  
  const summary = {
    settings: { inserted: 0, skipped: 0 },
    branding: { inserted: 0, skipped: 0 },
    sitemap: { inserted: 0, skipped: 0 },
    robots: { inserted: 0, skipped: 0 },
    blog: { 
      categories: { inserted: 0, skipped: 0 },
      tags: { inserted: 0, skipped: 0 }
    },
    errors: []
  };

  try {
    // 1. Initialize default branding settings for the tenant only
    // Master settings (tenant_id = NULL) are automatically accessible to all tenants
    console.log(`[testing] Initializing default branding settings for tenant ${tenantId}...`);
    try {
      // Get tenant name for default site_name
      const tenantResult = await query(`
        SELECT name FROM tenants WHERE id = $1
      `, [tenantId]);
      
      const tenantName = tenantResult.rows[0]?.name || 'New Site';
      
      // Default branding settings - only tenant-specific overrides
      const defaultBrandingSettings = [
        {
          key: 'site_name',
          value: tenantName,
          type: 'text',
          category: 'branding'
        },
        {
          key: 'site_tagline',
          value: '',
          type: 'text',
          category: 'branding'
        },
        {
          key: 'site_description',
          value: '',
          type: 'textarea',
          category: 'branding'
        }
      ];
      
      let brandingInserted = 0;
      for (const setting of defaultBrandingSettings) {
        // Check if setting already exists
        const existing = await query(`
          SELECT id FROM site_settings 
          WHERE setting_key = $1 AND tenant_id = $2 AND theme_id IS NULL
          LIMIT 1
        `, [setting.key, tenantId]);
        
        if (existing.rows.length === 0) {
          await query(`
            INSERT INTO site_settings (
              setting_key, setting_value, setting_type, setting_category,
              is_public, tenant_id, theme_id, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, true, $5, NULL, NOW(), NOW())
          `, [
            setting.key,
            setting.value,
            setting.type,
            setting.category,
            tenantId
          ]);
          brandingInserted++;
        }
      }
      
      summary.branding.inserted = brandingInserted;
      summary.settings.inserted = brandingInserted; // Branding settings are part of site_settings
      console.log(`[testing] Initialized ${summary.branding.inserted} branding settings`);
    } catch (brandingError) {
      console.error(`[testing] Error initializing branding settings:`, brandingError);
      summary.errors.push(`Branding settings initialization: ${brandingError.message}`);
    }

    // 2. Sitemap entries: Copy master sitemap entries to tenant
    // Master entries (tenant_id = NULL) are copied to the tenant when it's created
    // This ensures each tenant has its own sitemap that can be customized independently
    console.log(`[testing] Copying master sitemap entries to tenant ${tenantId}...`);
    try {
      // Get all master sitemap entries (tenant_id IS NULL)
      const masterEntries = await query(`
        SELECT url, changefreq, priority, sitemap_type, title, description, object_id, object_type
        FROM sitemap_entries
        WHERE tenant_id IS NULL AND is_active = true
      `);
      
      let sitemapInserted = 0;
      for (const entry of masterEntries.rows) {
        // Check if entry already exists for this tenant
        const existing = await query(`
          SELECT id FROM sitemap_entries 
          WHERE url = $1 AND tenant_id = $2
          LIMIT 1
        `, [entry.url, tenantId]);
        
        if (existing.rows.length === 0) {
          // Copy master entry to tenant
          await query(`
            INSERT INTO sitemap_entries (
              url, changefreq, priority, sitemap_type, title, description,
              object_id, object_type, tenant_id, is_active, lastmod, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW(), NOW())
          `, [
            entry.url,
            entry.changefreq,
            entry.priority,
            entry.sitemap_type,
            entry.title || '',
            entry.description || '',
            entry.object_id,
            entry.object_type,
            tenantId
          ]);
          sitemapInserted++;
        }
      }
      
      summary.sitemap.inserted = sitemapInserted;
      console.log(`[testing] Copied ${summary.sitemap.inserted} sitemap entries to tenant ${tenantId}`);
    } catch (sitemapError) {
      console.error(`[testing] Error copying sitemap entries:`, sitemapError);
      summary.errors.push(`Sitemap entries initialization: ${sitemapError.message}`);
      summary.sitemap.inserted = 0;
    }

    // 3. Robots config: Don't copy master data
    // Tenants will automatically access master robots_config (tenant_id = NULL)
    // They can add tenant-specific rules if needed
    console.log(`[testing] Skipping robots_config copy - tenants access master data (tenant_id = NULL)`);
    summary.robots.inserted = 0;

    // 4. Categories: Don't copy master data
    // Tenants will automatically access master categories (tenant_id = NULL)
    // They can add tenant-specific categories if needed
    console.log(`[testing] Skipping categories copy - tenants access master data (tenant_id = NULL)`);
    summary.blog.categories.inserted = 0;

    // 5. Tags: Don't copy master data
    // Tenants will automatically access master tags (tenant_id = NULL)
    // They can add tenant-specific tags if needed
    console.log(`[testing] Skipping tags copy - tenants access master data (tenant_id = NULL)`);
    summary.blog.tags.inserted = 0;

    // 7. Pages: Don't create Header/Footer automatically
    // Master Header and Footer pages (tenant_id = NULL) are shared and accessible to all tenants
    // Tenants can create tenant-specific Header/Footer pages if they need custom ones
    console.log(`[testing] Skipping Header/Footer page creation - tenants access master pages (tenant_id = NULL)`);

    // 8. Initialize empty media folders for the tenant
    console.log(`[testing] Initializing media folders for tenant ${tenantId}...`);
    try {
      const { initializeTenantMediaFolders } = await import('./modules/media.js');
      const folders = await initializeTenantMediaFolders(tenantId);
      console.log(`[testing] Created ${folders.length} media folders for tenant ${tenantId}`);
    } catch (mediaError) {
      console.error(`[testing] Error initializing media folders:`, mediaError);
      summary.errors.push(`Media folders initialization: ${mediaError.message}`);
    }

    // Optional: Copy posts from master (if any exist)
    // We'll skip this for now as posts are typically tenant-specific content

    console.log(`[testing] Tenant initialization complete for ${tenantId}`);
    console.log(`[testing] Summary:`, JSON.stringify(summary, null, 2));
    console.log(`[testing] Note: Shared tables (Blog, Settings, SEO, Branding) use master data (tenant_id = NULL) accessible to all tenants`);

    // Format summary for API response
    const formattedSummary = {
      total: (summary.settings.inserted || 0) + 
             (summary.branding.inserted || 0) +
             (summary.sitemap.inserted || 0),
      settings: summary.settings.inserted || 0,
      branding: summary.branding.inserted || 0,
      sitemap: summary.sitemap.inserted || 0,
      robots: 0, // No longer copying - tenants access master data
      categories: 0, // No longer copying - tenants access master data
      tags: 0 // No longer copying - tenants access master data
    };

    return {
      ...summary,
      summary: formattedSummary
    };
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

    const brandingCount = await query(`
      SELECT COUNT(*) as count 
      FROM site_settings 
      WHERE tenant_id = $1 
        AND setting_category = 'branding' 
        AND setting_key IN ('site_name', 'site_tagline', 'site_description')
        AND theme_id IS NULL
    `, [tenantId]);

    return {
      settings: parseInt(settingsCount.rows[0]?.count || 0),
      branding: parseInt(brandingCount.rows[0]?.count || 0),
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

