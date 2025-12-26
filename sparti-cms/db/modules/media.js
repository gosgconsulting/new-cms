/**
 * Media Management Module
 * 
 * Handles tenant-based media files and folders.
 * Each tenant has their own media storage connected via storage_name.
 */

import { query } from '../connection.js';
import pool from '../connection.js';

/**
 * Get tenant's storage name from Railway env or database
 */
export async function getTenantStorageName(tenantId) {
  try {
    // First check Railway environment variable: RAILWAY_STORAGE_{TENANT_ID}
    const envKey = `RAILWAY_STORAGE_${tenantId.toUpperCase().replace(/-/g, '_')}`;
    const envStorageName = process.env[envKey];
    
    if (envStorageName) {
      console.log(`[testing] Using storage from env ${envKey}: ${envStorageName}`);
      return envStorageName;
    }

    // Fallback to database
    const result = await query(`
      SELECT storage_name FROM tenants WHERE id = $1
    `, [tenantId]);

    if (result.rows.length > 0 && result.rows[0].storage_name) {
      return result.rows[0].storage_name;
    }

    // Default to tenant_id if no storage_name configured
    return tenantId;
  } catch (error) {
    console.error(`[testing] Error getting storage name for tenant ${tenantId}:`, error);
    return tenantId; // Fallback to tenant_id
  }
}

/**
 * Get all media folders for a tenant
 */
export async function getMediaFolders(tenantId, parentFolderId = null) {
  try {
    let whereClause = 'WHERE tenant_id = $1';
    let params = [tenantId];

    if (parentFolderId !== null) {
      whereClause += ' AND parent_folder_id = $2';
      params.push(parentFolderId);
    } else {
      whereClause += ' AND parent_folder_id IS NULL';
    }

    const result = await query(`
      SELECT * FROM media_folders
      ${whereClause}
      AND is_active = true
      ORDER BY name ASC
    `, params);

    return result.rows;
  } catch (error) {
    console.error(`[testing] Error fetching media folders for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Create a media folder for a tenant
 */
export async function createMediaFolder(folderData, tenantId) {
  try {
    const { name, slug, description, parent_folder_id, folder_path } = folderData;

    const result = await query(`
      INSERT INTO media_folders (name, slug, description, parent_folder_id, folder_path, tenant_id, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      RETURNING *
    `, [name, slug, description, parent_folder_id || null, folder_path, tenantId]);

    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error creating media folder for tenant ${tenantId}:`, error);
    if (error.code === '23505' || error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('A folder with this slug already exists for this tenant');
    }
    throw error;
  }
}

/**
 * Update a media folder
 */
export async function updateMediaFolder(folderId, folderData, tenantId) {
  try {
    const { name, slug, description, parent_folder_id, folder_path } = folderData;

    const result = await query(`
      UPDATE media_folders
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          parent_folder_id = COALESCE($4, parent_folder_id),
          folder_path = COALESCE($5, folder_path),
          updated_at = NOW()
      WHERE id = $6 AND tenant_id = $7
      RETURNING *
    `, [name, slug, description, parent_folder_id, folder_path, folderId, tenantId]);

    if (result.rows.length === 0) {
      throw new Error('Folder not found or does not belong to this tenant');
    }

    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error updating media folder for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Delete a media folder (soft delete)
 */
export async function deleteMediaFolder(folderId, tenantId) {
  try {
    const result = await query(`
      UPDATE media_folders
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, [folderId, tenantId]);

    if (result.rows.length === 0) {
      throw new Error('Folder not found or does not belong to this tenant');
    }

    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error deleting media folder for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Get all media files for a tenant
 */
export async function getMediaFiles(tenantId, filters = {}) {
  try {
    let whereClause = 'WHERE tenant_id = $1';
    let params = [tenantId];

    if (filters.folder_id !== undefined) {
      if (filters.folder_id === null) {
        whereClause += ' AND folder_id IS NULL';
      } else {
        whereClause += ' AND folder_id = $2';
        params.push(filters.folder_id);
      }
    }

    if (filters.media_type) {
      whereClause += ` AND media_type = $${params.length + 1}`;
      params.push(filters.media_type);
    }

    if (filters.search) {
      whereClause += ` AND (filename ILIKE $${params.length + 1} OR title ILIKE $${params.length + 1} OR alt_text ILIKE $${params.length + 1})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    whereClause += ' AND is_active = true';

    const result = await query(`
      SELECT * FROM media
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, filters.limit || 50, filters.offset || 0]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM media
      ${whereClause}
    `, params);

    return {
      files: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: filters.limit || 50,
      offset: filters.offset || 0
    };
  } catch (error) {
    console.error(`[testing] Error fetching media files for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Get a single media file
 */
export async function getMediaFile(mediaId, tenantId) {
  try {
    const result = await query(`
      SELECT * FROM media
      WHERE id = $1 AND tenant_id = $2 AND is_active = true
    `, [mediaId, tenantId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error(`[testing] Error fetching media file for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Create a media file record
 */
export async function createMediaFile(mediaData, tenantId) {
  try {
    const {
      filename,
      original_filename,
      slug,
      alt_text,
      title,
      description,
      url,
      relative_path,
      mime_type,
      file_extension,
      file_size,
      width,
      height,
      duration,
      folder_id,
      media_type,
      metadata
    } = mediaData;

    const result = await query(`
      INSERT INTO media (
        filename, original_filename, slug, alt_text, title, description,
        url, relative_path, mime_type, file_extension, file_size,
        width, height, duration, folder_id, media_type, metadata,
        tenant_id, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true, NOW(), NOW())
      RETURNING *
    `, [
      filename, original_filename, slug, alt_text, title, description,
      url, relative_path, mime_type, file_extension, file_size,
      width, height, duration, folder_id || null, media_type, metadata || null,
      tenantId
    ]);

    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error creating media file for tenant ${tenantId}:`, error);
    if (error.code === '23505' || error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('A media file with this slug already exists for this tenant');
    }
    throw error;
  }
}

/**
 * Update a media file
 */
export async function updateMediaFile(mediaId, mediaData, tenantId) {
  try {
    const {
      alt_text,
      title,
      description,
      folder_id,
      is_featured,
      seo_optimized
    } = mediaData;

    const result = await query(`
      UPDATE media
      SET alt_text = COALESCE($1, alt_text),
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          folder_id = COALESCE($4, folder_id),
          is_featured = COALESCE($5, is_featured),
          seo_optimized = COALESCE($6, seo_optimized),
          updated_at = NOW()
      WHERE id = $7 AND tenant_id = $8
      RETURNING *
    `, [alt_text, title, description, folder_id, is_featured, seo_optimized, mediaId, tenantId]);

    if (result.rows.length === 0) {
      throw new Error('Media file not found or does not belong to this tenant');
    }

    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error updating media file for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Delete a media file (soft delete)
 */
export async function deleteMediaFile(mediaId, tenantId) {
  try {
    const result = await query(`
      UPDATE media
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, [mediaId, tenantId]);

    if (result.rows.length === 0) {
      throw new Error('Media file not found or does not belong to this tenant');
    }

    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error deleting media file for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Initialize empty media folders for a tenant
 */
export async function initializeTenantMediaFolders(tenantId) {
  try {
    console.log(`[testing] Initializing media folders for tenant: ${tenantId}`);

    // Check if folders already exist
    const existingFolders = await getMediaFolders(tenantId);
    if (existingFolders.length > 0) {
      console.log(`[testing] Media folders already exist for tenant ${tenantId}`);
      return existingFolders;
    }

    // Create default folders
    const defaultFolders = [
      { name: 'Images', slug: 'images', folder_path: '/images' },
      { name: 'Videos', slug: 'videos', folder_path: '/videos' },
      { name: 'Documents', slug: 'documents', folder_path: '/documents' },
      { name: 'Other', slug: 'other', folder_path: '/other' }
    ];

    const createdFolders = [];
    for (const folder of defaultFolders) {
      try {
        const created = await createMediaFolder(folder, tenantId);
        createdFolders.push(created);
      } catch (error) {
        console.error(`[testing] Error creating folder ${folder.name}:`, error);
      }
    }

    console.log(`[testing] Created ${createdFolders.length} media folders for tenant ${tenantId}`);
    return createdFolders;
  } catch (error) {
    console.error(`[testing] Error initializing media folders for tenant ${tenantId}:`, error);
    throw error;
  }
}

