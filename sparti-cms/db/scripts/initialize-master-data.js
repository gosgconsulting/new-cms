/**
 * Initialize Master Data Script
 * 
 * This script populates master/default records (tenant_id = NULL) for:
 * - Site settings (branding, SEO, localization, styles)
 * - SEO elements (sitemap entries, robots config)
 * - Blog elements (categories, tags, optional welcome post)
 * 
 * Master records serve as templates that are copied to new tenants.
 */

import { query } from '../index.js';

/**
 * Initialize master site settings
 */
async function initializeMasterSettings() {
  console.log('[testing] Initializing master site settings...');
  
  const masterSettings = [
    // Branding settings
    {
      setting_key: 'site_name',
      setting_value: 'My Site',
      setting_type: 'text',
      setting_category: 'branding',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'site_tagline',
      setting_value: 'Welcome to our website',
      setting_type: 'text',
      setting_category: 'branding',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'site_description',
      setting_value: 'A modern website built with Sparti CMS',
      setting_type: 'textarea',
      setting_category: 'branding',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'site_logo',
      setting_value: '',
      setting_type: 'media',
      setting_category: 'branding',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'site_favicon',
      setting_value: '',
      setting_type: 'media',
      setting_category: 'branding',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    
    // SEO settings
    {
      setting_key: 'meta_title',
      setting_value: 'My Site - Welcome',
      setting_type: 'text',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'meta_description',
      setting_value: 'A modern website built with Sparti CMS',
      setting_type: 'textarea',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'meta_keywords',
      setting_value: 'website, cms, modern',
      setting_type: 'text',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'meta_author',
      setting_value: '',
      setting_type: 'text',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'og_title',
      setting_value: 'My Site',
      setting_type: 'text',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'og_description',
      setting_value: 'A modern website built with Sparti CMS',
      setting_type: 'textarea',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'og_image',
      setting_value: '',
      setting_type: 'media',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'og_type',
      setting_value: 'website',
      setting_type: 'text',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'twitter_card',
      setting_value: 'summary_large_image',
      setting_type: 'text',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'twitter_site',
      setting_value: '',
      setting_type: 'text',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'twitter_image',
      setting_value: '',
      setting_type: 'media',
      setting_category: 'seo',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    
    // Localization settings
    {
      setting_key: 'site_language',
      setting_value: 'en',
      setting_type: 'text',
      setting_category: 'localization',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'site_country',
      setting_value: 'US',
      setting_type: 'text',
      setting_category: 'localization',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    {
      setting_key: 'site_timezone',
      setting_value: 'UTC',
      setting_type: 'text',
      setting_category: 'localization',
      is_public: true,
      tenant_id: null,
      theme_id: null
    },
    
    // Theme styles (default empty JSON)
    {
      setting_key: 'theme_styles',
      setting_value: JSON.stringify({}),
      setting_type: 'json',
      setting_category: 'theme',
      is_public: false,
      tenant_id: null,
      theme_id: null
    }
  ];

  let inserted = 0;
  let skipped = 0;

  for (const setting of masterSettings) {
    try {
      const result = await query(`
        INSERT INTO site_settings (
          setting_key, setting_value, setting_type, setting_category, 
          is_public, tenant_id, theme_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (setting_key, COALESCE(tenant_id, ''), COALESCE(theme_id, '')) 
        DO NOTHING
        RETURNING id
      `, [
        setting.setting_key,
        setting.setting_value,
        setting.setting_type,
        setting.setting_category,
        setting.is_public,
        setting.tenant_id,
        setting.theme_id
      ]);

      if (result.rows.length > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`[testing] Error inserting setting ${setting.setting_key}:`, error.message);
    }
  }

  console.log(`[testing] Master settings: ${inserted} inserted, ${skipped} already exist`);
  return { inserted, skipped };
}

/**
 * Initialize master sitemap entries
 */
async function initializeMasterSitemap() {
  console.log('[testing] Initializing master sitemap entries...');
  
  try {
    const result = await query(`
      INSERT INTO sitemap_entries (
        url, changefreq, priority, lastmod, sitemap_type, 
        is_active, title, description, tenant_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, NULL, NOW(), NOW())
      ON CONFLICT (url, COALESCE(tenant_id, '')) 
      DO NOTHING
      RETURNING id
    `, [
      '/',
      'daily',
      1.0,
      'main',
      true,
      'Homepage',
      'Welcome to our website'
    ]);

    if (result.rows.length > 0) {
      console.log('[testing] Master sitemap entry created');
      return { inserted: 1, skipped: 0 };
    } else {
      console.log('[testing] Master sitemap entry already exists');
      return { inserted: 0, skipped: 1 };
    }
  } catch (error) {
    console.error('[testing] Error initializing master sitemap:', error.message);
    return { inserted: 0, skipped: 0, error: error.message };
  }
}

/**
 * Initialize master robots config
 */
async function initializeMasterRobots() {
  console.log('[testing] Initializing master robots config...');
  
  const robotsRules = [
    {
      user_agent: '*',
      directive: 'Allow',
      path: '/',
      is_active: true,
      notes: 'Allow all crawlers to access all pages'
    }
  ];

  let inserted = 0;
  let skipped = 0;

  for (const rule of robotsRules) {
    try {
      const result = await query(`
        INSERT INTO robots_config (
          user_agent, directive, path, is_active, notes, tenant_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NULL, NOW(), NOW())
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [
        rule.user_agent,
        rule.directive,
        rule.path,
        rule.is_active,
        rule.notes
      ]);

      if (result.rows.length > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`[testing] Error inserting robots rule:`, error.message);
    }
  }

  console.log(`[testing] Master robots config: ${inserted} inserted, ${skipped} already exist`);
  return { inserted, skipped };
}

/**
 * Initialize master blog elements (categories and tags)
 */
async function initializeMasterBlog() {
  console.log('[testing] Initializing master blog elements...');
  
  const results = {
    categories: { inserted: 0, skipped: 0 },
    tags: { inserted: 0, skipped: 0 }
  };

  // Create default "Uncategorized" category
  try {
    const categoryResult = await query(`
      INSERT INTO categories (
        name, slug, description, tenant_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, NULL, NOW(), NOW())
      ON CONFLICT (slug, COALESCE(tenant_id, '')) 
      DO NOTHING
      RETURNING id
    `, [
      'Uncategorized',
      'uncategorized',
      'Default category for posts without a specific category'
    ]);

    if (categoryResult.rows.length > 0) {
      results.categories.inserted = 1;
      console.log('[testing] Master category "Uncategorized" created');
    } else {
      results.categories.skipped = 1;
      console.log('[testing] Master category "Uncategorized" already exists');
    }
  } catch (error) {
    console.error('[testing] Error creating master category:', error.message);
  }

  // Optional: Create default tags (we'll skip for now to keep it minimal)
  
  return results;
}

/**
 * Main function to initialize all master data
 */
export async function initializeMasterData() {
  console.log('[testing] ==========================================');
  console.log('[testing] Starting Master Data Initialization');
  console.log('[testing] ==========================================');

  const summary = {
    settings: { inserted: 0, skipped: 0 },
    sitemap: { inserted: 0, skipped: 0 },
    robots: { inserted: 0, skipped: 0 },
    blog: { categories: { inserted: 0, skipped: 0 }, tags: { inserted: 0, skipped: 0 } }
  };

  try {
    // Initialize settings
    summary.settings = await initializeMasterSettings();

    // Initialize sitemap
    summary.sitemap = await initializeMasterSitemap();

    // Initialize robots config
    summary.robots = await initializeMasterRobots();

    // Initialize blog elements
    summary.blog = await initializeMasterBlog();

    console.log('[testing] ==========================================');
    console.log('[testing] Master Data Initialization Complete');
    console.log('[testing] ==========================================');
    console.log('[testing] Summary:', JSON.stringify(summary, null, 2));

    return summary;
  } catch (error) {
    console.error('[testing] Error during master data initialization:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeMasterData()
    .then(() => {
      console.log('[testing] Master data initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[testing] Master data initialization failed:', error);
      process.exit(1);
    });
}

