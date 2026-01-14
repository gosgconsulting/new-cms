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

// Helper: detect mock DB mode
export const isMockDatabaseEnabled = () => {
  return process.env.MOCK_DATABASE === 'true' || (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL);
};

// Initialize database in the background with retry logic
// Note: Database migrations should be run via Sequelize CLI (npm run sequelize:migrate)
// This function only tests the connection and initializes blog schema
export async function initializeDatabaseInBackground(maxRetries = 5, retryDelay = 5000) {
  let attempt = 0;
  
  // If mock mode, mark ready immediately so the app can function in Dyad
  if (isMockDatabaseEnabled()) {
    console.warn('[testing] Mock database mode enabled; marking DB as ready (reads return empty data).');
    setDatabaseState(true);
    return;
  }
  
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
      return; // Success - exit the retry loop
      
    } catch (error) {
      console.error(`[testing] Database connection error (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt >= maxRetries) {
        // All retries exhausted
        console.error('[testing] Failed to connect to database after all retries');
        console.error('[testing] Note: Make sure migrations are run via: npm run sequelize:migrate');
        setDatabaseState(false, error);
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

// Diagnostic function to verify users table exists
export async function verifyUsersTableExists() {
  try {
    const { query } = await import('../../sparti-cms/db/index.js');
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    return {
      exists: result.rows[0].exists,
      error: null
    };
  } catch (error) {
    return {
      exists: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
}

// Diagnostic function to test database queries
export async function testDatabaseQuery(testQuery = 'SELECT 1') {
  try {
    const { query } = await import('../../sparti-cms/db/index.js');
    const result = await query(testQuery);
    return {
      success: true,
      result: result.rows,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: {
        code: error.code,
        message: error.message,
        stack: error.stack
      }
    };
  }
}

// Get comprehensive database diagnostics
export async function getDatabaseDiagnostics() {
  const mock = isMockDatabaseEnabled();
  const diagnostics = {
    connection: {
      initialized: dbInitialized,
      error: dbInitializationError ? {
        message: dbInitializationError.message,
        code: dbInitializationError.code
      } : null
    },
    usersTable: null,
    sampleQuery: null,
    environment: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDatabasePublicUrl: !!process.env.DATABASE_PUBLIC_URL,
      connectionSource: mock
        ? 'mock'
        : (process.env.DATABASE_PUBLIC_URL ? 'DATABASE_PUBLIC_URL' : 
           (process.env.DATABASE_URL ? 'DATABASE_URL' : 'none')),
      mockMode: mock
    }
  };

  // Check users table
  const usersTableCheck = await verifyUsersTableExists();
  diagnostics.usersTable = usersTableCheck;

  // Test sample query if connection is initialized
  if (dbInitialized) {
    const queryTest = await testDatabaseQuery('SELECT 1 as test');
    diagnostics.sampleQuery = queryTest;
  }

  return diagnostics;
}