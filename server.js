import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
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
  getAllPagesWithTypes,
  updatePageSlug,
  validateSlug,
  updatePageName,
  toggleSEOIndex,
  getPageWithLayout,
  updatePageData,
  updatePageLayout,
  query,
  getTerms,
  canUserAccessTenant
} from './sparti-cms/db/postgres.js';
import pool from './sparti-cms/db/postgres.js';
import { renderPageBySlug } from './sparti-cms/render/pageRenderer.js';
import { getLayoutBySlug, upsertLayoutBySlug } from './sparti-cms/db/postgres.js';
import cacheStore, { getPageCache, setPageCache, invalidateBySlug, invalidateAll } from './sparti-cms/cache/index.js';
import tenantRoutes from './sparti-cms/db/tenant-api-routes.js';

// Import mock data for development
import {
  getMockContacts,
  getMockFormSubmissions,
  createMockContact,
  updateMockContact,
  deleteMockContact
} from './sparti-cms/db/mock-data.js';

// Import blog schema initialization
import { ensureBlogSchemaInitialized } from './sparti-cms/db/init-blog.js';

// SMTP Configuration for server-side email sending
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@gosg.com';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;

// Tenant access control middleware
const checkTenantAccess = (req, res, next) => {
  const user = req.user; // From session/JWT
  const tenantId = req.headers['x-tenant-id'] || req.body.tenant_id;
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (user.is_super_admin) {
    return next();
  }
  
  if (user.tenant_id !== tenantId) {
    return res.status(403).json({ error: 'Access denied to this tenant' });
  }
  
  next();
};

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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sparti-demo-secret-key';

// Authentication middleware
const authenticateUser = (req, res, next) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// CORS middleware to handle OPTIONS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant-Id');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
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

// Simple health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// Detailed health check with database connectivity
app.get('/health/detailed', async (req, res) => {
  try {
    // Check database connectivity
    await query('SELECT 1');
    
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: port,
      database: 'connected'
    });
  } catch (error) {
    console.error('[testing] Detailed health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      port: port,
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes - MUST come before static file serving

// Tenant API Routes
app.use('/api/tenants', tenantRoutes);

// Branding API
app.get('/api/branding', authenticateUser, checkTenantAccess, async (req, res) => {
  try {
    console.log('[testing] API: Getting branding settings');
    const settings = await getBrandingSettings();
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting branding settings:', error);
    res.status(500).json({ error: 'Failed to get branding settings' });
  }
});

app.post('/api/branding', authenticateUser, checkTenantAccess, async (req, res) => {
  try {
    console.log('[testing] API: Updating branding settings:', req.body);
    await updateMultipleBrandingSettings(req.body);
    // Smart invalidation: settings can affect many pages; clear all for now
    try { invalidateAll(); } catch (e) { /* no-op */ }
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
app.get('/api/forms', authenticateUser, checkTenantAccess, async (req, res) => {
  try {
    const result = await query('SELECT * FROM forms ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get form by ID
app.get('/api/forms/:id', authenticateUser, checkTenantAccess, async (req, res) => {
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
app.post('/api/forms', authenticateUser, checkTenantAccess, async (req, res) => {
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

// Pages Management API Routes
app.get('/api/pages/all', authenticateUser, checkTenantAccess, async (req, res) => {
  try {
    const { tenantId } = req.query;
    console.log(`[testing] API: Fetching all pages with types for tenant: ${tenantId || 'default'}`);
    
    // Filter pages by tenant
    const pages = await getAllPagesWithTypes(tenantId);
    
    res.json({ 
      success: true, 
      pages: pages,
      total: pages.length,
      tenantId: tenantId || 'default'
    });
  } catch (error) {
    console.error('[testing] API: Error fetching pages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pages',
      message: error.message 
    });
  }
});

// Get individual page with layout
app.get('/api/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.query;
    console.log(`[testing] API: Fetching page ${pageId} for tenant: ${tenantId || 'default'}`);
    
    const page = await getPageWithLayout(pageId, tenantId);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    
    res.json({
      success: true,
      page: page
    });
  } catch (error) {
    console.error('[testing] API: Error fetching page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page',
      message: error.message
    });
  }
});

// Update page data
app.put('/api/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { page_name, meta_title, meta_description, seo_index, tenantId } = req.body;
    console.log(`[testing] API: Updating page ${pageId} for tenant: ${tenantId}`);
    
    const success = await updatePageData(pageId, page_name, meta_title, meta_description, seo_index, tenantId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Page not found or update failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('[testing] API: Error updating page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page',
      message: error.message
    });
  }
});

// Update page layout
app.put('/api/pages/:pageId/layout', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { layout_json, tenantId } = req.body;
    console.log(`[testing] API: Updating page layout ${pageId} for tenant: ${tenantId}`);
    
    const success = await updatePageLayout(pageId, layout_json, tenantId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Page not found or layout update failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Page layout updated successfully'
    });
  } catch (error) {
    console.error('[testing] API: Error updating page layout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page layout',
      message: error.message
    });
  }
});

app.post('/api/pages/update-slug', async (req, res) => {
  try {
    const { pageId, pageType, newSlug, oldSlug, tenantId } = req.body;
    console.log(`[testing] API: Updating slug for tenant: ${tenantId || 'default'}`);
    
    console.log('[testing] API: Updating page slug:', { pageId, pageType, newSlug, oldSlug });
    
    // Validate required fields
    if (!pageId || !pageType || !newSlug || !oldSlug) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'pageId, pageType, newSlug, and oldSlug are required'
      });
    }
    
    // Validate page type
    if (!['page', 'landing', 'legal'].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page type',
        message: 'pageType must be one of: page, landing, legal'
      });
    }
    
    // Validate slug format
    try {
      const validatedSlug = validateSlug(newSlug);
      console.log('[testing] API: Slug validated:', validatedSlug);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid slug format',
        message: validationError.message
      });
    }
    
    // Prevent homepage slug changes
    if (oldSlug === '/' && newSlug !== '/') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change homepage slug',
        message: 'The homepage slug cannot be modified'
      });
    }
    
    // Update the slug
    const updatedPage = await updatePageSlug(pageId, pageType, newSlug, oldSlug, tenantId);
    
    console.log('[testing] API: Page slug updated successfully:', updatedPage.id);
    
    res.json({
      success: true,
      message: 'Slug updated successfully',
      page: updatedPage,
      oldSlug: oldSlug,
      newSlug: newSlug
    });
    
  } catch (error) {
    console.error('[testing] API: Error updating page slug:', error);
    
    // Handle specific error cases
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Slug already exists',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update slug',
      message: error.message
    });
  }
});

// Update page name
app.post('/api/pages/update-name', async (req, res) => {
  try {
    const { pageId, pageType, newName, tenantId } = req.body;
    console.log(`[testing] API: Updating page name for tenant: ${tenantId || 'default'}`);
    
    console.log('[testing] API: Updating page name:', { pageId, pageType, newName });
    
    // Validate required fields
    if (!pageId || !pageType || !newName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'pageId, pageType, and newName are required'
      });
    }
    
    // Validate page type
    if (!['page', 'landing', 'legal'].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page type',
        message: 'pageType must be one of: page, landing, legal'
      });
    }
    
    // Update the page name
    const success = await updatePageName(pageId, pageType, newName, tenantId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Page not found',
        message: 'The specified page could not be found'
      });
    }
    
    console.log('[testing] API: Page name updated successfully');
    
    res.json({
      success: true,
      message: 'Page name updated successfully',
      pageId: pageId,
      newName: newName
    });
    
  } catch (error) {
    console.error('[testing] API: Error updating page name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page name',
      message: error.message
    });
  }
});

// Toggle SEO index
app.post('/api/pages/toggle-seo-index', async (req, res) => {
  try {
    const { pageId, pageType, currentIndex, tenantId } = req.body;
    console.log(`[testing] API: Toggling SEO index for tenant: ${tenantId || 'default'}`);
    
    console.log('[testing] API: Toggling SEO index:', { pageId, pageType, currentIndex });
    
    // Validate required fields
    if (!pageId || !pageType || currentIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'pageId, pageType, and currentIndex are required'
      });
    }
    
    // Validate page type
    if (!['page', 'landing', 'legal'].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page type',
        message: 'pageType must be one of: page, landing, legal'
      });
    }
    
    // Toggle the SEO index
    const newIndex = await toggleSEOIndex(pageId, pageType, currentIndex, tenantId);
    
    console.log('[testing] API: SEO index toggled successfully');
    
    res.json({
      success: true,
      message: 'SEO index toggled successfully',
      pageId: pageId,
      newIndex: newIndex
    });
    
  } catch (error) {
    console.error('[testing] API: Error toggling SEO index:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle SEO index',
      message: error.message
    });
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

// SMTP Configuration endpoints
app.get('/api/smtp-config', async (req, res) => {
  try {
    console.log('[testing] Loading SMTP configuration...');
    
    const result = await query(`
      SELECT * FROM smtp_config 
      WHERE id = 1
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      const config = result.rows[0];
      // Don't send the password in the response for security
      const safeConfig = {
        ...config,
        password: config.password ? '••••••••' : ''
      };
      console.log('[testing] SMTP configuration loaded');
      res.json(safeConfig);
    } else {
      console.log('[testing] No SMTP configuration found');
      res.json({
        host: '',
        port: 587,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
        security: 'tls',
        enabled: false
      });
    }
  } catch (error) {
    console.error('[testing] Error loading SMTP configuration:', error);
    
    // If table doesn't exist, create it
    if (error.message.includes('relation "smtp_config" does not exist')) {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS smtp_config (
            id SERIAL PRIMARY KEY,
            host VARCHAR(255) NOT NULL,
            port INTEGER NOT NULL DEFAULT 587,
            username VARCHAR(255) NOT NULL,
            password TEXT NOT NULL,
            from_email VARCHAR(255) NOT NULL,
            from_name VARCHAR(255),
            security VARCHAR(10) NOT NULL DEFAULT 'tls',
            enabled BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log('[testing] SMTP config table created');
        
        // Return default config
        res.json({
          host: '',
          port: 587,
          username: '',
          password: '',
          fromEmail: '',
          fromName: '',
          security: 'tls',
          enabled: false
        });
      } catch (createError) {
        console.error('[testing] Error creating SMTP config table:', createError);
        res.status(500).json({ error: 'Failed to initialize SMTP configuration' });
      }
    } else {
      res.status(500).json({ error: 'Failed to load SMTP configuration' });
    }
  }
});

app.post('/api/smtp-config', async (req, res) => {
  try {
    const { host, port, username, password, fromEmail, fromName, security, enabled } = req.body;
    
    console.log('[testing] Saving SMTP configuration...');
    
    // Validate required fields
    if (enabled && (!host || !port || !username || !password || !fromEmail)) {
      return res.status(400).json({ 
        error: 'Missing required fields: host, port, username, password, fromEmail' 
      });
    }
    
    // Check if configuration exists
    const existing = await query('SELECT id FROM smtp_config WHERE id = 1');
    
    let result;
    if (existing.rows.length > 0) {
      // Update existing configuration
      result = await query(`
        UPDATE smtp_config 
        SET host = $1, port = $2, username = $3, password = $4, 
            from_email = $5, from_name = $6, security = $7, enabled = $8, 
            updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `, [host, port, username, password, fromEmail, fromName, security, enabled]);
    } else {
      // Create new configuration
      result = await query(`
        INSERT INTO smtp_config (host, port, username, password, from_email, from_name, security, enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [host, port, username, password, fromEmail, fromName, security, enabled]);
    }
    
    const savedConfig = result.rows[0];
    // Don't send the password back
    const safeConfig = {
      ...savedConfig,
      password: '••••••••'
    };
    
    console.log('[testing] SMTP configuration saved successfully');
    res.json(safeConfig);
    
  } catch (error) {
    console.error('[testing] Error saving SMTP configuration:', error);
    res.status(500).json({ error: 'Failed to save SMTP configuration' });
  }
});

app.post('/api/smtp-test', async (req, res) => {
  try {
    const { host, port, username, password, fromEmail, fromName, security } = req.body;
    
    console.log('[testing] Testing SMTP connection...');
    
    // Validate required fields
    if (!host || !port || !username || !password || !fromEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields for SMTP test' 
      });
    }
    
    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.default.createTransporter({
      host,
      port: parseInt(port),
      secure: security === 'ssl', // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
      tls: security === 'tls' ? {
        // do not fail on invalid certs
        rejectUnauthorized: false
      } : undefined
    });
    
    // Verify connection
    await transporter.verify();
    
    // Send test email
    const testEmail = {
      from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
      to: fromEmail, // Send test email to the configured from email
      subject: 'SMTP Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SMTP Test Successful!</h2>
          <p>Your SMTP configuration is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Configuration Details:</h3>
            <p><strong>Host:</strong> ${host}</p>
            <p><strong>Port:</strong> ${port}</p>
            <p><strong>Security:</strong> ${security.toUpperCase()}</p>
            <p><strong>Username:</strong> ${username}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email sent at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `SMTP Test Successful!\n\nYour SMTP configuration is working correctly.\n\nHost: ${host}\nPort: ${port}\nSecurity: ${security.toUpperCase()}\nUsername: ${username}\n\nThis is an automated test email sent at ${new Date().toLocaleString()}`
    };
    
    const info = await transporter.sendMail(testEmail);
    
    console.log('[testing] SMTP test email sent successfully:', info.messageId);
    
    res.json({
      success: true,
      message: 'SMTP connection successful! Test email sent.',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('[testing] SMTP test failed:', error);
    
    let errorMessage = 'SMTP connection failed';
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your username and password.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Check your host and port settings.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Socket error. Check your network connection and firewall settings.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

  
// ===== CONTENT MANAGEMENT API ENDPOINTS =====

// Content Management endpoints (Posts & Terms) have been temporarily disabled
// They can be re-enabled when the content management functions are re-implemented



// ===== SEO MANAGEMENT API ENDPOINTS =====

// Redirects endpoints
app.get('/api/redirects', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.search) filters.search = req.query.search;

    const redirects = await getRedirects(filters);
    res.json(redirects);
  } catch (error) {
    console.error('[testing] Error fetching redirects:', error);
    res.status(500).json({ error: 'Failed to fetch redirects' });
  }
});

app.post('/api/redirects', async (req, res) => {
  try {
    const redirect = await createRedirect(req.body);
    res.status(201).json(redirect);
  } catch (error) {
    console.error('[testing] Error creating redirect:', error);
    res.status(500).json({ error: 'Failed to create redirect' });
  }
});

app.put('/api/redirects/:id', async (req, res) => {
  try {
    const redirectId = parseInt(req.params.id);
    const redirect = await updateRedirect(redirectId, req.body);
    
    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }
    
    res.json(redirect);
  } catch (error) {
    console.error('[testing] Error updating redirect:', error);
    res.status(500).json({ error: 'Failed to update redirect' });
  }
});

app.delete('/api/redirects/:id', async (req, res) => {
  try {
    const redirectId = parseInt(req.params.id);
    const redirect = await deleteRedirect(redirectId);
    
    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }
    
    res.json({ message: 'Redirect deleted successfully' });
  } catch (error) {
    console.error('[testing] Error deleting redirect:', error);
    res.status(500).json({ error: 'Failed to delete redirect' });
  }
});

// Robots.txt endpoints
app.get('/api/robots-config', async (req, res) => {
  try {
    const config = await getRobotsConfig();
    res.json(config);
  } catch (error) {
    console.error('[testing] Error fetching robots config:', error);
    res.status(500).json({ error: 'Failed to fetch robots config' });
  }
});

app.put('/api/robots-config', async (req, res) => {
  try {
    await updateRobotsConfig(req.body.rules);
    res.json({ message: 'Robots config updated successfully' });
  } catch (error) {
    console.error('[testing] Error updating robots config:', error);
    res.status(500).json({ error: 'Failed to update robots config' });
  }
});

app.post('/api/robots-txt/generate', async (req, res) => {
  try {
    const robotsTxt = await generateRobotsTxt();
    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('[testing] Error generating robots.txt:', error);
    res.status(500).json({ error: 'Failed to generate robots.txt' });
  }
});

app.post('/api/robots-txt/update', async (req, res) => {
  try {
    const robotsTxt = await generateRobotsTxt();
    
    // Write to public/robots.txt
    const fs = await import('fs');
    const path = await import('path');
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    
    fs.writeFileSync(robotsPath, robotsTxt);
    
    res.json({ message: 'robots.txt file updated successfully' });
  } catch (error) {
    console.error('[testing] Error updating robots.txt file:', error);
    res.status(500).json({ error: 'Failed to update robots.txt file' });
  }
});

// Sitemap endpoints
app.get('/api/sitemap-entries', async (req, res) => {
  try {
    const type = req.query.type || null;
    const entries = await getSitemapEntries(type);
    res.json(entries);
  } catch (error) {
    console.error('[testing] Error fetching sitemap entries:', error);
    res.status(500).json({ error: 'Failed to fetch sitemap entries' });
  }
});

app.post('/api/sitemap-entries', async (req, res) => {
  try {
    const entry = await createSitemapEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    console.error('[testing] Error creating sitemap entry:', error);
    res.status(500).json({ error: 'Failed to create sitemap entry' });
  }
});

app.put('/api/sitemap-entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const result = await query(`
      UPDATE sitemap_entries 
      SET url = $1, changefreq = $2, priority = $3, sitemap_type = $4, 
          title = $5, description = $6, lastmod = NOW(), updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [
      req.body.url,
      req.body.changefreq,
      req.body.priority,
      req.body.sitemap_type,
      req.body.title,
      req.body.description,
      entryId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sitemap entry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[testing] Error updating sitemap entry:', error);
    res.status(500).json({ error: 'Failed to update sitemap entry' });
  }
});

app.delete('/api/sitemap-entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const result = await query('DELETE FROM sitemap_entries WHERE id = $1 RETURNING id', [entryId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sitemap entry not found' });
    }
    
    res.json({ message: 'Sitemap entry deleted successfully' });
  } catch (error) {
    console.error('[testing] Error deleting sitemap entry:', error);
    res.status(500).json({ error: 'Failed to delete sitemap entry' });
  }
});

app.post('/api/sitemap/generate', async (req, res) => {
  try {
    const sitemapXML = await generateSitemapXML();
    
    // Write to public/sitemap.xml
    const fs = await import('fs');
    const path = await import('path');
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemapXML);
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemapXML);
  } catch (error) {
    console.error('[testing] Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// SEO Meta endpoints
app.get('/api/seo-meta/:objectType/:objectId', async (req, res) => {
  try {
    const { objectType, objectId } = req.params;
    const seoMeta = await getSEOMeta(parseInt(objectId), objectType);
    res.json(seoMeta || {});
  } catch (error) {
    console.error('[testing] Error fetching SEO meta:', error);
    res.status(500).json({ error: 'Failed to fetch SEO meta' });
  }
});

// Server-rendered page with full-page cache
app.get('/r/:slug', async (req, res) => {
  try {
    const slug = '/' + req.params.slug;
    const cached = getPageCache(slug);
    if (cached) {
      res.setHeader('ETag', cached.etag);
      res.setHeader('Cache-Control', 'public, max-age=30');
      return res.status(200).send(cached.html);
    }

    const result = await renderPageBySlug(slug);
    if (result.status === 404) {
      return res.status(404).send('<h1>Not Found</h1>');
    }

    const etag = 'W/"' + Buffer.from(String(result.html.length)).toString('hex') + '"';
    setPageCache(slug, { html: result.html, etag, renderedAt: Date.now() });

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=30');
    res.status(200).send(result.html);
  } catch (error) {
    console.error('[testing] Error rendering page:', error);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

// Cache invalidation endpoint (admin-use; add auth later)
app.post('/api/cache/invalidate', async (req, res) => {
  try {
    const { slug, all } = req.body || {};
    if (all) {
      invalidateAll();
      return res.json({ ok: true, cleared: 'all' });
    }
    if (slug) {
      invalidateBySlug(slug);
      return res.json({ ok: true, cleared: slug });
    }
    return res.status(400).json({ error: 'Provide slug or all=true' });
  } catch (error) {
    console.error('[testing] Cache invalidation error:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

// Layout CRUD (minimal, add auth later)
app.get('/api/pages/:slug/layout', async (req, res) => {
  try {
    const layout = await getLayoutBySlug('/' + req.params.slug.replace(/^\//, ''));
    if (!layout) return res.status(404).json({ error: 'Page not found' });
    res.json(layout.layout_json || { components: [] });
  } catch (error) {
    console.error('[testing] Error getting layout:', error);
    res.status(500).json({ error: 'Failed to get layout' });
  }
});

app.put('/api/pages/:slug/layout', async (req, res) => {
  try {
    const slug = '/' + req.params.slug.replace(/^\//, '');
    const layoutJson = req.body?.components ? req.body : { components: [] };
    const updated = await upsertLayoutBySlug(slug, layoutJson);
    // Invalidate cache for this page
    invalidateBySlug(slug);
    res.json({ ok: true, version: updated.version });
  } catch (error) {
    console.error('[testing] Error updating layout:', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

// Alternative layout endpoints supporting slashes via query param (slug=/ etc.)
app.get('/api/layout', async (req, res) => {
  try {
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '/';
    const layout = await getLayoutBySlug(slug);
    if (!layout) return res.status(404).json({ error: 'Page not found' });
    res.json(layout.layout_json || { components: [] });
  } catch (error) {
    console.error('[testing] Error getting layout (query):', error);
    res.status(500).json({ error: 'Failed to get layout' });
  }
});

app.put('/api/layout', async (req, res) => {
  try {
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '/';
    const layoutJson = req.body && req.body.components ? req.body : { components: [] };
    const updated = await upsertLayoutBySlug(slug, layoutJson);
    invalidateBySlug(slug);
    res.json({ ok: true, version: updated.version });
  } catch (error) {
    console.error('[testing] Error updating layout (query):', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

app.post('/api/seo-meta', async (req, res) => {
  try {
    const seoMeta = await createSEOMeta(req.body);
    res.status(201).json(seoMeta);
  } catch (error) {
    console.error('[testing] Error creating SEO meta:', error);
    res.status(500).json({ error: 'Failed to create SEO meta' });
  }
});

// Get terms by taxonomy
app.get('/api/terms/taxonomy/:taxonomy', async (req, res) => {
  try {
    const { taxonomy } = req.params;
    // Use the existing getTerms function and filter by taxonomy
    const allTerms = await getTerms();
    const filteredTerms = allTerms.filter(term => term.taxonomy === taxonomy);
    res.json(filteredTerms);
  } catch (error) {
    console.error('[testing] Error fetching terms by taxonomy:', error);
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});


// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const userResult = await query(
      'SELECT id, first_name, last_name, email, password_hash, role, status, tenant_id, is_super_admin FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Verify password
    const bcrypt = await import('bcrypt');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create JWT token
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      is_super_admin: user.is_super_admin
    };
    
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

    // Return user data with token
    res.json({
      success: true,
      user: userData,
      token: token
    });

  } catch (error) {
    console.error('[testing] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

// Get current user from token
app.get('/api/auth/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await query(
      'SELECT id, first_name, last_name, email, role, status, tenant_id, is_super_admin FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, error: 'Account is not active' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        is_super_admin: user.is_super_admin
      }
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user data.' });
  }
});

// Get tenants endpoint
app.get('/api/tenants', async (req, res) => {
  try {
    const result = await query('SELECT id, name, created_at FROM tenants ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get specific tenant endpoint
app.get('/api/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id, name, created_at FROM tenants WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[testing] Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
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

// Blog API endpoints
// Get all blog posts
app.get('/api/blog/posts', async (req, res) => {
  try {
    // Get tenant from request or use default
    const tenantId = req.query.tenant || 'tenant-gosg';
    
    // Get database connection for tenant
    const db = await getDbForTenant(tenantId);
    
    // If no database connection, return 500
    if (!db) {
      console.error('No database connection for tenant:', tenantId);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    // Query posts from the database
    const query = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.content,
        p.featured_image as image,
        p.created_at as date,
        '5 min read' as "readTime",
        COALESCE(
          (SELECT t.name FROM post_terms pt 
           JOIN terms t ON pt.term_id = t.id 
           WHERE pt.post_id = p.id AND t.taxonomy = 'category' 
           LIMIT 1),
          'Uncategorized'
        ) as category
      FROM posts p
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    
    const result = await db.query(query);
    
    // Format dates and ensure proper structure
    const posts = result.rows.map(post => ({
      ...post,
      date: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get individual blog post by slug
app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tenantId = req.query.tenant || 'tenant-gosg';
    
    // Get database connection for tenant
    const db = await getDbForTenant(tenantId);
    
    // If no database connection, return 500
    if (!db) {
      console.error('No database connection for tenant:', tenantId);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    // Query post from the database
    const query = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.content,
        p.featured_image as image,
        p.created_at as date,
        '5 min read' as "readTime",
        COALESCE(
          (SELECT t.name FROM post_terms pt 
           JOIN terms t ON pt.term_id = t.id 
           WHERE pt.post_id = p.id AND t.taxonomy = 'category' 
           LIMIT 1),
          'Uncategorized'
        ) as category
      FROM posts p
      WHERE p.slug = $1 AND p.status = 'published'
      LIMIT 1
    `;
    
    const result = await db.query(query, [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Get post tags
    const tagsQuery = `
      SELECT t.name
      FROM post_terms pt
      JOIN terms t ON pt.term_id = t.id
      WHERE pt.post_id = $1 AND t.taxonomy = 'post_tag'
    `;
    
    const tagsResult = await db.query(tagsQuery, [result.rows[0].id]);
    const tags = tagsResult.rows.map(row => row.name);
    
    // Format post data
    const post = {
      ...result.rows[0],
      date: result.rows[0].date ? new Date(result.rows[0].date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tags: tags
    };
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Schema migration and validation endpoints
app.post('/api/pages/:pageId/migrate-schema', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.body;
    console.log(`[testing] API: Migrating schema for page ${pageId} (tenant: ${tenantId})`);
    
    // Get current page layout
    const page = await getPageWithLayout(pageId, tenantId);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    
    // Import migration utilities
    const { migrateOldSchemaToNew, needsMigration } = await import('./sparti-cms/utils/schema-migration.ts');
    
    // Check if migration is needed
    if (!needsMigration(page.layout)) {
      return res.json({
        success: true,
        message: 'Schema already in new format',
        migrated: false
      });
    }
    
    // Migrate the schema
    const newSchema = migrateOldSchemaToNew(page.layout);
    
    // Add version info
    const schemaWithVersion = {
      ...newSchema,
      _version: {
        version: '2.0',
        migratedAt: new Date().toISOString(),
        migratedFrom: '1.0'
      }
    };
    
    // Update the database
    const success = await updatePageLayout(pageId, schemaWithVersion, tenantId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update page layout'
      });
    }
    
    res.json({
      success: true,
      message: 'Schema migrated successfully',
      migrated: true,
      newSchema
    });
  } catch (error) {
    console.error('[testing] API: Error migrating schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to migrate schema',
      message: error.message
    });
  }
});

app.post('/api/pages/:pageId/validate-schema', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.body;
    console.log(`[testing] API: Validating schema for page ${pageId} (tenant: ${tenantId})`);
    
    // Get current page layout
    const page = await getPageWithLayout(pageId, tenantId);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    
    // Import validation utilities
    const { validatePageSchema, getValidationSummary } = await import('./sparti-cms/utils/schema-validator.ts');
    
    // Validate the schema
    const validation = validatePageSchema(page.layout);
    const summary = getValidationSummary(page.layout);
    
    res.json({
      success: true,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      },
      summary: {
        totalComponents: summary.totalComponents,
        totalItems: summary.totalItems,
        itemTypeCounts: summary.itemTypeCounts,
        hasErrors: summary.hasErrors,
        hasWarnings: summary.hasWarnings
      }
    });
  } catch (error) {
    console.error('[testing] API: Error validating schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate schema',
      message: error.message
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('[testing] Initializing database...');
    const dbSuccess = await initializeDatabase();
    
    if (!dbSuccess) {
      console.error('[testing] Failed to initialize database, exiting...');
      process.exit(1);
    }
    
    console.log('[testing] Database initialized successfully');
    
    // Initialize blog schema for default tenant
    await ensureBlogSchemaInitialized('tenant-gosg');
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Health check available at http://0.0.0.0:${port}/health`);
      console.log(`Detailed health check available at http://0.0.0.0:${port}/health/detailed`);
      console.log(`Application available at http://0.0.0.0:${port}/`);
      console.log(`API endpoints available at http://0.0.0.0:${port}/api/`);
      console.log('[testing] Server fully initialized and ready for health checks');
    });
  } catch (error) {
    console.error('[testing] Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();




