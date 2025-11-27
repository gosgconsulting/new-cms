import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { 
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
  query,
  getTerms
} from '../../sparti-cms/db/index.js';
import pool from '../../sparti-cms/db/index.js';
import { renderPageBySlug } from '../../sparti-cms/render/pageRenderer.js';
import { getLayoutBySlug, upsertLayoutBySlug } from '../../sparti-cms/db/index.js';
import cacheStore, { getPageCache, setPageCache, invalidateBySlug, invalidateAll } from '../../sparti-cms/cache/index.js';

// Import tenant routes
import tenantRoutes from '../../sparti-cms/db/tenant-api-routes.js';

// Import mock data for development
import {
  getMockContacts,
  getMockFormSubmissions,
  createMockContact,
  updateMockContact,
  deleteMockContact
} from '../../sparti-cms/db/scripts/mock-data.js';

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
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

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

// Note: Database migrations should be run via Sequelize CLI
// Run: npm run sequelize:migrate
console.log('[testing] Note: Ensure database migrations are run: npm run sequelize:migrate');

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

// Start the server
app.listen(port, () => {
  console.log(`[testing] Server is running on port ${port}`);
  console.log(`[testing] Health check: http://localhost:${port}/health`);
  console.log(`[testing] Detailed health check: http://localhost:${port}/health/detailed`);
});
