/**
 * Upload a file to the media API (POST /api/media/upload).
 * Creates a media record in the database and returns the item in MediaItem shape.
 */

import api from './api';

/** Media item shape returned by uploadMediaFile (matches MediaManager/MediaModal MediaItem). */
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  url: string;
  size: number;
  dateUploaded: string;
  folderId: string | null;
  alt?: string;
  title?: string;
  description?: string;
}

export interface UploadMediaFileOptions {
  /** Tenant ID (required for /api/media/upload). */
  tenantId: string;
  /** Optional folder ID. */
  folderId?: string | null;
  alt_text?: string;
  title?: string;
  description?: string;
}

function getFileType(mimeType: string): MediaItem['type'] {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

function getAuthToken(): string | null {
  try {
    const session = localStorage.getItem('sparti-user-session');
    if (!session) return null;
    const userData = JSON.parse(session);
    return userData.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Upload a single file to /api/media/upload and return the created media item.
 *
 * @param file - File to upload
 * @param options - tenantId (required), optional folderId, alt_text, title, description
 * @returns Promise<MediaItem> - The created media item
 * @throws On upload or API failure
 */
export async function uploadMediaFile(
  file: File,
  options: UploadMediaFileOptions
): Promise<MediaItem> {
  const { tenantId, folderId, alt_text, title, description } = options;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tenantId', tenantId);
  if (folderId != null && folderId !== '') {
    formData.append('folder_id', String(folderId));
  }
  if (alt_text != null) formData.append('alt_text', alt_text);
  if (title != null) formData.append('title', title);
  if (description != null) formData.append('description', description);

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) headers['X-Tenant-Id'] = tenantId;

  const url = `${api.getBaseUrl()}/api/media/upload?tenantId=${encodeURIComponent(tenantId)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Upload failed: ${file.name}`;
    try {
      const err = JSON.parse(errorText);
      if (err.error) message = err.error;
    } catch {
      if (errorText) message = errorText;
    }
    throw new Error(message);
  }

  const result = await response.json();
  const f = result.file;
  if (!f) {
    throw new Error('Upload response missing file');
  }

  const mediaItem: MediaItem = {
    id: String(f.id),
    name: f.filename || f.original_filename || file.name,
    type: (f.media_type as MediaItem['type']) || getFileType(file.type),
    url: f.url || result.url || '',
    size: f.file_size ?? file.size,
    dateUploaded: f.created_at
      ? new Date(f.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    folderId: f.folder_id != null ? String(f.folder_id) : null,
    alt: f.alt_text ?? '',
    title: f.title ?? '',
    description: f.description ?? '',
  };
  return mediaItem;
}

/**
 * Upload multiple files and optionally report progress.
 *
 * @param files - Files to upload
 * @param options - Same as uploadMediaFile (tenantId required, etc.)
 * @param onProgress - Optional callback (uploadedCount, totalCount) => void
 * @returns Promise<MediaItem[]>
 */
export async function uploadMediaFiles(
  files: File[],
  options: UploadMediaFileOptions,
  onProgress?: (uploaded: number, total: number) => void
): Promise<MediaItem[]> {
  const results: MediaItem[] = [];
  const total = files.length;
  for (let i = 0; i < files.length; i++) {
    const item = await uploadMediaFile(files[i], options);
    results.push(item);
    onProgress?.(i + 1, total);
  }
  return results;
}
