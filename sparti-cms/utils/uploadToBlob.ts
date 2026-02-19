/**
 * Client-side upload to Vercel Blob via handleUpload token exchange.
 * Uses @vercel/blob/client upload(); requires POST /api/blob-upload on the server.
 */

import { upload } from '@vercel/blob/client';
import api from './api';

export interface UploadFileOptions {
  /** Optional tenant ID for path prefix and server validation */
  tenantId?: string;
}

/**
 * Get JWT from session for clientPayload (server validates in onBeforeGenerateToken).
 */
function getAuthToken(): string | null {
  const session = localStorage.getItem('sparti-user-session');
  if (!session) return null;
  try {
    const userData = JSON.parse(session);
    return userData.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Upload a file to Vercel Blob using the client SDK.
 * Files are stored under upload/{tenantId}/{filename}.ext (tenantId from options; default "default" if omitted).
 * Auth and tenantId are sent via clientPayload; server validates before issuing token.
 *
 * @param file - File to upload
 * @param options - Optional tenantId for path prefix (uploads/{tenantId}/file-name.ext)
 * @returns Promise<{ url: string }> - Public URL of the uploaded blob
 * @throws On upload or token exchange failure
 */
export async function uploadFile(
  file: File,
  options?: UploadFileOptions
): Promise<{ url: string }> {
  const baseUrl = api.getBaseUrl();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const handleUploadUrl = baseUrl ? `${baseUrl}/api/blob-upload` : '/api/blob-upload';
  const absoluteHandleUploadUrl = handleUploadUrl.startsWith('http')
    ? handleUploadUrl
    : `${origin}${handleUploadUrl.startsWith('/') ? '' : '/'}${handleUploadUrl}`;

  const token = getAuthToken();
  const clientPayload = JSON.stringify({
    token: token ?? undefined,
    tenantId: options?.tenantId ?? undefined,
  });

  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: absoluteHandleUploadUrl,
    clientPayload,
  });

  let url = blob.url;
  if (url && !url.startsWith('http')) {
    url = `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return { url };
}
