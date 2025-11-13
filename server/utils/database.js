import { initializeDatabase } from '../../sparti-cms/db/index.js';
import { ensureBlogSchemaInitialized } from '../../sparti-cms/db/scripts/init-blog.js';

// Track database initialization state
let dbInitialized = false;
let dbInitializationError = null;

// Get database state (for use in middleware)
export const getDatabaseState = () => ({
  dbInitialized,
  dbInitializationError
});

// Set database state (for use in initialization)
export const setDatabaseState = (initialized, error = null) => {
  dbInitialized = initialized;
  dbInitializationError = error;
};

// Initialize database in the background with retry logic
export async function initializeDatabaseInBackground(maxRetries = 5, retryDelay = 5000) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    try {
      console.log(`[testing] Initializing database... (attempt ${attempt}/${maxRetries})`);
      
      // Test connection first with a simple query
      const { query } = await import('../../sparti-cms/db/index.js');
      await query('SELECT 1');
      console.log('[testing] Database connection test successful');
      
      const dbSuccess = await initializeDatabase();
      
      if (!dbSuccess) {
        throw new Error('Database initialization returned false');
      }
      
      console.log('[testing] Database initialized successfully');
      
      // Initialize blog schema for default tenant
      await ensureBlogSchemaInitialized('tenant-gosg');
      
      setDatabaseState(true);
      console.log('[testing] Database fully initialized and ready');
      return; // Success - exit the retry loop
      
    } catch (error) {
      console.error(`[testing] Database initialization error (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt >= maxRetries) {
        // All retries exhausted
        console.error('[testing] Failed to initialize database after all retries');
        setDatabaseState(false, error);
        // Don't exit - allow server to continue running
        // API endpoints that need DB will handle errors gracefully
        return;
      }
      
      // Wait before retrying
      console.log(`[testing] Retrying database initialization in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Exponential backoff for subsequent retries
      retryDelay = Math.min(retryDelay * 1.5, 30000); // Cap at 30 seconds
    }
  }
}

