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
  deleteContact
} from './sparti-cms/db/postgres.js';

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
    const { form_id, form_name, name, email, phone, message } = req.body;
    
    console.log('[testing] Form submission received:', { form_id, name, email });
    
    // Save form submission
    const submission = await saveFormSubmission({ 
      form_id, 
      form_name, 
      name, 
      email, 
      phone, 
      message 
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
