import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { getTenantStorageName } from '../db/modules/media.js';
import { createMediaFile } from '../db/modules/media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Download an image from a URL and save it locally
 * @param {string} imageUrl - URL of the image to download
 * @param {string} tenantId - Tenant ID for storage
 * @returns {Promise<string>} Local URL/path of the downloaded image
 */
export async function downloadImageFromUrl(imageUrl, tenantId) {
  try {
    if (!imageUrl || !tenantId) {
      throw new Error('Image URL and tenant ID are required');
    }

    // Skip if already a local URL
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/api/')) {
      console.log('[testing] Image is already local:', imageUrl);
      return imageUrl;
    }

    // Get tenant storage name
    const storageName = await getTenantStorageName(tenantId);
    
    // Get tenant storage path
    const tenantUploadsDir = join(__dirname, '..', '..', 'public', 'uploads', storageName);
    if (!existsSync(tenantUploadsDir)) {
      mkdirSync(tenantUploadsDir, { recursive: true });
    }

    // Extract filename from URL
    const urlObj = new URL(imageUrl);
    const urlPath = urlObj.pathname;
    const originalFilename = urlPath.split('/').pop() || 'image';
    
    // Get file extension
    let fileExtension = extname(originalFilename).slice(1).toLowerCase();
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      // Try to determine from content type or default to jpg
      fileExtension = 'jpg';
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const filename = `wordpress-import-${timestamp}-${randomSuffix}.${fileExtension}`;
    const filePath = join(tenantUploadsDir, filename);

    // Download the image
    return new Promise((resolve, reject) => {
      const protocol = imageUrl.startsWith('https:') ? https : http;
      
      const request = protocol.get(imageUrl, (response) => {
        // Check if response is successful
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        // Check content type
        const contentType = response.headers['content-type'];
        if (contentType && !contentType.startsWith('image/')) {
          reject(new Error(`URL does not point to an image: ${contentType}`));
          return;
        }

        // Create write stream
        const fileStream = createWriteStream(filePath);
        let fileSize = 0;

        // Track file size
        response.on('data', (chunk) => {
          fileSize += chunk.length;
        });

        // Handle stream errors
        fileStream.on('error', (err) => {
          reject(new Error(`Failed to save image: ${err.message}`));
        });

        // Handle completion
        fileStream.on('finish', async () => {
          try {
            // Create media file record
            const relativePath = `/uploads/${storageName}/${filename}`;
            
            await createMediaFile({
              filename: filename,
              original_filename: originalFilename,
              slug: `wordpress-import-${timestamp}-${randomSuffix}`,
              alt_text: '',
              title: originalFilename,
              description: `Imported from WordPress: ${imageUrl}`,
              url: relativePath,
              relative_path: relativePath,
              mime_type: contentType || `image/${fileExtension}`,
              file_extension: fileExtension,
              file_size: fileSize,
              media_type: 'image',
              metadata: { source_url: imageUrl, imported_from: 'wordpress' }
            }, tenantId);
            
            console.log('[testing] Image downloaded and saved:', relativePath);
            resolve(relativePath);
          } catch (err) {
            console.error('[testing] Error creating media file record:', err);
            // Still return the path even if DB record creation fails
            const relativePath = `/uploads/${storageName}/${filename}`;
            resolve(relativePath);
          }
        });

        // Pipe response to file
        response.pipe(fileStream);
      });

      request.on('error', (err) => {
        reject(new Error(`Failed to download image: ${err.message}`));
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Image download timeout'));
      });
    });
  } catch (error) {
    console.error('[testing] Error downloading image:', imageUrl, error);
    throw error;
  }
}

/**
 * Download multiple images and return a map of original URLs to local URLs
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {string} tenantId - Tenant ID for storage
 * @returns {Promise<Map<string, string>>} Map of original URL to local URL
 */
export async function downloadImages(imageUrls, tenantId) {
  const imageMap = new Map();
  const errors = [];

  for (const imageUrl of imageUrls) {
    try {
      const localUrl = await downloadImageFromUrl(imageUrl, tenantId);
      imageMap.set(imageUrl, localUrl);
    } catch (error) {
      console.error('[testing] Failed to download image:', imageUrl, error.message);
      errors.push(`Failed to download ${imageUrl}: ${error.message}`);
      // Keep original URL as fallback
      imageMap.set(imageUrl, imageUrl);
    }
  }

  return { imageMap, errors };
}

