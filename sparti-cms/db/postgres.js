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

    // Initialize SEO pages tables
    await initializeSEOPagesTables();

    // Initialize enhanced media tables
    await initializeMediaTables();

    // Initialize users management tables
    await initializeUsersTables();

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

// Enhanced Media Management Functions
export async function initializeMediaTables() {
  try {
    console.log('[testing] Initializing enhanced media tables...');
    
    // Create media_folders table
    await query(`
      CREATE TABLE IF NOT EXISTS media_folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        parent_folder_id INTEGER REFERENCES media_folders(id) ON DELETE CASCADE,
        folder_path VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create enhanced media table
    await query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        alt_text VARCHAR(500),
        title VARCHAR(255),
        description TEXT,
        url VARCHAR(500) NOT NULL,
        relative_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_extension VARCHAR(10) NOT NULL,
        file_size INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        duration INTEGER,
        folder_id INTEGER REFERENCES media_folders(id) ON DELETE SET NULL,
        media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document', 'other')),
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        seo_optimized BOOLEAN DEFAULT false,
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create media_usage table
    await query(`
      CREATE TABLE IF NOT EXISTS media_usage (
        id SERIAL PRIMARY KEY,
        media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
        usage_type VARCHAR(50) NOT NULL,
        usage_id VARCHAR(100) NOT NULL,
        usage_context VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_media_folders_slug ON media_folders(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_folder_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_folders_path ON media_folders(folder_path)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_folders_active ON media_folders(is_active)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_media_slug ON media(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_active ON media(is_active)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_featured ON media(is_featured)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_usage_count ON media(usage_count)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_media_usage_media_id ON media_usage(media_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_usage_type ON media_usage(usage_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_usage_context ON media_usage(usage_type, usage_id)`);

    // Create update timestamp function and triggers
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await query(`
      CREATE TRIGGER update_media_folders_updated_at 
        BEFORE UPDATE ON media_folders 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await query(`
      CREATE TRIGGER update_media_updated_at 
        BEFORE UPDATE ON media 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // Create slug generation function
    await query(`
      CREATE OR REPLACE FUNCTION generate_media_slug(original_filename TEXT)
      RETURNS TEXT AS $$
      DECLARE
          base_slug TEXT;
          final_slug TEXT;
          counter INTEGER := 1;
      BEGIN
          base_slug := lower(regexp_replace(
              regexp_replace(original_filename, '\\.[^.]*$', ''),
              '[^a-zA-Z0-9]+', '-', 'g'
          ));
          
          base_slug := trim(both '-' from base_slug);
          final_slug := base_slug;
          
          WHILE EXISTS (SELECT 1 FROM media WHERE slug = final_slug) LOOP
              final_slug := base_slug || '-' || counter;
              counter := counter + 1;
          END LOOP;
          
          RETURN final_slug;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Create usage count update function and trigger
    await query(`
      CREATE OR REPLACE FUNCTION update_media_usage_count()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              UPDATE media 
              SET usage_count = usage_count + 1, last_used_at = NOW()
              WHERE id = NEW.media_id;
              RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
              UPDATE media 
              SET usage_count = GREATEST(usage_count - 1, 0)
              WHERE id = OLD.media_id;
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    await query(`
      CREATE TRIGGER update_media_usage_count_trigger
        AFTER INSERT OR DELETE ON media_usage
        FOR EACH ROW EXECUTE FUNCTION update_media_usage_count()
    `);

    // Create views
    await query(`
      CREATE OR REPLACE VIEW media_with_folders AS
      SELECT 
        m.*,
        f.name as folder_name,
        f.slug as folder_slug,
        f.folder_path,
        CASE 
          WHEN m.folder_id IS NULL THEN 'uncategorized'
          ELSE f.folder_path
        END as full_folder_path
      FROM media m
      LEFT JOIN media_folders f ON m.folder_id = f.id
      WHERE m.is_active = true
    `);

    await query(`
      CREATE OR REPLACE VIEW folder_statistics AS
      SELECT 
        f.id,
        f.name,
        f.slug,
        f.folder_path,
        COUNT(m.id) as media_count,
        COALESCE(SUM(m.file_size), 0) as total_size,
        COUNT(CASE WHEN m.media_type = 'image' THEN 1 END) as image_count,
        COUNT(CASE WHEN m.media_type = 'video' THEN 1 END) as video_count,
        COUNT(CASE WHEN m.media_type = 'audio' THEN 1 END) as audio_count,
        COUNT(CASE WHEN m.media_type = 'document' THEN 1 END) as document_count,
        COUNT(CASE WHEN m.media_type = 'other' THEN 1 END) as other_count,
        f.created_at,
        f.updated_at
      FROM media_folders f
      LEFT JOIN media m ON f.id = m.folder_id AND m.is_active = true
      WHERE f.is_active = true
      GROUP BY f.id, f.name, f.slug, f.folder_path, f.created_at, f.updated_at
      ORDER BY f.folder_path
    `);

    // Insert default media folders
    const defaultFolders = [
      { name: 'Logos', slug: 'logos', description: 'Company and client logos', path: 'logos' },
      { name: 'Results', slug: 'results', description: 'SEO results and case study images', path: 'results' },
      { name: 'SEO', slug: 'seo', description: 'SEO-related images and graphics', path: 'seo' },
      { name: 'Team', slug: 'team', description: 'Team member photos and bios', path: 'team' },
      { name: 'Blog', slug: 'blog', description: 'Blog post images and media', path: 'blog' },
      { name: 'General', slug: 'general', description: 'General purpose media files', path: 'general' }
    ];

    for (const folder of defaultFolders) {
      await query(`
        INSERT INTO media_folders (name, slug, description, folder_path)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          folder_path = EXCLUDED.folder_path,
          updated_at = NOW()
      `, [folder.name, folder.slug, folder.description, folder.path]);
    }

    console.log('[testing] Enhanced media tables initialized successfully');
    return true;
  } catch (error) {
    console.error('[testing] Enhanced media tables initialization failed:', error);
    return false;
  }
}

// Media Folders CRUD Functions
export async function createMediaFolder(folderData) {
  try {
    const result = await query(`
      INSERT INTO media_folders (name, slug, description, parent_folder_id, folder_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      folderData.name,
      folderData.slug,
      folderData.description || null,
      folderData.parent_folder_id || null,
      folderData.folder_path
    ]);
    
    console.log('[testing] Media folder created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating media folder:', error);
    throw error;
  }
}

export async function getMediaFolders() {
  try {
    const result = await query(`
      SELECT * FROM folder_statistics
      ORDER BY folder_path
    `);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching media folders:', error);
    throw error;
  }
}

export async function getMediaFolder(folderId) {
  try {
    const result = await query(`
      SELECT * FROM media_folders WHERE id = $1
    `, [folderId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching media folder:', error);
    throw error;
  }
}

export async function updateMediaFolder(folderId, folderData) {
  try {
    const result = await query(`
      UPDATE media_folders 
      SET 
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        parent_folder_id = COALESCE($5, parent_folder_id),
        folder_path = COALESCE($6, folder_path),
        is_active = COALESCE($7, is_active),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      folderId,
      folderData.name,
      folderData.slug,
      folderData.description,
      folderData.parent_folder_id,
      folderData.folder_path,
      folderData.is_active
    ]);
    
    console.log('[testing] Media folder updated:', folderId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating media folder:', error);
    throw error;
  }
}

export async function deleteMediaFolder(folderId) {
  try {
    // Move media items to uncategorized (null folder_id)
    await query(`
      UPDATE media SET folder_id = NULL WHERE folder_id = $1
    `, [folderId]);
    
    // Delete the folder
    await query(`DELETE FROM media_folders WHERE id = $1`, [folderId]);
    console.log('[testing] Media folder deleted:', folderId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting media folder:', error);
    throw error;
  }
}

// Media CRUD Functions
export async function createMediaItem(mediaData) {
  try {
    // Generate slug if not provided
    const slug = mediaData.slug || await generateMediaSlug(mediaData.original_filename);
    
    const result = await query(`
      INSERT INTO media (
        filename, original_filename, slug, alt_text, title, description,
        url, relative_path, mime_type, file_extension, file_size,
        width, height, duration, folder_id, media_type, is_featured,
        seo_optimized, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      mediaData.filename,
      mediaData.original_filename,
      slug,
      mediaData.alt_text || null,
      mediaData.title || null,
      mediaData.description || null,
      mediaData.url,
      mediaData.relative_path,
      mediaData.mime_type,
      mediaData.file_extension,
      mediaData.file_size,
      mediaData.width || null,
      mediaData.height || null,
      mediaData.duration || null,
      mediaData.folder_id || null,
      mediaData.media_type,
      mediaData.is_featured || false,
      mediaData.seo_optimized || false,
      mediaData.metadata ? JSON.stringify(mediaData.metadata) : null
    ]);
    
    console.log('[testing] Media item created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating media item:', error);
    throw error;
  }
}

export async function getMediaItems(limit = 50, offset = 0, filters = {}) {
  try {
    let whereClause = 'WHERE m.is_active = true';
    let params = [];
    let paramIndex = 1;
    
    // Add filters
    if (filters.folder_id !== undefined) {
      if (filters.folder_id === null) {
        whereClause += ` AND m.folder_id IS NULL`;
      } else {
        whereClause += ` AND m.folder_id = $${paramIndex}`;
        params.push(filters.folder_id);
        paramIndex++;
      }
    }
    
    if (filters.media_type) {
      whereClause += ` AND m.media_type = $${paramIndex}`;
      params.push(filters.media_type);
      paramIndex++;
    }
    
    if (filters.search) {
      whereClause += ` AND (m.filename ILIKE $${paramIndex} OR m.alt_text ILIKE $${paramIndex} OR m.title ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    if (filters.is_featured !== undefined) {
      whereClause += ` AND m.is_featured = $${paramIndex}`;
      params.push(filters.is_featured);
      paramIndex++;
    }
    
    // Add limit and offset
    params.push(limit, offset);
    
    const result = await query(`
      SELECT * FROM media_with_folders m
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);
    
    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM media m ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset from count query
    
    return {
      media: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error('[testing] Error fetching media items:', error);
    throw error;
  }
}

export async function getMediaItem(mediaId) {
  try {
    const result = await query(`
      SELECT * FROM media_with_folders WHERE id = $1
    `, [mediaId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching media item:', error);
    throw error;
  }
}

export async function getMediaItemBySlug(slug) {
  try {
    const result = await query(`
      SELECT * FROM media_with_folders WHERE slug = $1
    `, [slug]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching media item by slug:', error);
    throw error;
  }
}

export async function updateMediaItem(mediaId, mediaData) {
  try {
    const result = await query(`
      UPDATE media 
      SET 
        filename = COALESCE($2, filename),
        alt_text = COALESCE($3, alt_text),
        title = COALESCE($4, title),
        description = COALESCE($5, description),
        folder_id = COALESCE($6, folder_id),
        is_featured = COALESCE($7, is_featured),
        seo_optimized = COALESCE($8, seo_optimized),
        metadata = COALESCE($9, metadata),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      mediaId,
      mediaData.filename,
      mediaData.alt_text,
      mediaData.title,
      mediaData.description,
      mediaData.folder_id,
      mediaData.is_featured,
      mediaData.seo_optimized,
      mediaData.metadata ? JSON.stringify(mediaData.metadata) : null
    ]);
    
    console.log('[testing] Media item updated:', mediaId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating media item:', error);
    throw error;
  }
}

export async function deleteMediaItem(mediaId) {
  try {
    // Soft delete by setting is_active to false
    await query(`
      UPDATE media SET is_active = false, updated_at = NOW() WHERE id = $1
    `, [mediaId]);
    
    console.log('[testing] Media item deleted (soft):', mediaId);
    return true;
  } catch (error) {
    console.error('[testing] Error deleting media item:', error);
    throw error;
  }
}

export async function hardDeleteMediaItem(mediaId) {
  try {
    // Delete usage records first
    await query(`DELETE FROM media_usage WHERE media_id = $1`, [mediaId]);
    
    // Delete the media item
    await query(`DELETE FROM media WHERE id = $1`, [mediaId]);
    
    console.log('[testing] Media item hard deleted:', mediaId);
    return true;
  } catch (error) {
    console.error('[testing] Error hard deleting media item:', error);
    throw error;
  }
}

// Media Usage Functions
export async function trackMediaUsage(mediaId, usageType, usageId, usageContext = null) {
  try {
    const result = await query(`
      INSERT INTO media_usage (media_id, usage_type, usage_id, usage_context)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      RETURNING *
    `, [mediaId, usageType, usageId, usageContext]);
    
    console.log('[testing] Media usage tracked:', { mediaId, usageType, usageId });
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error tracking media usage:', error);
    throw error;
  }
}

export async function removeMediaUsage(mediaId, usageType, usageId) {
  try {
    await query(`
      DELETE FROM media_usage 
      WHERE media_id = $1 AND usage_type = $2 AND usage_id = $3
    `, [mediaId, usageType, usageId]);
    
    console.log('[testing] Media usage removed:', { mediaId, usageType, usageId });
    return true;
  } catch (error) {
    console.error('[testing] Error removing media usage:', error);
    throw error;
  }
}

export async function getMediaUsage(mediaId) {
  try {
    const result = await query(`
      SELECT * FROM media_usage WHERE media_id = $1
      ORDER BY created_at DESC
    `, [mediaId]);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching media usage:', error);
    throw error;
  }
}

// Utility function to generate media slug
async function generateMediaSlug(originalFilename) {
  try {
    const result = await query(`SELECT generate_media_slug($1) as slug`, [originalFilename]);
    return result.rows[0].slug;
  } catch (error) {
    console.error('[testing] Error generating media slug:', error);
    // Fallback slug generation
    return originalFilename.toLowerCase()
      .replace(/\.[^.]*$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}

// Users Management Functions
export async function initializeUsersTables() {
  try {
    console.log('[testing] Initializing users management tables...');
    
    // Create users table with comprehensive user management
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        email_verification_token VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create user_sessions table for session management
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create user_activity_log table for audit trail
    await query(`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(100),
        details JSONB,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`);

    await query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active)`);

    await query(`CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_log(action)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_log(created_at)`);

    // Create triggers for updated_at
    await query(`
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await query(`
      CREATE TRIGGER update_user_sessions_updated_at 
        BEFORE UPDATE ON user_sessions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // Insert default admin user (password: admin123)
    // Note: In production, this should be done securely with proper password hashing
    await query(`
      INSERT INTO users (first_name, last_name, email, password_hash, role, status, is_active, email_verified)
      VALUES (
        'System', 
        'Administrator', 
        'admin@gosg.com', 
        '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 
        'admin', 
        'active',
        true, 
        true
      )
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified,
        updated_at = NOW()
    `);

    // Create view for user management (excludes sensitive data)
    await query(`
      CREATE OR REPLACE VIEW users_management_view AS
      SELECT 
        id,
        first_name,
        last_name,
        email,
        role,
        status,
        is_active,
        email_verified,
        last_login,
        failed_login_attempts,
        CASE WHEN locked_until > NOW() THEN true ELSE false END as is_locked,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    // Create view for user statistics
    await query(`
      CREATE OR REPLACE VIEW user_statistics AS
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_users,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as recent_logins
      FROM users
    `);

    console.log('[testing] Users management tables initialized successfully');
    return true;
  } catch (error) {
    console.error('[testing] Users management tables initialization failed:', error);
    return false;
  }
}

// User CRUD Functions
export async function createUser(userData) {
  try {
    const result = await query(`
      INSERT INTO users (first_name, last_name, email, password_hash, role, status, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, first_name, last_name, email, role, status, is_active, email_verified, created_at, updated_at
    `, [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.password_hash,
      userData.role || 'user',
      userData.status || 'pending',
      userData.is_active !== undefined ? userData.is_active : true,
      userData.email_verified || false
    ]);
    
    console.log('[testing] User created:', result.rows[0].id);
    
    // Log activity
    await logUserActivity(result.rows[0].id, 'user_created', 'user', result.rows[0].id, {
      created_by: userData.created_by || 'system'
    });
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating user:', error);
    throw error;
  }
}

export async function getUsers(limit = 50, offset = 0, search = '') {
  try {
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = `WHERE 
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1`;
      params = [`%${search}%`, limit, offset];
    } else {
      params = [limit, offset];
    }
    
    const result = await query(`
      SELECT * FROM users_management_view
      ${whereClause}
      ORDER BY created_at DESC
      ${search ? 'LIMIT $2 OFFSET $3' : 'LIMIT $1 OFFSET $2'}
    `, params);
    
    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM users
      ${whereClause}
    `, search ? [`%${search}%`] : []);
    
    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error('[testing] Error fetching users:', error);
    throw error;
  }
}

export async function getUser(userId) {
  try {
    const result = await query(`
      SELECT * FROM users_management_view WHERE id = $1
    `, [userId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching user:', error);
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const result = await query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching user by email:', error);
    throw error;
  }
}

export async function updateUser(userId, userData, updatedBy = null) {
  try {
    const result = await query(`
      UPDATE users 
      SET 
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        role = COALESCE($5, role),
        status = COALESCE($6, status),
        is_active = COALESCE($7, is_active),
        email_verified = COALESCE($8, email_verified),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, first_name, last_name, email, role, status, is_active, email_verified, created_at, updated_at
    `, [
      userId,
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.role,
      userData.status,
      userData.is_active,
      userData.email_verified
    ]);
    
    console.log('[testing] User updated:', userId);
    
    // Log activity
    await logUserActivity(updatedBy || userId, 'user_updated', 'user', userId, {
      updated_fields: Object.keys(userData)
    });
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating user:', error);
    throw error;
  }
}

export async function updateUserPassword(userId, passwordHash, updatedBy = null) {
  try {
    await query(`
      UPDATE users 
      SET 
        password_hash = $2,
        password_reset_token = NULL,
        password_reset_expires = NULL,
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
      WHERE id = $1
    `, [userId, passwordHash]);
    
    console.log('[testing] User password updated:', userId);
    
    // Log activity
    await logUserActivity(updatedBy || userId, 'password_changed', 'user', userId);
    
    return true;
  } catch (error) {
    console.error('[testing] Error updating user password:', error);
    throw error;
  }
}

export async function deleteUser(userId, deletedBy = null) {
  try {
    // Soft delete by setting is_active to false
    await query(`
      UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1
    `, [userId]);
    
    console.log('[testing] User deleted (soft):', userId);
    
    // Log activity
    await logUserActivity(deletedBy || userId, 'user_deleted', 'user', userId);
    
    return true;
  } catch (error) {
    console.error('[testing] Error deleting user:', error);
    throw error;
  }
}

export async function hardDeleteUser(userId, deletedBy = null) {
  try {
    // Delete user sessions first
    await query(`DELETE FROM user_sessions WHERE user_id = $1`, [userId]);
    
    // Delete the user
    await query(`DELETE FROM users WHERE id = $1`, [userId]);
    
    console.log('[testing] User hard deleted:', userId);
    
    // Log activity
    await logUserActivity(deletedBy, 'user_hard_deleted', 'user', userId);
    
    return true;
  } catch (error) {
    console.error('[testing] Error hard deleting user:', error);
    throw error;
  }
}

// User Registration Functions
export async function registerUser(userData) {
  try {
    const result = await query(`
      INSERT INTO users (first_name, last_name, email, password_hash, role, status, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, first_name, last_name, email, role, status, created_at
    `, [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.password_hash,
      'user', // Default role for registrations
      'pending', // Default status for registrations
      false, // Not active until approved
      false // Email not verified initially
    ]);
    
    console.log('[testing] User registered:', result.rows[0].id);
    
    // Log activity
    await logUserActivity(result.rows[0].id, 'user_registered', 'user', result.rows[0].id, {
      registration_method: 'public_signup'
    });
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error registering user:', error);
    throw error;
  }
}

export async function approveUser(userId, approvedBy) {
  try {
    const result = await query(`
      UPDATE users 
      SET 
        status = 'active',
        is_active = true,
        email_verified = true,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, first_name, last_name, email, role, status, is_active, email_verified
    `, [userId]);
    
    console.log('[testing] User approved:', userId);
    
    // Log activity
    await logUserActivity(approvedBy, 'user_approved', 'user', userId, {
      approved_user_email: result.rows[0]?.email
    });
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error approving user:', error);
    throw error;
  }
}

export async function rejectUser(userId, rejectedBy, reason = null) {
  try {
    const result = await query(`
      UPDATE users 
      SET 
        status = 'rejected',
        is_active = false,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, first_name, last_name, email, role, status
    `, [userId]);
    
    console.log('[testing] User rejected:', userId);
    
    // Log activity
    await logUserActivity(rejectedBy, 'user_rejected', 'user', userId, {
      rejected_user_email: result.rows[0]?.email,
      reason: reason
    });
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error rejecting user:', error);
    throw error;
  }
}

export async function getPendingUsers() {
  try {
    const result = await query(`
      SELECT * FROM users_management_view
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching pending users:', error);
    throw error;
  }
}

// Authentication Functions
export async function authenticateUser(email, password) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    if (!user.is_active) {
      return { success: false, error: 'Account is deactivated' };
    }

    if (user.status === 'pending') {
      return { success: false, error: 'Account is pending approval' };
    }

    if (user.status === 'rejected') {
      return { success: false, error: 'Account has been rejected' };
    }
    
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, error: 'Account is temporarily locked' };
    }
    
    // In a real implementation, you would verify the password hash here
    // For demo purposes, we'll use a simple check
    const isValidPassword = password === 'admin123' && user.email === 'admin@gosg.com';
    
    if (!isValidPassword) {
      // Increment failed login attempts
      await query(`
        UPDATE users 
        SET 
          failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE 
            WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
            ELSE locked_until
          END
        WHERE id = $1
      `, [user.id]);
      
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Reset failed attempts and update last login
    await query(`
      UPDATE users 
      SET 
        failed_login_attempts = 0,
        locked_until = NULL,
        last_login = NOW()
      WHERE id = $1
    `, [user.id]);
    
    // Log activity
    await logUserActivity(user.id, 'login', 'auth', user.id);
    
    return { 
      success: true, 
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('[testing] Error authenticating user:', error);
    throw error;
  }
}

// Session Management Functions
export async function createUserSession(userId, sessionToken, expiresAt, ipAddress = null, userAgent = null) {
  try {
    const result = await query(`
      INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, sessionToken, expiresAt, ipAddress, userAgent]);
    
    console.log('[testing] User session created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating user session:', error);
    throw error;
  }
}

export async function getUserSession(sessionToken) {
  try {
    const result = await query(`
      SELECT s.*, u.id as user_id, u.first_name, u.last_name, u.email, u.role, u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1 AND s.is_active = true AND s.expires_at > NOW()
    `, [sessionToken]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching user session:', error);
    throw error;
  }
}

export async function invalidateUserSession(sessionToken) {
  try {
    await query(`
      UPDATE user_sessions SET is_active = false WHERE session_token = $1
    `, [sessionToken]);
    
    console.log('[testing] User session invalidated:', sessionToken);
    return true;
  } catch (error) {
    console.error('[testing] Error invalidating user session:', error);
    throw error;
  }
}

export async function invalidateAllUserSessions(userId) {
  try {
    await query(`
      UPDATE user_sessions SET is_active = false WHERE user_id = $1
    `, [userId]);
    
    console.log('[testing] All user sessions invalidated for user:', userId);
    return true;
  } catch (error) {
    console.error('[testing] Error invalidating all user sessions:', error);
    throw error;
  }
}

// Activity Logging Functions
export async function logUserActivity(userId, action, resourceType = null, resourceId = null, details = null, ipAddress = null, userAgent = null) {
  try {
    await query(`
      INSERT INTO user_activity_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, resourceType, resourceId, details ? JSON.stringify(details) : null, ipAddress, userAgent]);
    
    console.log('[testing] User activity logged:', { userId, action, resourceType, resourceId });
    return true;
  } catch (error) {
    console.error('[testing] Error logging user activity:', error);
    // Don't throw error for logging failures
    return false;
  }
}

export async function getUserActivity(userId, limit = 50, offset = 0) {
  try {
    const result = await query(`
      SELECT * FROM user_activity_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching user activity:', error);
    throw error;
  }
}

// Statistics Functions
export async function getUserStatistics() {
  try {
    const result = await query(`SELECT * FROM user_statistics`);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error fetching user statistics:', error);
    throw error;
  }
}

export default pool;
