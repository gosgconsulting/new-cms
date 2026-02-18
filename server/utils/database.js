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
  return process.env.MOCK_DATABASE === 'true' || !process.env.DATABASE_URL;
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
  const connString = process.env.DATABASE_URL || '';
  const isLocalhost = connString.includes('localhost') || 
                     connString.includes('127.0.0.1') || 
                     connString.includes('::1');
  const connectionSource = process.env.DATABASE_URL ? 'DATABASE_URL' : 'none';
  const useSSL = !isLocalhost || process.env.DATABASE_SSL === 'true';
  
  // Extract host and port for logging (without exposing credentials)
  let hostInfo = 'unknown';
  try {
    const url = new URL(connString.replace('postgresql://', 'http://'));
    hostInfo = `${url.hostname}:${url.port || 5432}`;
  } catch (e) {
    // Ignore parsing errors
  }
  
  while (attempt < maxRetries) {
    attempt++;
    try {
      // Test connection first with a simple query
      const { query } = await import('../../sparti-cms/db/index.js');
      await query('SELECT 1');
      
      setDatabaseState(true);
      return; // Success - exit the retry loop
      
    } catch (error) {
      if (attempt >= maxRetries) {
        // All retries exhausted
        console.error('Failed to connect to database after all retries');
        console.error('Error:', error.message);
        if (isLocalhost && error.code === 'ECONNREFUSED') {
          console.error('Localhost connection refused - verify PostgreSQL is running');
        }
        setDatabaseState(false, error);
        return;
      }
      
      // Wait before retrying (longer delay for localhost ECONNREFUSED)
      let delay = retryDelay;
      if (isLocalhost && error.code === 'ECONNREFUSED') {
        delay = Math.min(retryDelay * 1.5, 10000); // Longer delay for localhost
      }
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
      connectionSource: mock ? 'mock' : (process.env.DATABASE_URL ? 'DATABASE_URL' : 'none'),
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