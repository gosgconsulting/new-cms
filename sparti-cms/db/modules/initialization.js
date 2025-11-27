import { query } from '../connection.js';
import { runMigrations } from '../sequelize/run-migrations.js';

// Initialize tenant tables using Sequelize migrations
export async function initializeTenantTables() {
  try {
    console.log('Initializing tenant tables...');
    
    // Run tenant tables migration
    await runMigrations(['20241202000001-create-tenant-tables.js']);
    
    console.log('Tenant tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing tenant tables:', error);
    return false;
  }
}

// Initialize users management tables using Sequelize migrations
export async function initializeUsersTables() {
  try {
    console.log('Initializing users tables...');
    
    // Run user tables migration
    await runMigrations(['20241202000002-create-user-tables.js']);
    
    console.log('Users tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing users tables:', error);
    throw error; // Re-throw so it can be caught and logged properly
  }
}

// Initialize database tables using Sequelize migrations
export async function initializeDatabase() {
  try {
    console.log('Initializing Sparti CMS database tables...');
    
    // Run core tables migration (site_settings, form_submissions, contacts, projects, project_steps)
    await runMigrations(['20241202000000-create-core-tables.js']);
    
    // Initialize tenant tables
    await initializeTenantTables();

    // Insert default branding settings if they don't exist
    const defaultSettings = [
      // Basic Site Information
      { key: 'site_name', value: 'GO SG', type: 'text', category: 'branding', is_public: true },
      { key: 'site_tagline', value: 'Digital Marketing Agency', type: 'text', category: 'branding', is_public: true },
      { key: 'site_description', value: 'We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.', type: 'textarea', category: 'branding', is_public: true },
      
      // SEO Meta Information
      { key: 'meta_title', value: 'GO SG - Digital Marketing Agency', type: 'text', category: 'seo', is_public: true },
      { key: 'meta_description', value: 'GO SG - We grow your revenue at the highest ROI through integrated digital marketing solutions.', type: 'textarea', category: 'seo', is_public: true },
      { key: 'meta_keywords', value: 'SEO, digital marketing, Singapore, organic traffic, search rankings', type: 'text', category: 'seo', is_public: true },
      { key: 'meta_author', value: 'GO SG', type: 'text', category: 'seo', is_public: true },
      
      // Open Graph Meta
      { key: 'og_title', value: 'GO SG - Digital Marketing Agency', type: 'text', category: 'seo', is_public: true },
      { key: 'og_description', value: 'Integrated marketing solutions for SMEs and high-performing brands.', type: 'textarea', category: 'seo', is_public: true },
      { key: 'og_image', value: '', type: 'media', category: 'seo', is_public: true },
      { key: 'og_type', value: 'website', type: 'text', category: 'seo', is_public: true },
      
      // Twitter Card Meta
      { key: 'twitter_card', value: 'summary_large_image', type: 'text', category: 'seo', is_public: true },
      { key: 'twitter_site', value: '@gosgconsulting', type: 'text', category: 'seo', is_public: true },
      { key: 'twitter_image', value: '', type: 'media', category: 'seo', is_public: true },
      
      // Media Assets
      { key: 'site_logo', value: '', type: 'media', category: 'branding', is_public: true },
      { key: 'site_favicon', value: '', type: 'media', category: 'branding', is_public: true },
      
      // Location & Language
      { key: 'site_country', value: 'Singapore', type: 'text', category: 'localization', is_public: true },
      { key: 'site_language', value: 'en', type: 'text', category: 'localization', is_public: true },
      { key: 'site_timezone', value: 'Asia/Singapore', type: 'text', category: 'localization', is_public: true },
    ];

    for (const setting of defaultSettings) {
      await query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [setting.key, setting.value, setting.type, setting.category, setting.is_public]);
    }

    // Initialize SEO pages tables
    const { initializeSEOPagesTables } = await import('./pages.js');
    await initializeSEOPagesTables();

    // Initialize enhanced media tables (optional - may not exist)
    try {
      // Try to import and call initializeMediaTables if it exists
      const { initializeMediaTables } = await import('../media-management.js').catch(() => ({}));
      if (initializeMediaTables) {
        await initializeMediaTables();
      }
    } catch (error) {
      console.log('Media tables initialization skipped:', error.message);
    }

    // Initialize users management tables (required for authentication)
    try {
      const usersInitSuccess = await initializeUsersTables();
      if (!usersInitSuccess) {
        throw new Error('Users tables initialization returned false');
      }
      console.log('[testing] Users tables initialized successfully');
    } catch (error) {
      console.error('[testing] Error initializing users tables:', error);
      // Users table is critical for authentication, so we should fail initialization
      throw new Error(`Failed to initialize users tables: ${error.message}`);
    }

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

