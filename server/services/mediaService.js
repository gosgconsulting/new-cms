import MediaRepository from '../repositories/MediaRepository.js';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Media Service
 * Handles business logic for media management
 */

/**
 * Process uploaded file and create media record
 */
export async function processUpload(file, tenantId = null, folderId = null, metadata = {}) {
  try {
    const mediaData = {
      filename: file.filename,
      original_filename: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`,
      tenant_id: tenantId,
      folder_id: folderId,
      alt_text: metadata.alt_text || null,
      title: metadata.title || file.originalname,
      description: metadata.description || null
    };

    const media = await MediaRepository.createMedia(mediaData);
    return media;
  } catch (error) {
    // Clean up file if database insert fails
    try {
      if (file.path && existsSync(file.path)) {
        await unlink(file.path);
      }
    } catch (unlinkError) {
      console.error('[MediaService] Failed to clean up file:', unlinkError);
    }

    throw error;
  }
}

/**
 * Delete media file and record
 */
export async function deleteMedia(mediaId) {
  const media = await MediaRepository.findById(mediaId);

  if (!media) {
    throw new Error('Media not found');
  }

  // Delete file from filesystem
  try {
    if (media.path && existsSync(media.path)) {
      await unlink(media.path);
    }
  } catch (error) {
    console.error('[MediaService] Failed to delete file:', error);
    // Continue with database deletion even if file deletion fails
  }

  // Delete database record
  await MediaRepository.delete(mediaId);

  return media;
}

/**
 * Bulk delete media files
 */
export async function bulkDeleteMedia(mediaIds) {
  const results = [];

  for (const mediaId of mediaIds) {
    try {
      const media = await deleteMedia(mediaId);
      results.push({ id: mediaId, success: true, media });
    } catch (error) {
      results.push({ id: mediaId, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Update media metadata
 */
export async function updateMediaMetadata(mediaId, metadata) {
  const media = await MediaRepository.findById(mediaId);

  if (!media) {
    throw new Error('Media not found');
  }

  const updateData = {};

  if (metadata.title !== undefined) {
    updateData.title = metadata.title;
  }

  if (metadata.alt_text !== undefined) {
    updateData.alt_text = metadata.alt_text;
  }

  if (metadata.description !== undefined) {
    updateData.description = metadata.description;
  }

  if (metadata.folder_id !== undefined) {
    updateData.folder_id = metadata.folder_id;
  }

  return await MediaRepository.updateMedia(mediaId, updateData);
}

/**
 * Move media to folder
 */
export async function moveMediaToFolder(mediaId, folderId) {
  return await MediaRepository.updateMedia(mediaId, { folder_id: folderId });
}

/**
 * Get media usage in content
 */
export async function getMediaUsage(mediaId) {
  const { query } = await import('../../sparti-cms/db/index.js');

  // Find posts using this media
  const postsResult = await query(
    `SELECT id, title, slug 
     FROM posts 
     WHERE content LIKE $1 OR featured_image_id = $2`,
    [`%${mediaId}%`, mediaId]
  );

  // Find pages using this media
  const pagesResult = await query(
    `SELECT id, name, slug 
     FROM pages 
     WHERE page_data::text LIKE $1`,
    [`%${mediaId}%`]
  );

  return {
    posts: postsResult.rows,
    pages: pagesResult.rows,
    totalUsage: postsResult.rows.length + pagesResult.rows.length
  };
}

/**
 * Get orphaned media (not used anywhere)
 */
export async function getOrphanedMedia(tenantId = null) {
  const { query } = await import('../../sparti-cms/db/index.js');

  let queryText = `
    SELECT m.* 
    FROM media m
    WHERE NOT EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.content LIKE '%' || m.id || '%' 
         OR p.featured_image_id = m.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM pages pg 
      WHERE pg.page_data::text LIKE '%' || m.id || '%'
    )
  `;

  const params = [];
  if (tenantId) {
    queryText += ' AND m.tenant_id = $1';
    params.push(tenantId);
  }

  queryText += ' ORDER BY m.created_at DESC';

  const result = await query(queryText, params);
  return result.rows;
}

/**
 * Clean up orphaned media
 */
export async function cleanupOrphanedMedia(tenantId = null, dryRun = true) {
  const orphaned = await getOrphanedMedia(tenantId);

  if (dryRun) {
    return {
      dryRun: true,
      count: orphaned.length,
      media: orphaned,
      estimatedSpaceSaved: orphaned.reduce((sum, m) => sum + (m.file_size || 0), 0)
    };
  }

  const results = await bulkDeleteMedia(orphaned.map(m => m.id));

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  return {
    dryRun: false,
    total: orphaned.length,
    success: successCount,
    failed: failureCount,
    results
  };
}

/**
 * Get media statistics by type
 */
export async function getMediaStatsByType(tenantId = null) {
  const { query } = await import('../../sparti-cms/db/index.js');

  let queryText = `
    SELECT 
      CASE 
        WHEN mime_type LIKE 'image/%' THEN 'images'
        WHEN mime_type LIKE 'video/%' THEN 'videos'
        WHEN mime_type LIKE 'audio/%' THEN 'audio'
        WHEN mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') THEN 'documents'
        ELSE 'other'
      END as type,
      COUNT(*) as count,
      COALESCE(SUM(file_size), 0) as total_size
    FROM media
  `;

  const params = [];
  if (tenantId) {
    queryText += ' WHERE tenant_id = $1';
    params.push(tenantId);
  }

  queryText += ' GROUP BY type ORDER BY count DESC';

  const result = await query(queryText, params);
  return result.rows;
}

/**
 * Generate thumbnail URL
 * This is a placeholder - implement actual thumbnail generation
 */
export function getThumbnailUrl(media, size = 'medium') {
  if (!media.mime_type?.startsWith('image/')) {
    return null;
  }

  // In a real implementation, this would return a resized image URL
  // For now, return the original URL
  return media.url;
}

/**
 * Validate file type
 */
export function validateFileType(mimetype, allowedTypes = []) {
  if (allowedTypes.length === 0) {
    return true;
  }

  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const baseType = type.replace('/*', '');
      return mimetype.startsWith(baseType);
    }
    return mimetype === type;
  });
}

/**
 * Validate file size
 */
export function validateFileSize(size, maxSize) {
  return size <= maxSize;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
