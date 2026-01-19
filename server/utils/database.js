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
  
  // Log connection details for diagnostics
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || '';
  const isLocalhost = connString.includes('localhost') || 
                     connString.includes('127.0.0.1') || 
                     connString.includes('::1');
  const connectionSource = process.env.DATABASE_PUBLIC_URL ? 'DATABASE_PUBLIC_URL' : 
                           (process.env.DATABASE_URL ? 'DATABASE_URL' : 'none');
  const useSSL = !isLocalhost || process.env.DATABASE_SSL === 'true';
  
  // Extract host and port for logging (without exposing credentials)
  let hostInfo = 'unknown';
  try {
    const url = new URL(connString.replace('postgresql://', 'http://'));
    hostInfo = `${url.hostname}:${url.port || 5432}`;
  } catch (e) {
    // Ignore parsing errors
  }
  
  console.log('[testing] ========== DATABASE INITIALIZATION ==========');
  console.log(`[testing] Connection source: ${connectionSource}`);
  console.log(`[testing] Host: ${hostInfo}`);
  console.log(`[testing] Connection type: ${isLocalhost ? 'localhost' : 'remote'}`);
  console.log(`[testing] SSL enabled: ${useSSL}`);
  if (isLocalhost) {
    console.log('[testing] Localhost connection detected - using extended timeout and retry logic');
  }
  console.log('[testing] ===========================================');
  
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
      console.log('[testing] Database initialization completed successfully');
      return; // Success - exit the retry loop
      
    } catch (error) {
      console.error(`[testing] Database connection error (attempt ${attempt}/${maxRetries}):`, error.message);
      console.error(`[testing] Error code: ${error.code || 'N/A'}`);
      
      if (isLocalhost && error.code === 'ECONNREFUSED') {
        console.error('[testing] Localhost connection refused - possible causes:');
        console.error('[testing]   - PostgreSQL service is not running');
        console.error('[testing]   - PostgreSQL is starting up (wait a few seconds)');
        console.error('[testing]   - Incorrect port in connection string');
        console.error('[testing]   - PostgreSQL is not configured to accept connections');
      }
      
      if (attempt >= maxRetries) {
        // All retries exhausted
        console.error('[testing] ========== DATABASE INITIALIZATION FAILED ==========');
        console.error('[testing] Failed to connect to database after all retries');
        console.error('[testing] Note: Make sure migrations are run via: npm run sequelize:migrate');
        if (isLocalhost) {
          console.error('[testing]');
          console.error('[testing] For localhost connections, verify:');
          console.error('[testing]   1. PostgreSQL service is running');
          console.error('[testing]   2. Connection string in .env is correct');
          console.error('[testing]   3. Credentials are correct');
          console.error('[testing]   4. PostgreSQL is listening on the expected port');
        }
        console.error('[testing] ====================================================');
        setDatabaseState(false, error);
        return;
      }
      
      // Wait before retrying (longer delay for localhost ECONNREFUSED)
      let delay = retryDelay;
      if (isLocalhost && error.code === 'ECONNREFUSED') {
        delay = Math.min(retryDelay * 1.5, 10000); // Longer delay for localhost
      }
      console.log(`[testing] Retrying database connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
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