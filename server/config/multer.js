import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get tenant storage path based on storage_name
 * Uses Railway env variable or falls back to tenant_id
 */
async function getTenantStoragePath(tenantId) {
  try {
    // Check Railway environment variable: RAILWAY_STORAGE_{TENANT_ID}
    const envKey = `RAILWAY_STORAGE_${tenantId.toUpperCase().replace(/-/g, '_')}`;
    const envStorageName = process.env[envKey];
    
    let storageName = envStorageName;
    
    if (!storageName) {
      // Fallback to database
      const { query } = await import('../../sparti-cms/db/index.js');
      const result = await query(`
        SELECT storage_name FROM tenants WHERE id = $1
      `, [tenantId]);
      
      if (result.rows.length > 0 && result.rows[0].storage_name) {
        storageName = result.rows[0].storage_name;
      }
    }
    
    // Default to tenant_id if no storage_name configured
    storageName = storageName || tenantId;
    
    // Create tenant-specific upload directory
    const tenantUploadsDir = join(__dirname, '..', '..', 'public', 'uploads', storageName);
    if (!existsSync(tenantUploadsDir)) {
      mkdirSync(tenantUploadsDir, { recursive: true });
      console.log('[testing] Created tenant uploads directory:', tenantUploadsDir);
    }
    
    return tenantUploadsDir;
  } catch (error) {
    console.error(`[testing] Error getting storage path for tenant ${tenantId}:`, error);
    // Fallback to default uploads directory
    const defaultDir = join(__dirname, '..', '..', 'public', 'uploads');
    if (!existsSync(defaultDir)) {
      mkdirSync(defaultDir, { recursive: true });
    }
    return defaultDir;
  }
}

// Configure multer for file uploads with tenant-based storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      // Get tenant ID from request
      const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
      
      // Get tenant-specific storage path
      const tenantUploadsDir = await getTenantStoragePath(tenantId);
      cb(null, tenantUploadsDir);
    } catch (error) {
      console.error('[testing] Error setting upload destination:', error);
      // Fallback to default directory
      const defaultDir = join(__dirname, '..', '..', 'public', 'uploads');
      if (!existsSync(defaultDir)) {
        mkdirSync(defaultDir, { recursive: true });
      }
      cb(null, defaultDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

// Simple storage for basic uploads (saves directly to public/uploads/)
const simpleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = join(__dirname, '..', '..', 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
      console.log('[testing] Created uploads directory:', uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

// Tenant-based storage (for media management)
export const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit (for WordPress import files)
  },
  fileFilter: (req, file, cb) => {
    // Allow more file types for media management and imports
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico|webp|mp4|mov|avi|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|xml|json/;
    const ext = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mime = allowedTypes.test(file.mimetype) || 
                 file.mimetype.startsWith('image/') || 
                 file.mimetype.startsWith('video/') || 
                 file.mimetype.startsWith('application/') ||
                 file.mimetype === 'text/xml' ||
                 file.mimetype === 'application/xml' ||
                 file.mimetype === 'application/json' ||
                 file.mimetype === 'text/json';
    
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Simple upload for basic file uploads (saves directly to public/uploads/)
export const simpleUpload = multer({
  storage: simpleStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for basic uploads
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico|webp|pdf/;
    const ext = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mime = allowedTypes.test(file.mimetype) || 
                 file.mimetype.startsWith('image/') ||
                 file.mimetype === 'application/pdf';
    
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Only images and PDFs are allowed.'));
    }
  }
});

