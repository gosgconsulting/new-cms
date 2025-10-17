import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { 
  initializeDatabase, 
  getBrandingSettings, 
  updateMultipleBrandingSettings, 
  saveFormSubmission,
  saveFormSubmissionExtended,
  getFormById,
  getEmailSettingsByFormId,
  getFormSubmissions,
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  createProjectStep,
  getProjectSteps,
  updateProjectStep,
  deleteProjectStep,
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getPublicSEOSettings,
  updateSEOSettings,
  query
} from './sparti-cms/db/postgres.js';
import pool from './sparti-cms/db/postgres.js';

// Import mock data for development
import {
  getMockContacts,
  getMockFormSubmissions,
  createMockContact,
  updateMockContact,
  deleteMockContact
} from './sparti-cms/db/mock-data.js';

// SMTP Configuration for server-side email sending
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@gosg.com';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'public', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
  console.log('[testing] Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico|webp/;
    const ext = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, svg, ico, webp)'));
    }
  }
});

// Middleware
app.use(express.json());

// CORS middleware to handle OPTIONS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize database on startup
initializeDatabase().then(success => {
  if (success) {
    console.log('[testing] Database initialized successfully');
  } else {
    console.error('[testing] Failed to initialize database');
  }
}).catch(error => {
  console.error('[testing] Error initializing database:', error);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

// Health check endpoint - this is what Railway will check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// API Routes - MUST come before static file serving

// Branding API
app.get('/api/branding', async (req, res) => {
  try {
    console.log('[testing] API: Getting branding settings');
    const settings = await getBrandingSettings();
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting branding settings:', error);
    res.status(500).json({ error: 'Failed to get branding settings' });
  }
});

app.post('/api/branding', async (req, res) => {
  try {
    console.log('[testing] API: Updating branding settings:', req.body);
    await updateMultipleBrandingSettings(req.body);
    res.json({ success: true, message: 'Branding settings updated successfully' });
  } catch (error) {
    console.error('[testing] API: Error updating branding settings:', error);
    res.status(500).json({ error: 'Failed to update branding settings' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('[testing] File uploaded:', req.file.filename);
    
    res.json({ 
      success: true, 
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('[testing] Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Form submissions API
app.post('/api/form-submissions', async (req, res) => {
  try {
    const { form_id, form_name, name, email, phone, company, message } = req.body;
    
    console.log('[testing] Form submission received:', { form_id, name, email });
    
    // Save form submission
    const submission = await saveFormSubmission({ 
      form_id, 
      form_name, 
      name, 
      email, 
      phone,
      company, 
      message,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Also create/update contact record
    try {
      const nameParts = name.split(' ');
      const first_name = nameParts[0] || name;
      const last_name = nameParts.slice(1).join(' ') || null;
      
      await createContact({
        first_name,
        last_name,
        email,
        phone,
        company,
        source: form_name || form_id || 'form',
        status: 'new',
        notes: message ? `Form message: ${message}` : null
      });
      
      console.log('[testing] Contact created from form submission');
    } catch (contactError) {
      console.error('[testing] Error creating contact from form:', contactError);
      // Don't fail the form submission if contact creation fails
    }
    
    res.json({ 
      success: true, 
      message: 'Form submission saved successfully',
      id: submission.id
    });
  } catch (error) {
    console.error('[testing] Error saving form submission:', error);
    res.status(500).json({ error: 'Failed to save form submission' });
  }
});

app.get('/api/form-submissions/all', async (req, res) => {
  try {
    console.log('[testing] Fetching all form submissions');
    
    const result = await query(`
      SELECT * FROM form_submissions 
      ORDER BY submitted_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Error fetching all form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

app.get('/api/form-submissions/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    
    console.log('[testing] Fetching submissions for form:', formId);
    
    const submissions = await getFormSubmissions(formId);
    
    res.json(submissions);
  } catch (error) {
    console.error('[testing] Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// Forms Management API Endpoints

// Get all forms
app.get('/api/forms', async (req, res) => {
  try {
    const result = await query('SELECT * FROM forms ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get form by ID
app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await getFormById(req.params.id);
    if (form) {
      res.json(form);
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('[testing] Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create new form
app.post('/api/forms', async (req, res) => {
  try {
    const { name, description, fields, settings, is_active } = req.body;
    
    const result = await query(`
      INSERT INTO forms (name, description, fields, settings, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, JSON.stringify(fields || []), JSON.stringify(settings || {}), is_active ?? true]);
    
    const newForm = result.rows[0];
    
    // Create default email settings for new form
    await query(`
      INSERT INTO email_settings (
        form_id, notification_enabled, notification_emails, notification_subject, 
        notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template, from_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      newForm.id,
      true,
      ['admin@gosg.com.sg'],
      `New ${newForm.name} Submission`,
      'You have received a new form submission.',
      false,
      'Thank you for your submission',
      'Thank you for contacting us. We will get back to you soon.',
      'GOSG Team'
    ]);
    
    res.json(newForm);
  } catch (error) {
    console.error('[testing] Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Update form
app.put('/api/forms/:id', async (req, res) => {
  try {
    const { name, description, fields, settings, is_active } = req.body;
    
    const result = await query(`
      UPDATE forms 
      SET name = $1, description = $2, fields = $3, settings = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, description, JSON.stringify(fields), JSON.stringify(settings), is_active, req.params.id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('[testing] Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete form
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM forms WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Form deleted successfully' });
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('[testing] Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Get email settings for a form
app.get('/api/forms/:id/email-settings', async (req, res) => {
  try {
    const settings = await getEmailSettingsByFormId(req.params.id);
    if (settings) {
      res.json(settings);
    } else {
      res.status(404).json({ error: 'Email settings not found' });
    }
  } catch (error) {
    console.error('[testing] Error fetching email settings:', error);
    res.status(500).json({ error: 'Failed to fetch email settings' });
  }
});

// Update email settings for a form
app.put('/api/forms/:id/email-settings', async (req, res) => {
  try {
    const {
      notification_enabled,
      notification_emails,
      notification_subject,
      notification_template,
      auto_reply_enabled,
      auto_reply_subject,
      auto_reply_template,
      from_email,
      from_name
    } = req.body;
    
    // Check if settings exist
    const existing = await getEmailSettingsByFormId(req.params.id);
    
    let result;
    if (existing) {
      // Update existing settings
      result = await query(`
        UPDATE email_settings 
        SET notification_enabled = $1, notification_emails = $2, notification_subject = $3,
            notification_template = $4, auto_reply_enabled = $5, auto_reply_subject = $6,
            auto_reply_template = $7, from_email = $8, from_name = $9, updated_at = NOW()
        WHERE form_id = $10
        RETURNING *
      `, [
        notification_enabled, notification_emails, notification_subject, notification_template,
        auto_reply_enabled, auto_reply_subject, auto_reply_template, from_email, from_name,
        req.params.id
      ]);
    } else {
      // Create new settings
      result = await query(`
        INSERT INTO email_settings (
          form_id, notification_enabled, notification_emails, notification_subject,
          notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template,
          from_email, from_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        req.params.id, notification_enabled, notification_emails, notification_subject,
        notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template,
        from_email, from_name
      ]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[testing] Error updating email settings:', error);
    res.status(500).json({ error: 'Failed to update email settings' });
  }
});

// Get form submissions
app.get('/api/forms/:id/submissions', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM form_submissions_extended 
      WHERE form_id = $1 
      ORDER BY submitted_at DESC 
      LIMIT 100
    `, [req.params.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Projects API
app.get('/api/projects', async (req, res) => {
  try {
    console.log('[testing] API: Getting projects');
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    console.error('[testing] API: Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    console.log('[testing] API: Creating project:', req.body);
    const project = await createProject(req.body);
    res.json({ success: true, project });
  } catch (error) {
    console.error('[testing] API: Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Updating project:', id, req.body);
    const project = await updateProject(id, req.body);
    res.json({ success: true, project });
  } catch (error) {
    console.error('[testing] API: Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Deleting project:', id);
    await deleteProject(id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('[testing] API: Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Project Steps API
app.get('/api/projects/:projectId/steps', async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('[testing] API: Getting project steps for:', projectId);
    const steps = await getProjectSteps(projectId);
    res.json(steps);
  } catch (error) {
    console.error('[testing] API: Error getting project steps:', error);
    res.status(500).json({ error: 'Failed to get project steps' });
  }
});

app.post('/api/projects/:projectId/steps', async (req, res) => {
  try {
    const { projectId } = req.params;
    const stepData = { ...req.body, project_id: projectId };
    console.log('[testing] API: Creating project step:', stepData);
    const step = await createProjectStep(stepData);
    res.json({ success: true, step });
  } catch (error) {
    console.error('[testing] API: Error creating project step:', error);
    res.status(500).json({ error: 'Failed to create project step' });
  }
});

app.put('/api/project-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Updating project step:', id, req.body);
    const step = await updateProjectStep(id, req.body);
    res.json({ success: true, step });
  } catch (error) {
    console.error('[testing] API: Error updating project step:', error);
    res.status(500).json({ error: 'Failed to update project step' });
  }
});

app.delete('/api/project-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Deleting project step:', id);
    await deleteProjectStep(id);
    res.json({ success: true, message: 'Project step deleted successfully' });
  } catch (error) {
    console.error('[testing] API: Error deleting project step:', error);
    res.status(500).json({ error: 'Failed to delete project step' });
  }
});

// Contacts API
app.get('/api/contacts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    
    console.log('[testing] API: Getting contacts', { limit, offset, search });
    const result = await getContacts(limit, offset, search);
    res.json(result);
  } catch (error) {
    console.error('[testing] API: Error getting contacts:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Getting contact:', id);
    const contact = await getContact(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('[testing] API: Error getting contact:', error);
    res.status(500).json({ error: 'Failed to get contact' });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    console.log('[testing] API: Creating contact:', req.body);
    const contact = await createContact(req.body);
    res.json({ success: true, contact });
  } catch (error) {
    console.error('[testing] API: Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Updating contact:', id, req.body);
    const contact = await updateContact(id, req.body);
    res.json({ success: true, contact });
  } catch (error) {
    console.error('[testing] API: Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Deleting contact:', id);
    await deleteContact(id);
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('[testing] API: Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Analytics API Routes (Placeholder - functions not implemented yet)
// TODO: Implement analytics functions in postgres.js

/*
// Get analytics overview
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    res.json({ message: 'Analytics not implemented yet' });
  } catch (error) {
    console.error('[testing] Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});
*/

// Database Viewer API Routes
app.get('/api/database/tables', async (req, res) => {
  try {
    console.log('[testing] API: Getting database tables');
    
    const query = `
      SELECT 
        table_name,
        table_schema,
        table_type,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns 
          WHERE table_name = t.table_name 
          AND table_schema = t.table_schema
        ) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const result = await pool.query(query);
    
    // Get row counts for each table
    const tablesWithCounts = await Promise.all(
      result.rows.map(async (table) => {
        try {
          const countQuery = `SELECT COUNT(*) as row_count FROM "${table.table_name}"`;
          const countResult = await pool.query(countQuery);
          return {
            ...table,
            row_count: parseInt(countResult.rows[0].row_count)
          };
        } catch (error) {
          console.warn(`[testing] Could not get row count for ${table.table_name}:`, error.message);
          return {
            ...table,
            row_count: 0
          };
        }
      })
    );
    
    console.log('[testing] Database tables loaded:', tablesWithCounts.length);
    res.json(tablesWithCounts);
  } catch (error) {
    console.error('[testing] Database tables error:', error);
    res.status(500).json({ error: 'Failed to fetch database tables' });
  }
});

app.get('/api/database/tables/:tableName/columns', async (req, res) => {
  try {
    const { tableName } = req.params;
    console.log('[testing] API: Getting columns for table:', tableName);
    
    const query = `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE 
          WHEN pk.column_name IS NOT NULL THEN true 
          ELSE false 
        END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position;
    `;
    
    const result = await pool.query(query, [tableName]);
    console.log('[testing] Table columns loaded:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Table columns error:', error);
    res.status(500).json({ error: 'Failed to fetch table columns' });
  }
});

app.get('/api/database/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log('[testing] API: Getting data for table:', tableName, 'limit:', limit);
    
    // Validate table name to prevent SQL injection
    const tableExistsQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `;
    const tableExists = await pool.query(tableExistsQuery, [tableName]);
    
    if (tableExists.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    // Use parameterized query with table name validation
    const query = `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [limit, offset]);
    
    console.log('[testing] Table data loaded:', result.rows.length, 'rows');
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Table data error:', error);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

// SMTP Email Routes
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, reply_to } = req.body;

    if (!RESEND_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'SMTP not configured - missing RESEND_API_KEY' 
      });
    }

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, and html or text' 
      });
    }

    const emailData = {
      from: SMTP_FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to
    };

    // Remove undefined fields
    Object.keys(emailData).forEach(key => {
      if (emailData[key] === undefined) {
        delete emailData[key];
      }
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[testing] SMTP Error:', error);
      return res.status(response.status).json({ 
        success: false, 
        error: `Email sending failed: ${error}` 
      });
    }

    const result = await response.json();
    console.log('[testing] Email sent successfully:', result.id);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      id: result.id 
    });

  } catch (error) {
    console.error('[testing] SMTP Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Contact form email endpoint
app.post('/api/send-contact-email', async (req, res) => {
  try {
    const { name, email, subject, message, phone, company } = req.body;

    if (!RESEND_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'SMTP not configured - missing RESEND_API_KEY' 
      });
    }

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, subject, message' 
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #007bff; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
          <p>This email was sent from the GO SG website contact form.</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const text = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}

Message:
${message}

---
This email was sent from the GO SG website contact form.
Timestamp: ${new Date().toLocaleString()}
    `;

    const emailData = {
      from: SMTP_FROM_EMAIL,
      to: ['contact@gosg.com'], // Replace with your contact email
      subject: `Contact Form: ${subject}`,
      html,
      text,
      reply_to: email
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[testing] Contact form email error:', error);
      return res.status(response.status).json({ 
        success: false, 
        error: `Failed to send contact email: ${error}` 
      });
    }

    const result = await response.json();
    console.log('[testing] Contact form email sent successfully:', result.id);
    
    res.json({ 
      success: true, 
      message: 'Contact form email sent successfully',
      id: result.id 
    });

  } catch (error) {
    console.error('[testing] Contact form email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Serve static files from the dist directory - MUST come after API routes
app.use(express.static(join(__dirname, 'dist')));

// Handle all other routes by serving the React app - MUST be last
app.use((req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'Server is running but app not built',
      timestamp: new Date().toISOString() 
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://0.0.0.0:${port}/health`);
  console.log(`Application available at http://0.0.0.0:${port}/`);
  console.log(`API endpoints available at http://0.0.0.0:${port}/api/`);
});
