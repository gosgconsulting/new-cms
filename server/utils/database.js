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
// Note: Database migrations should be run via Sequelize CLI (npm run sequelize:migrate)
// This function only tests the connection and initializes blog schema
export async function initializeDatabaseInBackground(maxRetries = 5, retryDelay = 5000) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    try {
      console.log(`[testing] Testing database connection... (attempt ${attempt}/${maxRetries})`);
      
      // Test connection first with a simple query
      const { query } = await import('../../sparti-cms/db/index.js');
      await query('SELECT 1');
      console.log('[testing] Database connection test successful');
      
      // Initialize blog schema for default tenant
      // await ensureBlogSchemaInitialized('tenant-gosg');
      
      setDatabaseState(true);
      // console.log('[testing] Database connection verified and blog schema initialized');
      return; // Success - exit the retry loop
      
    } catch (error) {
      console.error(`[testing] Database connection error (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt >= maxRetries) {
        // All retries exhausted
        console.error('[testing] Failed to connect to database after all retries');
        console.error('[testing] Note: Make sure migrations are run via: npm run sequelize:migrate');
        setDatabaseState(false, error);
        // Don't exit - allow server to continue running
        // API endpoints that need DB will handle errors gracefully
        return;
      }
      
      // Wait before retrying
      console.log(`[testing] Retrying database connection in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Exponential backoff for subsequent retries
      retryDelay = Math.min(retryDelay * 1.5, 30000); // Cap at 30 seconds
    }
  }
}

