#!/usr/bin/env node
/**
 * Docker entrypoint script that:
 * 1. Waits for database to be available
 * 2. Runs database migrations
 * 3. Starts the production server
 */

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import 'dotenv/config';
import { runMigrations } from '../sparti-cms/db/sequelize/run-migrations.js';
import { query } from '../sparti-cms/db/index.js';

// Wait for database to be available
async function waitForDatabase(maxRetries = 30, retryDelay = 2000) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    try {
      console.log(`[testing] Waiting for database connection... (attempt ${attempt}/${maxRetries})`);
      await query('SELECT 1');
      console.log('[testing] Database connection successful!');
      return true;
    } catch (error) {
      console.log(`[testing] Database not ready yet: ${error.message}`);
      if (attempt >= maxRetries) {
        console.error('[testing] Failed to connect to database after all retries');
        throw new Error('Database connection timeout');
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Run migrations with retry logic
async function runDatabaseMigrations(maxRetries = 3, retryDelay = 5000) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    try {
      console.log(`[testing] Starting database migrations... (attempt ${attempt}/${maxRetries})`);
      await runMigrations();
      console.log('[testing] Database migrations completed successfully');
      return true;
    } catch (error) {
      console.error(`[testing] Error running migrations (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt >= maxRetries) {
        console.error('[testing] All migration attempts failed');
        console.error('[testing] Continuing with server start - migrations can be run manually');
        // Don't exit - allow server to start even if migrations fail
        // This allows the server to run and show errors in logs
        return false;
      }
      
      console.log(`[testing] Retrying migrations in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return false;
}

// Wait for server to be ready (healthcheck endpoint responding)
async function waitForServerReady(maxRetries = 15, retryDelay = 2000) {
  const http = await import('http');
  const { PORT } = await import('../server/config/constants.js');
  const port = PORT || 4173;
  
  console.log(`[testing] Waiting for server to respond on port ${port}...`);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/health`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log('[testing] ✅ Server healthcheck passed!');
              resolve();
            } else {
              reject(new Error(`Healthcheck returned ${res.statusCode}: ${data}`));
            }
          });
        });
        req.on('error', (err) => {
          reject(new Error(`Connection error: ${err.message}`));
        });
        req.setTimeout(3000, () => {
          req.destroy();
          reject(new Error('Healthcheck timeout after 3s'));
        });
      });
      return true;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        console.log(`[testing] Server not ready yet: ${error.message} (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('[testing] ❌ Server healthcheck failed after all retries');
        console.error('[testing] This may indicate the server failed to start');
        // Don't exit - let Railway healthcheck handle it
        return false;
      }
    }
  }
  return false;
}

// Main entrypoint
async function main() {
  try {
    // Start the server FIRST so healthchecks can pass immediately
    // The server will handle database initialization in the background
    console.log('[testing] Starting production server (healthcheck will be available immediately)...');
    console.log('[testing] Current working directory:', process.cwd());
    console.log('[testing] Node version:', process.version);
    console.log('[testing] NODE_ENV:', process.env.NODE_ENV);
    
    // Check if dist directory exists (critical for server to work)
    const fs = await import('fs');
    const path = await import('path');
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('[testing] ERROR: dist directory does not exist!');
      console.error('[testing] Build may have failed. Check build logs.');
      // Don't exit - let server try to start anyway (it has fallback)
    } else {
      const distContents = fs.readdirSync(distPath);
      console.log(`[testing] dist directory exists with ${distContents.length} files`);
    }
    
    // Import server - this will start the server
    console.log('[testing] Importing server module...');
    try {
      await import('../server/index.js');
      console.log('[testing] Server module imported successfully');
    } catch (importError) {
      console.error('[testing] ERROR: Failed to import server module:', importError);
      console.error('[testing] Error details:', importError.message);
      console.error('[testing] Stack:', importError.stack);
      throw importError;
    }
    
    // Wait a moment for server to start listening
    console.log('[testing] Waiting for server to start listening (3 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify server is responding to healthchecks
    const serverReady = await waitForServerReady();
    
    if (serverReady) {
      console.log('[testing] ✅ Server is ready and healthcheck is passing!');
    } else {
      console.warn('[testing] ⚠️ Server healthcheck not ready, but continuing...');
      console.warn('[testing] Railway healthcheck will retry');
    }
    
    // Wait for database and run migrations in parallel (non-blocking)
    // This allows healthchecks to pass even if DB is still initializing
    waitForDatabase()
      .then(() => {
        return runDatabaseMigrations();
      })
      .then((success) => {
        if (success) {
          console.log('[testing] Database setup completed successfully in background');
        } else {
          console.warn('[testing] Database setup completed with warnings - check logs');
        }
      })
      .catch((error) => {
        console.error('[testing] Database setup error (non-fatal):', error);
        // Don't exit - server continues running
      });
    
    // Keep process alive - server/index.js already started the server
    console.log('[testing] Entrypoint complete, server should be running');
    console.log('[testing] Process will stay alive to keep server running');
    
    // Keep the process alive indefinitely
    // The server is already running from server/index.js
    // This process just needs to stay alive
    
  } catch (error) {
    console.error('[testing] ❌ Fatal error in entrypoint:', error);
    console.error('[testing] Error message:', error.message);
    console.error('[testing] Error stack:', error.stack);
    
    // Give a moment for logs to flush
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1);
  }
}

// Handle uncaught errors to prevent silent crashes
process.on('uncaughtException', (error) => {
  console.error('[testing] ❌ Uncaught Exception:', error);
  console.error('[testing] Stack:', error.stack);
  // Don't exit immediately - let Railway see the error
  setTimeout(() => process.exit(1), 5000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[testing] ❌ Unhandled Rejection at:', promise);
  console.error('[testing] Reason:', reason);
  // Don't exit immediately - let Railway see the error
  setTimeout(() => process.exit(1), 5000);
});

// Run entrypoint
main();

