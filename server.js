// Load environment variables first, before any other imports
import 'dotenv/config';

// Verify dotenv loaded correctly
if (process.env.DATABASE_URL) {
  console.log('[testing] dotenv loaded successfully - DATABASE_URL is set');
} else {
  console.log('[testing] WARNING: dotenv loaded but DATABASE_URL is not set');
  console.log('[testing] Make sure .env file exists and contains DATABASE_URL');
}

// Main server entry point - delegates to modular server structure
import './server/index.js';
