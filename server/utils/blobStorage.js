/**
 * Vercel Blob storage utility for serverless deployments.
 * When BLOB_READ_WRITE_TOKEN or VERCEL is set, uploads go to Vercel Blob instead of disk.
 * @module server/utils/blobStorage
 */

/**
 * Whether to use Vercel Blob for uploads (Vercel env or token set).
 * @returns {boolean}
 */
export function useBlobStorage() {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);
}

/**
 * Upload a buffer to Vercel Blob and return the public URL.
 * @param {Buffer} buffer - File buffer
 * @param {string} pathname - Blob path (e.g. "uploads/tenant-id/filename.png")
 * @param {string} [contentType] - MIME type
 * @returns {Promise<string|null>} Blob URL or null if Blob not configured / upload failed
 */
export async function uploadBufferToBlob(buffer, pathname, contentType) {
  if (!useBlobStorage() || !process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }
  try {
    const { put } = await import('@vercel/blob');
    const isIco = pathname.toLowerCase().endsWith('.ico');
    const blob = await put(pathname, buffer, {
      access: 'public',
      ...(isIco ? { contentType: 'image/x-icon' } : contentType ? { contentType } : {}),
    });
    return blob.url;
  } catch (error) {
    console.error('[testing] Vercel Blob upload failed:', error?.message || error);
    return null;
  }
}
