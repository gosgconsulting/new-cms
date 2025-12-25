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

// Run migrations
async function runDatabaseMigrations() {
  try {
    console.log('[testing] Starting database migrations...');
    await runMigrations();
    console.log('[testing] Database migrations completed successfully');
  } catch (error) {
    console.error('[testing] Error running migrations:', error);
    // Don't exit - allow server to start even if migrations fail
    // This allows the server to run and show errors in logs
    console.error('[testing] Continuing with server start despite migration errors');
  }
}

// Main entrypoint
async function main() {
  try {
    // Start the server FIRST so healthchecks can pass immediately
    // The server will handle database initialization in the background
    console.log('[testing] Starting production server (healthcheck will be available immediately)...');
    await import('../server/index.js');
    
    // Wait for database and run migrations in parallel (non-blocking)
    // This allows healthchecks to pass even if DB is still initializing
    waitForDatabase()
      .then(() => {
        return runDatabaseMigrations();
      })
      .then(() => {
        console.log('[testing] Database setup completed in background');
      })
      .catch((error) => {
        console.error('[testing] Database setup error (non-fatal):', error);
        // Don't exit - server continues running
      });
    
  } catch (error) {
    console.error('[testing] Fatal error in entrypoint:', error);
    process.exit(1);
  }
}

// Run entrypoint
main();

