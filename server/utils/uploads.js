import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get uploads directory path
export const getUploadsDir = () => {
  const uploadsDir = join(__dirname, '..', '..', 'public', 'uploads');
  return uploadsDir;
};

// Ensure uploads directory exists (no-op on Vercel when using Blob storage)
export const ensureUploadsDir = () => {
  if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }
  const uploadsDir = getUploadsDir();
  console.log(`[Uploads Directory] The upload directory is located at: ${uploadsDir}`);
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
    console.log('[testing] Created uploads directory:', uploadsDir);
  }
  return uploadsDir;
};

