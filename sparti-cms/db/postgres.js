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
    let params = [limit, offset];
    
    if (search) {
      whereClause = `WHERE 
        first_name ILIKE $3 OR 
        last_name ILIKE $3 OR 
        email ILIKE $3 OR 
        company ILIKE $3`;
      params.push(`%${search}%`);
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
      LIMIT $1 OFFSET $2
    `, params);
    
    // Get total count
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

export default pool;
