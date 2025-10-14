import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
        message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50),
        user_agent TEXT
      )
    `);

    // Insert default branding settings if they don't exist
    const defaultSettings = [
      { key: 'site_name', value: 'GO SG', type: 'text' },
      { key: 'site_tagline', value: 'Digital Marketing Agency', type: 'text' },
      { key: 'site_logo', value: '', type: 'file' },
      { key: 'site_favicon', value: '', type: 'file' },
    ];

    for (const setting of defaultSettings) {
      await query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (setting_key) DO NOTHING
      `, [setting.key, setting.value, setting.type]);
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
      SELECT setting_key, setting_value, setting_type
      FROM site_settings
      WHERE setting_key IN ('site_name', 'site_tagline', 'site_logo', 'site_favicon')
    `);
    
    // Convert to object format
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error('[testing] Error fetching branding settings:', error);
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
    `, [key, value, key.includes('logo') || key.includes('favicon') ? 'file' : 'text']);
    
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
      await client.query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [key, value, key.includes('logo') || key.includes('favicon') ? 'file' : 'text']);
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

// Form submission functions
export async function saveFormSubmission(formData) {
  try {
    const result = await query(`
      INSERT INTO form_submissions 
        (form_id, form_name, name, email, phone, message, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      formData.form_id,
      formData.form_name,
      formData.name,
      formData.email,
      formData.phone || null,
      formData.message || null
    ]);
    
    console.log('[testing] Form submission saved:', result.rows[0].id);
    return result.rows[0];
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

export default pool;
