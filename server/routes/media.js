/**
 * Media Management Routes
 * 
 * Handles tenant-based media file and folder management.
 * Each tenant has their own media storage connected via storage_name.
 */

import express from 'express';
import { upload } from '../config/multer.js';
import {
  getMediaFolders,
  createMediaFolder,
  updateMediaFolder,
  deleteMediaFolder,
  getMediaFiles,
  getMediaFile,
  createMediaFile,
  updateMediaFile,
  deleteMediaFile,
  getTenantStorageName
} from '../../sparti-cms/db/modules/media.js';
import { authenticateUser } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// ===== MEDIA FOLDERS ROUTES =====

// Get all folders for a tenant
router.get('/folders', authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const parentFolderId = req.query.parent_folder_id ? parseInt(req.query.parent_folder_id) : null;
    const folders = await getMediaFolders(tenantId, parentFolderId);
    res.json(folders);
  } catch (error) {
    console.error('[testing] Error fetching media folders:', error);
    res.status(500).json({ error: 'Failed to fetch media folders' });
  }
});

// Create a folder
router.post('/folders', authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const folder = await createMediaFolder(req.body, tenantId);
    res.status(201).json(folder);
  } catch (error) {
    console.error('[testing] Error creating media folder:', error);
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create media folder' });
  }
});

// Update a folder
router.put('/folders/:id', authenticateUser, async (req, res) => {
  try {
    const folderId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const folder = await updateMediaFolder(folderId, req.body, tenantId);
    res.json(folder);
  } catch (error) {
    console.error('[testing] Error updating media folder:', error);
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update media folder' });
  }
});

// Delete a folder
router.delete('/folders/:id', authenticateUser, async (req, res) => {
  try {
    const folderId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    await deleteMediaFolder(folderId, tenantId);
    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('[testing] Error deleting media folder:', error);
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete media folder' });
  }
});

// ===== MEDIA FILES ROUTES =====

// Get all media files for a tenant
router.get('/files', authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const filters = {
      folder_id: req.query.folder_id ? parseInt(req.query.folder_id) : undefined,
      media_type: req.query.media_type,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const result = await getMediaFiles(tenantId, filters);
    res.json(result);
  } catch (error) {
    console.error('[testing] Error fetching media files:', error);
    res.status(500).json({ error: 'Failed to fetch media files' });
  }
});

// Get a single media file
router.get('/files/:id', authenticateUser, async (req, res) => {
  try {
    const mediaId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const file = await getMediaFile(mediaId, tenantId);
    if (!file) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    res.json(file);
  } catch (error) {
    console.error('[testing] Error fetching media file:', error);
    res.status(500).json({ error: 'Failed to fetch media file' });
  }
});

// Upload a media file
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Get storage name for tenant
    const storageName = await getTenantStorageName(tenantId);
    
    // Generate slug from filename
    const slug = req.file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now();

    // Determine media type
    let mediaType = 'other';
    if (req.file.mimetype.startsWith('image/')) mediaType = 'image';
    else if (req.file.mimetype.startsWith('video/')) mediaType = 'video';
    else if (req.file.mimetype.startsWith('audio/')) mediaType = 'audio';
    else if (req.file.mimetype.includes('pdf') || req.file.mimetype.includes('document') || req.file.mimetype.includes('text')) mediaType = 'document';

    // Get file extension
    const fileExtension = path.extname(req.file.originalname).slice(1).toLowerCase();

    // Create relative path based on storage
    const relativePath = `/uploads/${storageName}/${req.file.filename}`;
    const url = relativePath; // Can be updated to use CDN URL if configured

    // Create media file record
    const mediaData = {
      filename: req.file.filename,
      original_filename: req.file.originalname,
      slug: slug,
      alt_text: req.body.alt_text || '',
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      url: url,
      relative_path: relativePath,
      mime_type: req.file.mimetype,
      file_extension: fileExtension,
      file_size: req.file.size,
      width: req.body.width ? parseInt(req.body.width) : null,
      height: req.body.height ? parseInt(req.body.height) : null,
      duration: req.body.duration ? parseInt(req.body.duration) : null,
      folder_id: req.body.folder_id ? parseInt(req.body.folder_id) : null,
      media_type: mediaType,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : null
    };

    const mediaFile = await createMediaFile(mediaData, tenantId);

    res.status(201).json({
      success: true,
      file: mediaFile,
      url: url
    });
  } catch (error) {
    console.error('[testing] Error uploading media file:', error);
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to upload media file' });
  }
});

// Update a media file
router.put('/files/:id', authenticateUser, async (req, res) => {
  try {
    const mediaId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const file = await updateMediaFile(mediaId, req.body, tenantId);
    res.json(file);
  } catch (error) {
    console.error('[testing] Error updating media file:', error);
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update media file' });
  }
});

// Delete a media file
router.delete('/files/:id', authenticateUser, async (req, res) => {
  try {
    const mediaId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    await deleteMediaFile(mediaId, tenantId);
    res.json({ success: true, message: 'Media file deleted successfully' });
  } catch (error) {
    console.error('[testing] Error deleting media file:', error);
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete media file' });
  }
});

export default router;

