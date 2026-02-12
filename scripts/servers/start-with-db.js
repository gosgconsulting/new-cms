#!/usr/bin/env node

/**
 * Startup script for the GOSG website with database connection.
 * Requires DATABASE_URL in .env (local) or Vercel environment.
 */

import 'dotenv/config';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('[testing] Starting GOSG website server...');
console.log('[testing] Database URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No');
console.log('[testing] Environment:', process.env.NODE_ENV);

// Import and run the main server
import('../../server.js').catch(error => {
  console.error('[testing] Failed to start server:', error);
  process.exit(1);
});
