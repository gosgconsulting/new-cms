import { query, executeMultiStatementSQL } from '../connection.js';

// Initialize tenant tables
export async function initializeTenantTables() {
  try {
    console.log('Initializing tenant tables...');
    
    // Read the SQL schema file
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const tenantsSchemaPath = path.join(__dirname, '..', 'migrations', '002_tenants.sql');
    const tenantsSql = fs.readFileSync(tenantsSchemaPath, 'utf8');
    
    // Execute the schema SQL
    await query(tenantsSql);
    
    console.log('Tenant tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing tenant tables:', error);
    return false;
  }
}

// Initialize users management tables
export async function initializeUsersTables() {
  try {
    console.log('Initializing users tables...');
    
    // Read the SQL schema file
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const usersSchemaPath = path.join(__dirname, '..', 'migrations', '003_users.sql');
    const usersSql = fs.readFileSync(usersSchemaPath, 'utf8');
    
    // Execute the schema SQL using multi-statement executor
    try {
      await executeMultiStatementSQL(usersSql);
      console.log('[testing] Users migration SQL executed');
    } catch (sqlError) {
      console.error('[testing] Error executing users migration SQL:', sqlError.message);
      // Continue anyway - table might already exist
    }
    
    // Verify users table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('[testing] ERROR: Users table was not created!');
      throw new Error('Users table creation failed');
    }
    console.log('[testing] Verified users table exists');
    
    // Add tenant_id, is_super_admin, and status columns if they don't exist (for backward compatibility)
    try {
      await query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255);
      `);
      await query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
      `);
      await query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
      `);
    } catch (err) {
      // Columns might already exist, that's okay
      console.log('[testing] Some user columns may already exist:', err.message);
    }
    
    // Initialize user_access_keys table if it doesn't exist
    try {
      const accessKeysSchemaPath = path.join(__dirname, '..', 'migrations', '004_access_keys.sql');
      const accessKeysSql = fs.readFileSync(accessKeysSchemaPath, 'utf8');
      await query(accessKeysSql);
      console.log('User access keys table initialized');
    } catch (err) {
      console.log('[testing] Access keys table initialization skipped:', err.message);
    }
    
    console.log('Users tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing users tables:', error);
    throw error; // Re-throw so it can be caught and logged properly
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('Initializing Sparti CMS database tables...');
    
    // Create site_settings table for branding and configuration
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        setting_category VARCHAR(100) DEFAULT 'general',
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Initialize tenant tables
    await initializeTenantTables();

    // Create form_submissions table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id SERIAL PRIMARY KEY,
        form_id VARCHAR(255) NOT NULL,
        form_name VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50),
        user_agent TEXT
      )
    `);

    // Create contacts table for CMS contact management
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        source VARCHAR(100) DEFAULT 'form',
        notes TEXT,
        status VARCHAR(50) DEFAULT 'new',
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email)
      )
    `);

    // Create projects table for developer project management
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        category VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create project_steps table for project steps/tasks
    await query(`
      CREATE TABLE IF NOT EXISTS project_steps (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        step_order INTEGER DEFAULT 0,
        estimated_hours DECIMAL(5,2),
        actual_hours DECIMAL(5,2),
        assigned_to VARCHAR(255),
        due_date DATE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

