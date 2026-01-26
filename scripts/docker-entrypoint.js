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
      await query('SELECT 1');
      return true;
    } catch (error) {
      if (attempt >= maxRetries) {
        console.error('Failed to connect to database after all retries');
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
      await runMigrations();
      return true;
    } catch (error) {
      if (attempt >= maxRetries) {
        console.error('Database migrations failed - continuing with server start');
        return false;
      }
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
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/health`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
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
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('Server healthcheck failed after all retries');
        return false;
      }
    }
  }
  return false;
}

// Main entrypoint
async function main() {
  try {
    // Check if dist directory exists (critical for server to work)
    const fs = await import('fs');
    const path = await import('path');
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('ERROR: dist directory does not exist! Build may have failed.');
    }
    
    // Import server - this will start the server
    let serverModule;
    try {
      serverModule = await import('../server/index.js');
    } catch (importError) {
      console.error('ERROR: Failed to import server module');
      console.error('Error:', importError.message);
      if (importError.code === 'MODULE_NOT_FOUND') {
        console.error('Module resolution error - check that all dependencies are installed');
      }
      throw importError;
    }
    
    // Wait a moment for server to start listening
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify server is responding to healthchecks
    const serverReady = await waitForServerReady();
    
    if (!serverReady) {
      console.warn('Server healthcheck not ready, but continuing...');
    }
    
    // Wait for database and run migrations in parallel (non-blocking)
    // This allows healthchecks to pass even if DB is still initializing
    waitForDatabase()
      .then(() => {
        return runDatabaseMigrations();
      })
      .catch((error) => {
        console.error('Database setup error (non-fatal):', error.message);
        // Don't exit - server continues running
      });
    
  } catch (error) {
    console.error('Fatal error in entrypoint:', error.message);
    console.error('Error stack:', error.stack);
    
    // Give a moment for logs to flush
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1);
  }
}

// Handle uncaught errors to prevent silent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  setTimeout(() => process.exit(1), 5000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  setTimeout(() => process.exit(1), 5000);
});

// Run entrypoint
main();

