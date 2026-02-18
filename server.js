// Load environment variables first, before any other imports
import 'dotenv/config';

// Verify dotenv loaded correctly
if (process.env.DATABASE_URL) {
  console.log('[Server] Environment variables loaded successfully');
} else {
  console.warn('[Server] WARNING: No DATABASE_URL found in environment');
  console.warn('[Server] Make sure .env file exists and contains DATABASE_URL');
}

// Main server entry point - delegates to modular server structure
import('./server/index.js').catch((importError) => {
  console.error('[Server] CRITICAL: Failed to import server/index.js:', importError);
  process.exit(1);
});
