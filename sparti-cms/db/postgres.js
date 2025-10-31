import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_PUBLIC_URL || 
                   process.env.DATABASE_URL || 
                   'postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway',
  ssl: { rejectUnauthorized: false }, // Always use SSL with Railway
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Helper function to execute queries
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to check user tenant access
export const canUserAccessTenant = (user, tenantId) => {
  if (!user) return false;
  if (user.is_super_admin) return true;
  return user.tenant_id === tenantId;
};

// Page Layout Helpers
export async function getLayoutBySlug(slug) {
  try {
    const pageRes = await query(`SELECT id FROM pages WHERE slug = $1`, [slug]);
    if (pageRes.rows.length === 0) return null;
    const pageId = pageRes.rows[0].id;
    const layoutRes = await query(`SELECT layout_json, version, updated_at FROM page_layouts WHERE page_id = $1`, [pageId]);
    return layoutRes.rows[0] || { layout_json: { components: [] }, version: 1 };
  } catch (error) {
    console.error('Error fetching layout by slug:', error);
    throw error;
  }
}

export async function upsertLayoutBySlug(slug, layoutJson) {
  try {
    const pageRes = await query(`SELECT id FROM pages WHERE slug = $1`, [slug]);
    if (pageRes.rows.length === 0) {
      throw new Error('Page not found for slug: ' + slug);
    }
    const pageId = pageRes.rows[0].id;
    const result = await query(`
      INSERT INTO page_layouts (page_id, layout_json, version, updated_at)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (page_id)
      DO UPDATE SET layout_json = EXCLUDED.layout_json, version = page_layouts.version + 1, updated_at = NOW()
      RETURNING layout_json, version
    `, [pageId, layoutJson]);
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting layout by slug:', error);
    throw error;
  }
}

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
    
    const tenantsSchemaPath = path.join(__dirname, 'tenants-migrations.sql');
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
    await initializeSEOPagesTables();

    // Initialize enhanced media tables
    try {
      await initializeMediaTables();
    } catch (error) {
      console.log('Media tables initialization skipped:', error.message);
    }

    // Initialize users management tables
    try {
      await initializeUsersTables();
    } catch (error) {
      console.log('Users tables initialization skipped:', error.message);
    }

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Branding-specific functions
export async function getBrandingSettings(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type, setting_category, is_public, tenant_id
      FROM site_settings
      WHERE setting_category IN ('branding', 'seo', 'localization') 
        AND is_public = true
        AND tenant_id = $1
      ORDER BY setting_category, setting_key
    `, [tenantId]);
    
    // Convert to object format grouped by category
    const settings = {
      branding: {},
      seo: {},
      localization: {}
    };
    
    result.rows.forEach((row) => {
      const category = row.setting_category || 'branding';
      if (!settings[category]) settings[category] = {};
      settings[category][row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching branding settings for tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function getPublicSEOSettings(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type
      FROM site_settings
      WHERE is_public = true 
        AND (setting_category = 'seo' OR setting_key IN ('site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon'))
        AND tenant_id = $1
      ORDER BY setting_key
    `, [tenantId]);
    
    // Convert to flat object format for easy access
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching public SEO settings for tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function updateBrandingSetting(key, value, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, tenant_id)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      key, 
      value, 
      key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 'text',
      tenantId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating branding setting for tenant ${tenantId}:`, error);
    throw error;
  }
}

// Site Schema functions
export async function getSiteSchema(schemaKey, tenantId) {
  try {
    const result = await query(`
      SELECT schema_value
      FROM site_schemas
      WHERE schema_key = $1 AND tenant_id = $2
    `, [schemaKey, tenantId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse the JSON schema_value
    const schemaValue = result.rows[0].schema_value;
    return typeof schemaValue === 'string' ? JSON.parse(schemaValue) : schemaValue;
  } catch (error) {
    console.error('Error fetching site schema:', error);
    throw error;
  }
}

export async function updateSiteSchema(schemaKey, schemaValue, tenantId) {
  try {
    const result = await query(`
      INSERT INTO site_schemas (schema_key, schema_value, tenant_id, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (schema_key, tenant_id)
      DO UPDATE SET 
        schema_value = EXCLUDED.schema_value,
        updated_at = NOW()
      RETURNING *
    `, [schemaKey, JSON.stringify(schemaValue), tenantId]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating site schema:', error);
    throw error;
  }
}

export async function updateMultipleBrandingSettings(settings, tenantId = 'tenant-gosg') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      const settingType = key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 
                         key.includes('description') ? 'textarea' : 'text';
      
      await client.query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, tenant_id)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
        ON CONFLICT (setting_key, tenant_id) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [key, value, settingType, tenantId]);
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating multiple branding settings for tenant ${tenantId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}
export async function getsitesettingsbytenant(tenantId) {
  try {
    const result = await query(`
      SELECT * FROM site_settings WHERE tenant_id = $1
    `, [tenantId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching site settings by tenant:', error);
    throw error;
  }
}
// Site Settings functions
export async function getSiteSettingByKey(key, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type, setting_category, is_public, tenant_id
      FROM site_settings
      WHERE setting_key = $1 AND tenant_id = $2
      LIMIT 1
    `, [key, tenantId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error fetching site setting for key ${key} and tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function updateSiteSettingByKey(key, value, type = 'text', category = 'general', tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, updated_at, tenant_id)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        setting_type = COALESCE(EXCLUDED.setting_type, site_settings.setting_type),
        setting_category = COALESCE(EXCLUDED.setting_category, site_settings.setting_category),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, value, type, category, tenantId]);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating site setting for key ${key} and tenant ${tenantId}:`, error);
    throw error;
  }
}

// SEO-specific functions
export async function updateSEOSettings(seoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const seoSettings = {
      meta_title: seoData.meta_title,
      meta_description: seoData.meta_description,
      meta_keywords: seoData.meta_keywords,
      meta_author: seoData.meta_author,
      og_title: seoData.og_title,
      og_description: seoData.og_description,
      og_image: seoData.og_image,
      og_type: seoData.og_type,
      twitter_card: seoData.twitter_card,
      twitter_site: seoData.twitter_site,
      twitter_image: seoData.twitter_image
    };
    
    for (const [key, value] of Object.entries(seoSettings)) {
      if (value !== undefined) {
        const settingType = key.includes('image') ? 'media' : 
                           key.includes('description') ? 'textarea' : 'text';
        
        await client.query(`
          INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, updated_at)
          VALUES ($1, $2, $3, 'seo', true, CURRENT_TIMESTAMP)
          ON CONFLICT (setting_key) 
          DO UPDATE SET 
            setting_value = EXCLUDED.setting_value,
            updated_at = CURRENT_TIMESTAMP
        `, [key, value, settingType]);
      }
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating SEO settings:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Media migration functions
export async function migrateLogoToDatabase(logoPath, altText = 'Site Logo') {
  try {
    // Create media item for logo
    const logoMediaData = {
      filename: 'site-logo.png',
      original_filename: 'go-sg-logo-official.png',
      alt_text: altText,
      title: 'Site Logo',
      description: 'Main site logo',
      url: logoPath,
      relative_path: logoPath,
      mime_type: 'image/png',
      file_extension: 'png',
      file_size: 50000, // Estimated size
      media_type: 'image',
      folder_id: null, // Will be assigned to logos folder
      is_featured: true,
      seo_optimized: true
    };
    
    const logoMedia = await createMediaItem(logoMediaData);
    
    // Update site_logo setting with media ID
    await updateBrandingSetting('site_logo', logoMedia.id.toString());
    
    console.log('Logo migrated to database:', logoMedia.id);
    return logoMedia;
  } catch (error) {
    console.error('Error migrating logo to database:', error);
    throw error;
  }
}

export async function migrateFaviconToDatabase(faviconPath) {
  try {
    // Create media item for favicon
    const faviconMediaData = {
      filename: 'favicon.png',
      original_filename: 'favicon.png',
      alt_text: 'Site Favicon',
      title: 'Site Favicon',
      description: 'Site favicon icon',
      url: faviconPath,
      relative_path: faviconPath,
      mime_type: 'image/png',
      file_extension: 'png',
      file_size: 5000, // Estimated size
      width: 32,
      height: 32,
      media_type: 'image',
      folder_id: null,
      is_featured: true,
      seo_optimized: true
    };
    
    const faviconMedia = await createMediaItem(faviconMediaData);
    
    // Update site_favicon setting with media ID
    await updateBrandingSetting('site_favicon', faviconMedia.id.toString());
    
    console.log('Favicon migrated to database:', faviconMedia.id);
    return faviconMedia;
  } catch (error) {
    console.error('Error migrating favicon to database:', error);
    throw error;
  }
}

// Form submission functions
// New Forms Management Database Functions

// Get form by ID or name
export async function getFormById(formId) {
  try {
    // Try to parse as integer first, if it fails, search by name
    const isNumeric = !isNaN(parseInt(formId));
    
    let result;
    if (isNumeric) {
      result = await query('SELECT * FROM forms WHERE id = $1 OR name = $1', [parseInt(formId), formId]);
    } else {
      result = await query('SELECT * FROM forms WHERE name = $1', [formId]);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting form:', error);
    throw error;
  }
}

// Get email settings for a form
export async function getEmailSettingsByFormId(formId) {
  try {
    const result = await query('SELECT * FROM email_settings WHERE form_id = $1', [formId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting email settings:', error);
    return null; // Return null if no settings found
  }
}

// Save form submission to new forms database
export async function saveFormSubmissionExtended(formData) {
  try {
    // First, try to find the form in the new forms table
    let form = await getFormById(formData.form_id);
    
    // If form doesn't exist in new table, create a default one for backward compatibility
    if (!form) {
      console.log('Form not found in new forms table, creating default form for:', formData.form_id);
      
      const defaultFormResult = await query(`
        INSERT INTO forms (name, description, fields, settings, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `, [
        formData.form_name || formData.form_id,
        `Auto-created form for ${formData.form_id}`,
        JSON.stringify([
          { field_name: 'name', field_type: 'text', field_label: 'Name', is_required: true, sort_order: 1 },
          { field_name: 'email', field_type: 'email', field_label: 'Email', is_required: true, sort_order: 2 },
          { field_name: 'phone', field_type: 'tel', field_label: 'Phone', is_required: false, sort_order: 3 },
          { field_name: 'company', field_type: 'text', field_label: 'Company', is_required: false, sort_order: 4 },
          { field_name: 'message', field_type: 'textarea', field_label: 'Message', is_required: true, sort_order: 5 }
        ]),
        JSON.stringify({ submit_button_text: 'Send Message', success_message: 'Thank you for your message!' })
      ]);
      
      form = defaultFormResult.rows[0];
      
      // Create default email settings
      await query(`
        INSERT INTO email_settings (
          form_id, notification_enabled, notification_emails, notification_subject, 
          notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template, from_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        form.id,
        true,
        ['admin@gosg.com.sg'],
        `New ${form.name} Submission`,
        'You have received a new form submission from {{name}} ({{email}}).\n\nMessage:\n{{message}}\n\nPhone: {{phone}}\nCompany: {{company}}',
        true,
        'Thank you for contacting GOSG',
        'Dear {{name}},\n\nThank you for contacting us. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nGOSG Team',
        'GOSG Team'
      ]);
    }

    // Prepare submission data
    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      message: formData.message
    };

    // Save to new form_submissions_extended table
    const result = await query(`
      INSERT INTO form_submissions_extended 
        (form_id, submission_data, submitter_email, submitter_name, submitter_ip, user_agent, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'new')
      RETURNING *
    `, [
      form.id,
      JSON.stringify(submissionData),
      formData.email,
      formData.name,
      formData.ip_address,
      formData.user_agent
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving form submission to new database:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function saveFormSubmission(formData) {
  try {
    // Save to both old and new tables for compatibility
    const legacyResult = await query(`
      INSERT INTO form_submissions 
        (form_id, form_name, name, email, phone, company, message, status, ip_address, user_agent, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      formData.form_id,
      formData.form_name,
      formData.name,
      formData.email,
      formData.phone || null,
      formData.company || null,
      formData.message || null,
      formData.status || 'new',
      formData.ip_address || null,
      formData.user_agent || null
    ]);
    
    // Also save to new forms database for integration
    try {
      await saveFormSubmissionExtended(formData);
    } catch (newDbError) {
      console.error('Error saving to new forms database:', newDbError);
      // Don't fail the legacy save if new database fails
    }
    
    return legacyResult.rows[0];
  } catch (error) {
    console.error('Error saving form submission:', error);
    throw error;
  }
}

export async function getFormSubmissions(formId) {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        message,
        submitted_at
      FROM form_submissions
      WHERE form_id = $1
      ORDER BY submitted_at DESC
    `, [formId]);
    
    // Format for frontend
    const formatted = result.rows.map(row => ({
      id: row.id.toString(),
      date: new Date(row.submitted_at).toLocaleString('en-SG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      data: {
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        message: row.message || ''
      }
    }));
    
    return formatted;
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    throw error;
  }
}

// Contact management functions
export async function createContact(contactData) {
  try {
    const result = await query(`
      INSERT INTO contacts 
        (first_name, last_name, email, phone, company, source, notes, status, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) 
      DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = COALESCE(EXCLUDED.phone, contacts.phone),
        company = COALESCE(EXCLUDED.company, contacts.company),
        source = CASE WHEN contacts.source = 'form' THEN EXCLUDED.source ELSE contacts.source END,
        notes = COALESCE(EXCLUDED.notes, contacts.notes),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      contactData.first_name,
      contactData.last_name || null,
      contactData.email,
      contactData.phone || null,
      contactData.company || null,
      contactData.source || 'form',
      contactData.notes || null,
      contactData.status || 'new',
      contactData.tags || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function getContacts(limit = 50, offset = 0, search = '') {
  try {
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = `WHERE 
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1 OR 
        company ILIKE $1`;
      params = [`%${search}%`, limit, offset];
    } else {
      params = [limit, offset];
    }
    
    const result = await query(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        company,
        source,
        status,
        tags,
        created_at,
        updated_at
      FROM contacts 
      ${whereClause}
      ORDER BY created_at DESC
      ${search ? 'LIMIT $2 OFFSET $3' : 'LIMIT $1 OFFSET $2'}
    `, params);
    
    // Get total count - use consistent parameter indexing
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM contacts 
      ${whereClause}
    `, search ? [`%${search}%`] : []);
    
    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

export async function getContact(contactId) {
  try {
    const result = await query(`
      SELECT * FROM contacts WHERE id = $1
    `, [contactId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
}

export async function updateContact(contactId, contactData) {
  try {
    const result = await query(`
      UPDATE contacts 
      SET 
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        company = COALESCE($6, company),
        source = COALESCE($7, source),
        notes = COALESCE($8, notes),
        status = COALESCE($9, status),
        tags = COALESCE($10, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      contactId,
      contactData.first_name,
      contactData.last_name,
      contactData.email,
      contactData.phone,
      contactData.company,
      contactData.source,
      contactData.notes,
      contactData.status,
      contactData.tags
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

export async function deleteContact(contactId) {
  try {
    await query(`DELETE FROM contacts WHERE id = $1`, [contactId]);
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

export async function getContactsWithMessages(limit = 50, offset = 0, search = '') {
  try {
    let whereClause = '';
    let params = [limit, offset];
    
    if (search) {
      whereClause = `WHERE 
        c.first_name ILIKE $3 OR 
        c.last_name ILIKE $3 OR 
        c.email ILIKE $3 OR 
        c.company ILIKE $3`;
      params.push(`%${search}%`);
    }
    
    const result = await query(`
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.company,
        c.source,
        c.status,
        c.tags,
        c.notes,
        c.created_at,
        c.updated_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN fs.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', fs.id,
                'form_name', fs.form_name,
                'message', fs.message,
                'submitted_at', fs.submitted_at
              )
            END
          ) FILTER (WHERE fs.id IS NOT NULL), 
          '[]'::json
        ) as form_messages
      FROM contacts c
      LEFT JOIN form_submissions fs ON c.email = fs.email
      ${whereClause}
      GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.company, c.source, c.status, c.tags, c.notes, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    // Get total count
    const countResult = await query(`
      SELECT COUNT(DISTINCT c.id) as total 
      FROM contacts c
      LEFT JOIN form_submissions fs ON c.email = fs.email
      ${whereClause}
    `, search ? [`%${search}%`] : []);
    
    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching contacts with messages:', error);
    throw error;
  }
}

// Project management functions
export async function createProject(projectData) {
  try {
    const result = await query(`
      INSERT INTO projects 
        (title, description, status, category, priority, start_date, end_date, progress)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      projectData.title,
      projectData.description || null,
      projectData.status || 'active',
      projectData.category || null,
      projectData.priority || 'medium',
      projectData.start_date || null,
      projectData.end_date || null,
      projectData.progress || 0
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COUNT(ps.id) as total_steps,
        COUNT(CASE WHEN ps.status = 'completed' THEN 1 END) as completed_steps
      FROM projects p
      LEFT JOIN project_steps ps ON p.id = ps.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    return result.rows.map(row => ({
      ...row,
      total_steps: parseInt(row.total_steps) || 0,
      completed_steps: parseInt(row.completed_steps) || 0,
      completion_percentage: row.total_steps > 0 
        ? Math.round((row.completed_steps / row.total_steps) * 100) 
        : 0
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function updateProject(projectId, projectData) {
  try {
    const result = await query(`
      UPDATE projects 
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        category = COALESCE($5, category),
        priority = COALESCE($6, priority),
        start_date = COALESCE($7, start_date),
        end_date = COALESCE($8, end_date),
        progress = COALESCE($9, progress),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      projectId,
      projectData.title,
      projectData.description,
      projectData.status,
      projectData.category,
      projectData.priority,
      projectData.start_date,
      projectData.end_date,
      projectData.progress
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(projectId) {
  try {
    await query(`DELETE FROM projects WHERE id = $1`, [projectId]);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Project steps functions
export async function createProjectStep(stepData) {
  try {
    const result = await query(`
      INSERT INTO project_steps 
        (project_id, title, description, status, step_order, estimated_hours, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      stepData.project_id,
      stepData.title,
      stepData.description || null,
      stepData.status || 'pending',
      stepData.step_order || 0,
      stepData.estimated_hours || null,
      stepData.assigned_to || null,
      stepData.due_date || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating project step:', error);
    throw error;
  }
}

export async function getProjectSteps(projectId) {
  try {
    const result = await query(`
      SELECT * FROM project_steps 
      WHERE project_id = $1 
      ORDER BY step_order ASC, created_at ASC
    `, [projectId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching project steps:', error);
    throw error;
  }
}

export async function updateProjectStep(stepId, stepData) {
  try {
    const result = await query(`
      UPDATE project_steps 
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        step_order = COALESCE($5, step_order),
        estimated_hours = COALESCE($6, estimated_hours),
        actual_hours = COALESCE($7, actual_hours),
        assigned_to = COALESCE($8, assigned_to),
        due_date = COALESCE($9, due_date),
        completed_at = CASE WHEN $4 = 'completed' AND status != 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      stepId,
      stepData.title,
      stepData.description,
      stepData.status,
      stepData.step_order,
      stepData.estimated_hours,
      stepData.actual_hours,
      stepData.assigned_to,
      stepData.due_date
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating project step:', error);
    throw error;
  }
}

export async function deleteProjectStep(stepId) {
  try {
    await query(`DELETE FROM project_steps WHERE id = $1`, [stepId]);
    return true;
  } catch (error) {
    console.error('Error deleting project step:', error);
    throw error;
  }
}

// SEO Pages Management Functions - Unified Table Structure
export async function initializeSEOPagesTables() {
  try {
    console.log('Initializing unified pages table...');
    
    // Create unified pages table with all page types
    await query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'draft',
        page_type VARCHAR(50) NOT NULL DEFAULT 'page',
        tenant_id VARCHAR(255) NOT NULL DEFAULT 'tenant-gosg',
        
        -- Landing page specific fields (nullable)
        campaign_source VARCHAR(100),
        conversion_goal VARCHAR(255),
        
        -- Legal page specific fields (nullable)
        legal_type VARCHAR(100),
        last_reviewed_date DATE,
        version VARCHAR(20) DEFAULT '1.0',
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Constraints
        CONSTRAINT unique_slug_per_tenant UNIQUE (slug, tenant_id),
        CONSTRAINT valid_page_type CHECK (page_type IN ('page', 'landing', 'legal'))
      )
    `);

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_tenant_id ON pages(tenant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_tenant_type ON pages(tenant_id, page_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_slug_tenant ON pages(slug, tenant_id)`);

    // Page layout tables for server-rendered pages
    await query(`
      CREATE TABLE IF NOT EXISTS page_layouts (
        id SERIAL PRIMARY KEY,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        layout_json JSONB NOT NULL DEFAULT '{"components":[]}',
        version INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(page_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS page_components (
        id SERIAL PRIMARY KEY,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        component_key VARCHAR(100) NOT NULL,
        props JSONB NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Seed a default homepage and layout if not present
    const homePageRes = await query(`SELECT id FROM pages WHERE slug = '/'`);
    let homePageId = homePageRes.rows[0]?.id;
    if (!homePageId) {
      const created = await query(`
        INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status)
        VALUES ('Homepage', '/', 'GO SG - Professional SEO Services Singapore', 'Leading SEO agency in Singapore providing comprehensive digital marketing solutions to boost your online presence and drive organic traffic.', true, 'published')
        RETURNING id
      `);
      homePageId = created.rows[0].id;
    }

    const layoutCheck = await query(`SELECT 1 FROM page_layouts WHERE page_id = $1`, [homePageId]);
    if (layoutCheck.rows.length === 0) {
      const defaultLayout = {
        components: [
          { key: 'Header', props: {} },
          { key: 'HeroSection', props: { headline: 'Rank #1 on Google' } },
          { key: 'SEOResultsSection', props: {} },
          { key: 'SEOServicesShowcase', props: {} },
          { key: 'NewTestimonials', props: {} },
          { key: 'FAQAccordion', props: { title: 'Frequently Asked Questions' } },
          { key: 'BlogSection', props: {} },
          { key: 'ContactForm', props: {} },
          { key: 'Footer', props: {} },
        ]
      };
      await query(`
        INSERT INTO page_layouts (page_id, layout_json, version, updated_at)
        VALUES ($1, $2, 1, NOW())
        ON CONFLICT (page_id) DO NOTHING
      `, [homePageId, defaultLayout]);
    }

    console.log('Unified pages table initialized successfully');
    return true;
  } catch (error) {
    console.error('Pages table initialization failed:', error);
    return false;
  }
}

// Unified Pages CRUD functions
export async function createPage(pageData) {
  try {
    const {
      page_type = 'page',
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version,
      tenant_id = 'tenant-gosg',
      ...commonFields
    } = pageData;

    const result = await query(`
      INSERT INTO pages (
        page_name, slug, meta_title, meta_description, seo_index, status,
        page_type, tenant_id, campaign_source, conversion_goal,
        legal_type, last_reviewed_date, version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      commonFields.page_name,
      commonFields.slug,
      commonFields.meta_title || null,
      commonFields.meta_description || null,
      commonFields.seo_index !== undefined ? commonFields.seo_index : (page_type === 'legal' ? false : true),
      commonFields.status || 'draft',
      page_type,
      tenant_id,
      campaign_source || null,
      conversion_goal || null,
      legal_type || null,
      last_reviewed_date || null,
      version || (page_type === 'legal' ? '1.0' : null)
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
}

export async function getPages(pageType = null, tenantId = 'tenant-gosg') {
  try {
    let whereClause = 'WHERE tenant_id = $1';
    let params = [tenantId];
    
    if (pageType) {
      whereClause += ' AND page_type = $2';
      params.push(pageType);
    }
    
    const result = await query(`
      SELECT * FROM pages 
      ${whereClause}
      ORDER BY page_type, created_at DESC
    `, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
}

export async function getPage(pageId, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT * FROM pages WHERE id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

export async function updatePage(pageId, pageData, tenantId = 'tenant-gosg') {
  try {
    const {
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version,
      ...commonFields
    } = pageData;

    const result = await query(`
      UPDATE pages 
      SET 
        page_name = COALESCE($2, page_name),
        slug = COALESCE($3, slug),
        meta_title = COALESCE($4, meta_title),
        meta_description = COALESCE($5, meta_description),
        seo_index = COALESCE($6, seo_index),
        status = COALESCE($7, status),
        campaign_source = COALESCE($8, campaign_source),
        conversion_goal = COALESCE($9, conversion_goal),
        legal_type = COALESCE($10, legal_type),
        last_reviewed_date = COALESCE($11, last_reviewed_date),
        version = COALESCE($12, version),
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $13
      RETURNING *
    `, [
      pageId,
      commonFields.page_name,
      commonFields.slug,
      commonFields.meta_title,
      commonFields.meta_description,
      commonFields.seo_index,
      commonFields.status,
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version,
      tenantId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
}

export async function deletePage(pageId, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`DELETE FROM pages WHERE id = $1 AND tenant_id = $2`, [pageId, tenantId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
}

// Note: Separate CRUD functions for landing and legal pages have been removed.
// Use the unified createPage, getPages, updatePage, deletePage functions with page_type parameter.

// Utility function to get all pages with their types
export async function getAllPagesWithTypes(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        created_at,
        updated_at,
        campaign_source,
        conversion_goal,
        legal_type,
        last_reviewed_date,
        version
      FROM pages
      WHERE tenant_id = $1
      ORDER BY page_type, created_at DESC
    `, [tenantId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching all pages with types:', error);
    throw error;
  }
}

// Slug management functions
export async function updatePageSlug(pageId, pageType, newSlug, oldSlug, tenantId = 'tenant-gosg') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Validate slug format
    if (!newSlug.startsWith('/')) {
      newSlug = '/' + newSlug;
    }
    
    // Check if slug already exists for this tenant
    const existingSlug = await client.query(`
      SELECT slug FROM pages WHERE slug = $1 AND tenant_id = $2 AND id != $3
    `, [newSlug, tenantId, pageId]);
    
    if (existingSlug.rows.length > 0) {
      throw new Error(`Slug '${newSlug}' already exists`);
    }
    
    // Update the page slug
    const updateResult = await client.query(`
      UPDATE pages 
      SET slug = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
      RETURNING *
    `, [newSlug, pageId, tenantId, pageType]);
    
    if (updateResult.rows.length === 0) {
      throw new Error(`Page not found or page type mismatch`);
    }
    
    // If this is a blog page update, handle blog post slug adaptation
    if (oldSlug === '/blog' && newSlug !== '/blog') {
      console.log('Blog slug changed, blog post adaptation needed');
      // Note: Blog posts are currently hardcoded in frontend files
      // This would need to be implemented when blog posts are moved to database
      await logSlugChange(pageId, pageType, oldSlug, newSlug, 'Blog slug changed - manual blog post update required');
    }
    
    await client.query('COMMIT');
    return updateResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating slug:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to validate slug format
export function validateSlug(slug) {
  // Remove leading/trailing whitespace
  slug = slug.trim();
  
  // Add leading slash if missing
  if (!slug.startsWith('/')) {
    slug = '/' + slug;
  }
  
  // Validate slug format (alphanumeric, hyphens, slashes only)
  const slugRegex = /^\/[a-z0-9\-\/]*$/;
  if (!slugRegex.test(slug)) {
    throw new Error('Slug can only contain lowercase letters, numbers, hyphens, and slashes');
  }
  
  // Prevent double slashes
  if (slug.includes('//')) {
    throw new Error('Slug cannot contain double slashes');
  }
  
  // Prevent ending with slash (except root)
  if (slug.length > 1 && slug.endsWith('/')) {
    slug = slug.slice(0, -1);
  }
  
  return slug;
}

// Function to log slug changes for audit purposes
export async function logSlugChange(pageId, pageType, oldSlug, newSlug, notes = null) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS slug_change_log (
        id SERIAL PRIMARY KEY,
        page_id INTEGER NOT NULL,
        page_type VARCHAR(20) NOT NULL,
        old_slug VARCHAR(255) NOT NULL,
        new_slug VARCHAR(255) NOT NULL,
        notes TEXT,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await query(`
      INSERT INTO slug_change_log (page_id, page_type, old_slug, new_slug, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [pageId, pageType, oldSlug, newSlug, notes]);
    
  } catch (error) {
    console.error('Error logging slug change:', error);
    // Don't throw error here as this is just for logging
  }
}

// Function to get slug change history
export async function getSlugChangeHistory(pageId = null, pageType = null) {
  try {
    let whereClause = '';
    let params = [];
    
    if (pageId && pageType) {
      whereClause = 'WHERE page_id = $1 AND page_type = $2';
      params = [pageId, pageType];
    } else if (pageType) {
      whereClause = 'WHERE page_type = $1';
      params = [pageType];
    }
    
    const result = await query(`
      SELECT * FROM slug_change_log 
      ${whereClause}
      ORDER BY changed_at DESC
    `, params);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching slug change history:', error);
    return [];
  }
}

// Update page name
export async function updatePageName(pageId, pageType, newName, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      UPDATE pages 
      SET page_name = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
    `, [newName, pageId, tenantId, pageType]);
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating page name:', error);
    throw error;
  }
}

// Toggle SEO index
export async function toggleSEOIndex(pageId, pageType, currentIndex, tenantId = 'tenant-gosg') {
  try {
    const newIndex = !currentIndex;
    
    const result = await query(`
      UPDATE pages 
      SET seo_index = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
    `, [newIndex, pageId, tenantId, pageType]);
    
    return newIndex;
  } catch (error) {
    console.error('Error toggling SEO index:', error);
    throw error;
  }
}

// Get page with layout data
export async function getPageWithLayout(pageId, tenantId = 'tenant-gosg') {
  try {
    // First, get the page data
    const pageResult = await query(`
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        created_at,
        updated_at
      FROM pages
      WHERE id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    
    if (pageResult.rows.length === 0) {
      return null;
    }
    
    const page = pageResult.rows[0];
    
    // Get the layout data
    const layoutResult = await query(`
      SELECT layout_json, version, updated_at
      FROM page_layouts
      WHERE page_id = $1
      ORDER BY version DESC
      LIMIT 1
    `, [pageId]);
    
    if (layoutResult.rows.length > 0) {
      page.layout = layoutResult.rows[0].layout_json;
    }
    
    return page;
  } catch (error) {
    console.error('Error fetching page with layout:', error);
    throw error;
  }
}

// Update page data
export async function updatePageData(pageId, pageName, metaTitle, metaDescription, seoIndex, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      UPDATE pages 
      SET page_name = $1, meta_title = $2, meta_description = $3, seo_index = $4, updated_at = NOW()
      WHERE id = $5 AND tenant_id = $6
    `, [pageName, metaTitle, metaDescription, seoIndex, pageId, tenantId]);
    
    if (result.rowCount > 0) {
      return true;
    }
    
    console.log(`Page ${pageId} not found for tenant ${tenantId}`);
    return false;
  } catch (error) {
    console.error('Error updating page data:', error);
    throw error;
  }
}

// Update page layout
export async function updatePageLayout(pageId, layoutJson, tenantId = 'tenant-gosg') {
  try {
    // Check if page exists
    const pageCheck = await query(`
      SELECT id FROM pages WHERE id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    
    if (pageCheck.rows.length === 0) {
      console.log(`Page ${pageId} not found for tenant ${tenantId}`);
      return false;
    }
    
    // Update existing layout or insert new one
    const result = await query(`
      INSERT INTO page_layouts (page_id, layout_json, version, updated_at)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (page_id) 
      DO UPDATE SET 
        layout_json = EXCLUDED.layout_json,
        updated_at = NOW()
    `, [pageId, JSON.stringify(layoutJson)]);
    
    return true;
  } catch (error) {
    console.error('Error updating page layout:', error);
    throw error;
  }
}

// Real CRUD functions for content management
export async function getPosts() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function getPost(id) {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

export async function createPost(data) {
  try {
    // Insert the post
    const postResult = await query(`
      INSERT INTO posts (
        title, slug, content, excerpt, status, post_type, author_id,
        meta_title, meta_description, meta_keywords, canonical_url,
        og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
        published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      data.title,
      data.slug,
      data.content || '',
      data.excerpt || '',
      data.status || 'draft',
      data.post_type || 'post',
      data.author_id,
      data.meta_title || '',
      data.meta_description || '',
      data.meta_keywords || '',
      data.canonical_url || '',
      data.og_title || '',
      data.og_description || '',
      data.og_image || '',
      data.twitter_title || '',
      data.twitter_description || '',
      data.twitter_image || '',
      data.published_at
    ]);

    const post = postResult.rows[0];

    // Handle categories
    if (data.categories && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        // Get the term_taxonomy_id for this category
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
        `, [categoryId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [post.id, taxonomyResult.rows[0].id]);
        }
      }
    }

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        // Get the term_taxonomy_id for this tag
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
        `, [tagId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [post.id, taxonomyResult.rows[0].id]);
        }
      }
    }

    return await getPost(post.id);
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updatePost(id, data) {
  try {
    // Update the post
    const postResult = await query(`
      UPDATE posts SET
        title = COALESCE($2, title),
        slug = COALESCE($3, slug),
        content = COALESCE($4, content),
        excerpt = COALESCE($5, excerpt),
        status = COALESCE($6, status),
        author_id = COALESCE($7, author_id),
        meta_title = COALESCE($8, meta_title),
        meta_description = COALESCE($9, meta_description),
        meta_keywords = COALESCE($10, meta_keywords),
        og_title = COALESCE($11, og_title),
        og_description = COALESCE($12, og_description),
        twitter_title = COALESCE($13, twitter_title),
        twitter_description = COALESCE($14, twitter_description),
        published_at = COALESCE($15, published_at),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, data.title, data.slug, data.content, data.excerpt, data.status, data.author_id, data.meta_title, data.meta_description, data.meta_keywords, data.og_title, data.og_description, data.twitter_title, data.twitter_description, data.published_at]);

    if (postResult.rows.length === 0) {
      throw new Error('Post not found');
    }

    // Clear existing relationships
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [id]);

    // Handle categories
    if (data.categories && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
        `, [categoryId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [id, taxonomyResult.rows[0].id]);
        }
      }
    }

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
        `, [tagId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [id, taxonomyResult.rows[0].id]);
        }
      }
    }

    return await getPost(id);
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deletePost(id) {
  try {
    // Delete relationships first
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [id]);
    
    // Delete the post
    const result = await query(`DELETE FROM posts WHERE id = $1 RETURNING *`, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Post not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function getTerms() {
  try {
    const result = await query(`
      SELECT t.*, tt.taxonomy, tt.description as taxonomy_description
      FROM terms t
      LEFT JOIN term_taxonomy tt ON t.id = tt.term_id
      ORDER BY t.name
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching terms:', error);
    throw error;
  }
}

export async function getTerm(id) {
  try {
    const result = await query(`
      SELECT t.*, tt.taxonomy, tt.description as taxonomy_description
      FROM terms t
      LEFT JOIN term_taxonomy tt ON t.id = tt.term_id
      WHERE t.id = $1
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching term:', error);
    throw error;
  }
}

export async function createTerm(data) {
  try {
    // Insert the term
    const termResult = await query(`
      INSERT INTO terms (name, slug, description, meta_title, meta_description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      data.name,
      data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      data.description || '',
      data.meta_title || `${data.name} - GO SG Digital Marketing`,
      data.meta_description || data.description || `Learn about ${data.name} with GO SG's expert insights and strategies.`
    ]);

    const term = termResult.rows[0];

    // Create taxonomy relationship if specified
    if (data.taxonomy) {
      await query(`
        INSERT INTO term_taxonomy (term_id, taxonomy, description)
        VALUES ($1, $2, $3)
      `, [term.id, data.taxonomy, data.description || `${data.taxonomy} for ${data.name} content`]);
    }

    return term;
  } catch (error) {
    console.error('Error creating term:', error);
    throw error;
  }
}

export async function updateTerm(id, data) {
  try {
    const result = await query(`
      UPDATE terms SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        meta_title = COALESCE($5, meta_title),
        meta_description = COALESCE($6, meta_description),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, data.name, data.slug, data.description, data.meta_title, data.meta_description]);
    
    if (result.rows.length === 0) {
      throw new Error('Term not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating term:', error);
    throw error;
  }
}

export async function deleteTerm(id) {
  try {
    // Delete relationships first
    await query(`DELETE FROM term_relationships WHERE term_taxonomy_id IN (SELECT id FROM term_taxonomy WHERE term_id = $1)`, [id]);
    
    // Delete taxonomy entries
    await query(`DELETE FROM term_taxonomy WHERE term_id = $1`, [id]);
    
    // Delete the term
    const result = await query(`DELETE FROM terms WHERE id = $1 RETURNING *`, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Term not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting term:', error);
    throw error;
  }
}

export default pool;
