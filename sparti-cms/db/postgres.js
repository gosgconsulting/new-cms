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
  console.log('[testing] Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('[testing] PostgreSQL connection error:', err);
});

// Helper function to execute queries
export async function query(text, params) {
  const client = await pool.connect();
  try {
    console.log('[testing] Executing query:', { text, params });
    const result = await client.query(text, params);
    console.log('[testing] Query executed successfully, rows:', result.rowCount);
    return result;
  } catch (error) {
    console.error('[testing] Query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('[testing] Initializing Sparti CMS database tables...');
    
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
        ON CONFLICT (setting_key) DO NOTHING
      `, [setting.key, setting.value, setting.type, setting.category, setting.is_public]);
    }

    // Initialize SEO pages tables
    await initializeSEOPagesTables();

    // Initialize enhanced media tables
    try {
      await initializeMediaTables();
    } catch (error) {
      console.log('[testing] Media tables initialization skipped:', error.message);
    }

    // Initialize users management tables
    try {
      await initializeUsersTables();
    } catch (error) {
      console.log('[testing] Users tables initialization skipped:', error.message);
    }

    console.log('[testing] Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('[testing] Database initialization failed:', error);
    return false;
  }
}

// Branding-specific functions
export async function getBrandingSettings() {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type, setting_category, is_public
      FROM site_settings
      WHERE setting_category IN ('branding', 'seo', 'localization') AND is_public = true
      ORDER BY setting_category, setting_key
    `);
    
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
    console.error('[testing] Error fetching branding settings:', error);
    throw error;
  }
}

export async function getPublicSEOSettings() {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type
      FROM site_settings
      WHERE is_public = true AND (setting_category = 'seo' OR setting_key IN ('site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon'))
      ORDER BY setting_key
    `);
    
    // Convert to flat object format for easy access
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error('[testing] Error fetching public SEO settings:', error);
    throw error;
  }
}

export async function updateBrandingSetting(key, value) {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, value, key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 'text']);
    
    console.log('[testing] Updated branding setting:', { key, value });
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating branding setting:', error);
    throw error;
  }
}

export async function updateMultipleBrandingSettings(settings) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      const settingType = key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 
                         key.includes('description') ? 'textarea' : 'text';
      
      await client.query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [key, value, settingType]);
    }
    
    await client.query('COMMIT');
    console.log('[testing] Updated multiple branding settings:', settings);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[testing] Error updating multiple branding settings:', error);
    throw error;
  } finally {
    client.release();
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
    console.log('[testing] Updated SEO settings:', seoSettings);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[testing] Error updating SEO settings:', error);
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
    
    console.log('[testing] Logo migrated to database:', logoMedia.id);
    return logoMedia;
  } catch (error) {
    console.error('[testing] Error migrating logo to database:', error);
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
    
    console.log('[testing] Favicon migrated to database:', faviconMedia.id);
    return faviconMedia;
  } catch (error) {
    console.error('[testing] Error migrating favicon to database:', error);
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
    console.error('[testing] Error getting form:', error);
    throw error;
  }
}

// Get email settings for a form
export async function getEmailSettingsByFormId(formId) {
  try {
    const result = await query('SELECT * FROM email_settings WHERE form_id = $1', [formId]);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error getting email settings:', error);
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
      console.log('[testing] Form not found in new forms table, creating default form for:', formData.form_id);
      
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

    console.log('[testing] Form submission saved to new database:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error saving form submission to new database:', error);
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
      console.error('[testing] Error saving to new forms database:', newDbError);
      // Don't fail the legacy save if new database fails
    }
    
    console.log('[testing] Form submission saved:', legacyResult.rows[0].id);
    return legacyResult.rows[0];
  } catch (error) {
    console.error('[testing] Error saving form submission:', error);
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
    console.error('[testing] Error fetching form submissions:', error);
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
    
    console.log('[testing] Contact created/updated:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating contact:', error);
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
    console.error('[testing] Error fetching contacts:', error);
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
    console.error('[testing] Error fetching contact:', error);
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
    
    console.log('[testing] Contact updated:', contactId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating contact:', error);
    throw error;
  }
}

export async function deleteContact(contactId) {
  try {
    await query(`DELETE FROM contacts WHERE id = $1`, [contactId]);
    console.log('[testing] Contact deleted:', contactId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting contact:', error);
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
    console.error('[testing] Error fetching contacts with messages:', error);
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
    
    console.log('[testing] Project created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating project:', error);
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
    console.error('[testing] Error fetching projects:', error);
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
    
    console.log('[testing] Project updated:', projectId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(projectId) {
  try {
    await query(`DELETE FROM projects WHERE id = $1`, [projectId]);
    console.log('[testing] Project deleted:', projectId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting project:', error);
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
    
    console.log('[testing] Project step created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating project step:', error);
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
    console.error('[testing] Error fetching project steps:', error);
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
    
    console.log('[testing] Project step updated:', stepId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating project step:', error);
    throw error;
  }
}

export async function deleteProjectStep(stepId) {
  try {
    await query(`DELETE FROM project_steps WHERE id = $1`, [stepId]);
    console.log('[testing] Project step deleted:', stepId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting project step:', error);
    throw error;
  }
}

// SEO Pages Management Functions
export async function initializeSEOPagesTables() {
  try {
    console.log('[testing] Initializing SEO pages tables...');
    
    // Create enhanced pages table with SEO metadata
    await query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create landing pages table with SEO metadata
    await query(`
      CREATE TABLE IF NOT EXISTS landing_pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT true,
        campaign_source VARCHAR(100),
        conversion_goal VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create legal pages table with SEO metadata
    await query(`
      CREATE TABLE IF NOT EXISTS legal_pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT false,
        legal_type VARCHAR(100),
        last_reviewed_date DATE,
        version VARCHAR(20) DEFAULT '1.0',
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_seo_index ON pages(seo_index)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_landing_pages_status ON landing_pages(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_landing_pages_seo_index ON landing_pages(seo_index)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_legal_pages_slug ON legal_pages(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_legal_pages_status ON legal_pages(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_legal_pages_legal_type ON legal_pages(legal_type)`);

    console.log('[testing] SEO pages tables initialized successfully');
    return true;
  } catch (error) {
    console.error('[testing] SEO pages tables initialization failed:', error);
    return false;
  }
}

// Pages CRUD functions
export async function createPage(pageData) {
  try {
    const result = await query(`
      INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      pageData.page_name,
      pageData.slug,
      pageData.meta_title || null,
      pageData.meta_description || null,
      pageData.seo_index !== undefined ? pageData.seo_index : true,
      pageData.status || 'draft'
    ]);
    
    console.log('[testing] Page created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating page:', error);
    throw error;
  }
}

export async function getPages() {
  try {
    const result = await query(`
      SELECT * FROM pages 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching pages:', error);
    throw error;
  }
}

export async function getPage(pageId) {
  try {
    const result = await query(`
      SELECT * FROM pages WHERE id = $1
    `, [pageId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching page:', error);
    throw error;
  }
}

export async function updatePage(pageId, pageData) {
  try {
    const result = await query(`
      UPDATE pages 
      SET 
        page_name = COALESCE($2, page_name),
        slug = COALESCE($3, slug),
        meta_title = COALESCE($4, meta_title),
        meta_description = COALESCE($5, meta_description),
        seo_index = COALESCE($6, seo_index),
        status = COALESCE($7, status),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      pageId,
      pageData.page_name,
      pageData.slug,
      pageData.meta_title,
      pageData.meta_description,
      pageData.seo_index,
      pageData.status
    ]);
    
    console.log('[testing] Page updated:', pageId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating page:', error);
    throw error;
  }
}

export async function deletePage(pageId) {
  try {
    await query(`DELETE FROM pages WHERE id = $1`, [pageId]);
    console.log('[testing] Page deleted:', pageId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting page:', error);
    throw error;
  }
}

// Landing Pages CRUD functions
export async function createLandingPage(pageData) {
  try {
    const result = await query(`
      INSERT INTO landing_pages (page_name, slug, meta_title, meta_description, seo_index, campaign_source, conversion_goal, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      pageData.page_name,
      pageData.slug,
      pageData.meta_title || null,
      pageData.meta_description || null,
      pageData.seo_index !== undefined ? pageData.seo_index : true,
      pageData.campaign_source || null,
      pageData.conversion_goal || null,
      pageData.status || 'draft'
    ]);
    
    console.log('[testing] Landing page created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating landing page:', error);
    throw error;
  }
}

export async function getLandingPages() {
  try {
    const result = await query(`
      SELECT * FROM landing_pages 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching landing pages:', error);
    throw error;
  }
}

export async function getLandingPage(pageId) {
  try {
    const result = await query(`
      SELECT * FROM landing_pages WHERE id = $1
    `, [pageId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching landing page:', error);
    throw error;
  }
}

export async function updateLandingPage(pageId, pageData) {
  try {
    const result = await query(`
      UPDATE landing_pages 
      SET 
        page_name = COALESCE($2, page_name),
        slug = COALESCE($3, slug),
        meta_title = COALESCE($4, meta_title),
        meta_description = COALESCE($5, meta_description),
        seo_index = COALESCE($6, seo_index),
        campaign_source = COALESCE($7, campaign_source),
        conversion_goal = COALESCE($8, conversion_goal),
        status = COALESCE($9, status),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      pageId,
      pageData.page_name,
      pageData.slug,
      pageData.meta_title,
      pageData.meta_description,
      pageData.seo_index,
      pageData.campaign_source,
      pageData.conversion_goal,
      pageData.status
    ]);
    
    console.log('[testing] Landing page updated:', pageId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating landing page:', error);
    throw error;
  }
}

export async function deleteLandingPage(pageId) {
  try {
    await query(`DELETE FROM landing_pages WHERE id = $1`, [pageId]);
    console.log('[testing] Landing page deleted:', pageId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting landing page:', error);
    throw error;
  }
}

// Legal Pages CRUD functions
export async function createLegalPage(pageData) {
  try {
    const result = await query(`
      INSERT INTO legal_pages (page_name, slug, meta_title, meta_description, seo_index, legal_type, last_reviewed_date, version, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      pageData.page_name,
      pageData.slug,
      pageData.meta_title || null,
      pageData.meta_description || null,
      pageData.seo_index !== undefined ? pageData.seo_index : false,
      pageData.legal_type || null,
      pageData.last_reviewed_date || null,
      pageData.version || '1.0',
      pageData.status || 'draft'
    ]);
    
    console.log('[testing] Legal page created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating legal page:', error);
    throw error;
  }
}

export async function getLegalPages() {
  try {
    const result = await query(`
      SELECT * FROM legal_pages 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching legal pages:', error);
    throw error;
  }
}

export async function getLegalPage(pageId) {
  try {
    const result = await query(`
      SELECT * FROM legal_pages WHERE id = $1
    `, [pageId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching legal page:', error);
    throw error;
  }
}

export async function updateLegalPage(pageId, pageData) {
  try {
    const result = await query(`
      UPDATE legal_pages 
      SET 
        page_name = COALESCE($2, page_name),
        slug = COALESCE($3, slug),
        meta_title = COALESCE($4, meta_title),
        meta_description = COALESCE($5, meta_description),
        seo_index = COALESCE($6, seo_index),
        legal_type = COALESCE($7, legal_type),
        last_reviewed_date = COALESCE($8, last_reviewed_date),
        version = COALESCE($9, version),
        status = COALESCE($10, status),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      pageId,
      pageData.page_name,
      pageData.slug,
      pageData.meta_title,
      pageData.meta_description,
      pageData.seo_index,
      pageData.legal_type,
      pageData.last_reviewed_date,
      pageData.version,
      pageData.status
    ]);
    
    console.log('[testing] Legal page updated:', pageId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating legal page:', error);
    throw error;
  }
}

export async function deleteLegalPage(pageId) {
  try {
    await query(`DELETE FROM legal_pages WHERE id = $1`, [pageId]);
    console.log('[testing] Legal page deleted:', pageId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting legal page:', error);
    throw error;
  }
}

// Utility function to get all pages with their types
export async function getAllPagesWithTypes() {
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
        'page' as page_type,
        created_at,
        updated_at,
        NULL as campaign_source,
        NULL as conversion_goal,
        NULL as legal_type,
        NULL as last_reviewed_date,
        NULL as version
      FROM pages
      UNION ALL
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        'landing' as page_type,
        created_at,
        updated_at,
        campaign_source,
        conversion_goal,
        NULL as legal_type,
        NULL as last_reviewed_date,
        NULL as version
      FROM landing_pages
      UNION ALL
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        'legal' as page_type,
        created_at,
        updated_at,
        NULL as campaign_source,
        NULL as conversion_goal,
        legal_type,
        last_reviewed_date,
        version
      FROM legal_pages
      ORDER BY page_type, created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching all pages with types:', error);
    throw error;
  }
}

// Slug management functions
export async function updatePageSlug(pageId, pageType, newSlug, oldSlug) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Validate slug format
    if (!newSlug.startsWith('/')) {
      newSlug = '/' + newSlug;
    }
    
    // Check if slug already exists in any table
    const existingSlug = await client.query(`
      SELECT 'page' as table_name, slug FROM pages WHERE slug = $1
      UNION ALL
      SELECT 'landing' as table_name, slug FROM landing_pages WHERE slug = $1
      UNION ALL
      SELECT 'legal' as table_name, slug FROM legal_pages WHERE slug = $1
    `, [newSlug]);
    
    if (existingSlug.rows.length > 0) {
      throw new Error(`Slug '${newSlug}' already exists`);
    }
    
    // Update the appropriate table
    let updateResult;
    switch (pageType) {
      case 'page':
        updateResult = await client.query(`
          UPDATE pages SET slug = $1, updated_at = NOW() WHERE id = $2 RETURNING *
        `, [newSlug, pageId]);
        break;
      case 'landing':
        updateResult = await client.query(`
          UPDATE landing_pages SET slug = $1, updated_at = NOW() WHERE id = $2 RETURNING *
        `, [newSlug, pageId]);
        break;
      case 'legal':
        updateResult = await client.query(`
          UPDATE legal_pages SET slug = $1, updated_at = NOW() WHERE id = $2 RETURNING *
        `, [newSlug, pageId]);
        break;
      default:
        throw new Error(`Invalid page type: ${pageType}`);
    }
    
    // If this is a blog page update, handle blog post slug adaptation
    if (oldSlug === '/blog' && newSlug !== '/blog') {
      console.log('[testing] Blog slug changed, blog post adaptation needed');
      // Note: Blog posts are currently hardcoded in frontend files
      // This would need to be implemented when blog posts are moved to database
      await logSlugChange(pageId, pageType, oldSlug, newSlug, 'Blog slug changed - manual blog post update required');
    }
    
    await client.query('COMMIT');
    console.log('[testing] Slug updated successfully:', { pageId, pageType, oldSlug, newSlug });
    
    return updateResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[testing] Error updating slug:', error);
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
    
    console.log('[testing] Slug change logged:', { pageId, pageType, oldSlug, newSlug });
  } catch (error) {
    console.error('[testing] Error logging slug change:', error);
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
    console.error('[testing] Error fetching slug change history:', error);
    return [];
  }
}

export default pool;
