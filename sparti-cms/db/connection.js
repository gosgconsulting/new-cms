import { Pool } from 'pg';
import { debugLog, debugError } from '../utils/debugLogger.js';

// Get connection string from environment or use default
const getConnectionString = () => {
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  
  // Log which connection string source is being used (without exposing credentials)
  if (process.env.DATABASE_PUBLIC_URL) {
    debugLog('Using DATABASE_PUBLIC_URL for connection');
  } else if (process.env.DATABASE_URL) {
    debugLog('Using DATABASE_URL for connection');
  } else {
    debugError('WARNING: No DATABASE_URL or DATABASE_PUBLIC_URL found in environment variables!');
    debugError('Falling back to MOCK DATABASE mode so the app can run without a real DB.');
    debugError('To fix: Set DATABASE_PUBLIC_URL or DATABASE_URL in your .env file');
    debugError('Example: DATABASE_PUBLIC_URL=postgresql://user:password@host:port/database');
    // In mock mode we won't throw here; upstream handles gracefully
    return null;
  }
  
  // Extract host and port for logging (without exposing credentials)
  try {
    const url = new URL(connString.replace('postgresql://', 'http://'));
    debugLog(`Connecting to database at ${url.hostname}:${url.port || 5432}`);
    debugLog(`Database name: ${url.pathname.replace('/', '') || 'default'}`);
  } catch (e) {
    debugError('Could not parse connection string for logging:', e.message);
    debugError('Connection string format should be: postgresql://user:password@host:port/database');
  }
  
  return connString;
};

// Get connection info for diagnostics (without exposing credentials)
export function getConnectionInfo() {
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  const info = {
    hasConnectionString: !!connString,
    source: process.env.DATABASE_PUBLIC_URL ? 'DATABASE_PUBLIC_URL' : 
            (process.env.DATABASE_URL ? 'DATABASE_URL' : 'none'),
    host: null,
    port: null,
    database: null,
    user: null
  };
  
  if (connString) {
    try {
      const url = new URL(connString.replace('postgresql://', 'http://'));
      info.host = url.hostname;
      info.port = url.port || 5432;
      info.database = url.pathname.replace('/', '') || 'default';
      info.user = url.username || 'unknown';
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  return info;
}

// Lazy initialization of pool to ensure dotenv is loaded first
let pool = null;

// Determine mock mode
const isMockMode = process.env.MOCK_DATABASE === 'true' || (!process.env.DATABASE_PUBLIC_URL && !process.env.DATABASE_URL);

// Simple mock client/pool to allow app to run without real DB
class MockClient {
  async query(text, params) {
    const sql = String(text || '').trim().toLowerCase();

    // Minimal success for basic liveness checks
    if (sql.startsWith('select 1')) {
      return { rows: [{ '?column?': 1 }], rowCount: 1 };
    }

    // Return empty rows for generic selects so lists/pages render gracefully
    if (sql.startsWith('select')) {
      return { rows: [], rowCount: 0 };
    }

    // For writes or DDL, fail with a clear message
    const err = new Error('Mock database mode: write/DDL operations are not available');
    err.code = 'MOCK_DB';
    throw err;
  }
  release() {}
}

class MockPool {
  totalCount = 0;
  idleCount = 0;
  waitingCount = 0;
  on() {}
  async connect() {
    return new MockClient();
  }
  async query(text, params) {
    const client = await this.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }
}

const getPool = () => {
  if (!pool) {
    if (isMockMode) {
      debugError('MOCK DATABASE mode enabled. No DATABASE_URL found. Returning empty results for reads.');
      pool = new MockPool();
      return pool;
    }

    debugLog('Initializing database connection pool...');
    const connInfo = getConnectionInfo();
    debugLog('Connection info:', {
      source: connInfo.source,
      host: connInfo.host,
      port: connInfo.port,
      database: connInfo.database,
      user: connInfo.user
    });
    
    try {
      // Determine if we should use SSL
      // Use SSL for remote connections (Railway, cloud), but make it optional for localhost
      const connString = getConnectionString();
      if (!connString) {
        // Should not happen due to isMockMode guard above, but keep as safety
        throw new Error('No database connection string available');
      }
      const isLocalhost = connString.includes('localhost') || connString.includes('127.0.0.1') || connString.includes('::1');
      const useSSL = !isLocalhost || process.env.DATABASE_SSL === 'true';
      // Increase timeout for localhost connections to allow more time for PostgreSQL to respond
      const connectionTimeout = isLocalhost ? 30000 : 10000;
      
      // Database configuration
      const dbConfig = {
        connectionString: connString,
        ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: connectionTimeout,
      };
      
      // Create connection pool
      pool = new Pool(dbConfig);
      
      // Test connection
      pool.on('connect', (client) => {
        debugLog('Connected to PostgreSQL database');
        debugLog('Connection pool active');
      });

      pool.on('error', (err) => {
        debugError('PostgreSQL connection pool error:', err);
        debugError('Pool error details:', {
          code: err.code,
          message: err.message,
          errno: err.errno,
          syscall: err.syscall
        });
      });
      
      debugLog('Database connection pool created');
    } catch (error) {
      debugError('Failed to create database connection pool:', error);
      debugError('Pool creation error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  return pool;
};

// Helper function to execute queries with retry logic
export async function query(text, params, retries = 3) {
  let lastError;
  
  // Determine if this is a localhost connection for enhanced retry logic
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || '';
  const isLocalhost = connString.includes('localhost') || 
                     connString.includes('127.0.0.1') || 
                     connString.includes('::1');
  // Increase retries for localhost connections to handle slow startup
  const maxRetries = isLocalhost ? 5 : retries;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let client;
    try {
      // Get pool (lazy initialization ensures dotenv is loaded)
      const poolInstance = getPool();
      
      // In mock mode, just delegate
      if (isMockMode) {
        return await poolInstance.query(text, params);
      }

      // Get a client from the pool with timeout (longer for localhost)
      const connectionTimeout = isLocalhost ? 30000 : 10000;
      client = await Promise.race([
        poolInstance.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Connection timeout after ${connectionTimeout / 1000} seconds`)), connectionTimeout)
        )
      ]);
      
      const result = await client.query(text, params);
      client.release();
      return result;
    } catch (error) {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          debugError('Error releasing client:', releaseError);
        }
      }
      
      lastError = error;
      
      // Log detailed error information
      if (attempt === 1) {
        debugError('Query error (attempt 1):', error.message);
        if (error.code) {
          debugError('Error code:', error.code);
        }
        if (error.errno) {
          debugError('Error number:', error.errno);
        }
        if (error.syscall) {
          debugError('System call:', error.syscall);
        }
      } else {
        debugError(`Query error (attempt ${attempt}/${retries}):`, error.message);
      }
      
      // Don't retry on certain errors
      if (error.code === '42P01' || // Table doesn't exist
          error.code === '23505' || // Unique violation
          error.code === '23503' || // Foreign key violation
          error.code === 'MOCK_DB') { // mock write/ddl
        throw error;
      }
      
      // For connection errors, provide helpful message
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        if (attempt === 1) {
          debugError('Database connection issue detected. Possible causes:');
          if (isLocalhost) {
            debugError('  - PostgreSQL service is not running locally');
            debugError('  - PostgreSQL is starting up (may take a few seconds)');
            debugError('  - Incorrect connection string or credentials in .env');
            debugError('  - PostgreSQL is not listening on the expected port');
          } else {
            debugError('  - Database server is not running or not accessible');
            debugError('  - Network connectivity issues');
            debugError('  - Incorrect connection string or credentials');
            debugError('  - Firewall blocking the connection');
            debugError('  - Database server may be paused (Railway free tier)');
          }
        }
      }
      
      // Wait before retrying (exponential backoff, longer for localhost ECONNREFUSED)
      if (attempt < maxRetries) {
        let delay;
        if (isLocalhost && error.code === 'ECONNREFUSED') {
          // Longer delays for localhost connection refused (PostgreSQL may be starting)
          delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        } else {
          delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        }
        debugLog(`Retrying query in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  debugError('Query failed after all retries');
  debugError('Last error:', lastError.message);
  if (lastError.code === 'ECONNRESET') {
    debugError('');
    debugError('============================================');
    debugError('DATABASE CONNECTION FAILED');
    debugError('============================================');
    debugError('The server will continue running, but database');
    debugError('operations will fail until the connection is fixed.');
    debugError('');
    debugError('To fix this:');
    debugError('1. Check if your database server is running');
    debugError('2. Verify DATABASE_URL or DATABASE_PUBLIC_URL env var');
    debugError('3. Check network connectivity');
    debugError('4. For Railway: ensure database is not paused');
    debugError('============================================');
  }
  throw lastError;
}

// Helper function to execute multi-statement SQL files
// PostgreSQL's query() can handle multi-statement SQL, but we use a dedicated client
// to ensure all statements execute in the same connection context
export async function executeMultiStatementSQL(sqlText) {
  const poolInstance = getPool();
  const client = await poolInstance.connect();
  
  try {
    await client.query(sqlText);
  } catch (error) {
    debugError('Error in multi-statement SQL execution:', error.message);
    if (error.code && !['42P07', '42710', '23505', 'MOCK_DB'].includes(error.code)) {
      throw error;
    }
  } finally {
    client.release();
  }
}

// Helper function to check user tenant access
export const canUserAccessTenant = (user, tenantId) => {
  if (!user) return false;
  if (user.is_super_admin) return true;
  return user.tenant_id === tenantId;
};

// Export pool getter function (lazy initialization)
export { getPool };

// Export a proxy object that lazily initializes the pool when accessed
const poolProxy = new Proxy({}, {
  get(target, prop) {
    const poolInstance = getPool();
    return poolInstance[prop];
  }
});

// Export pool proxy as default for backward compatibility
export default poolProxy;

// Connection test function for diagnostics
export async function testConnection() {
  try {
    debugLog('Testing database connection...');
    const poolInstance = getPool();
    const client = await poolInstance.connect();
    
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      const connectionInfo = {
        success: true,
        connected: true,
        currentTime: result.rows[0]?.current_time || null,
        postgresVersion: result.rows[0]?.pg_version || (isMockMode ? 'mock' : null),
        connectionInfo: getConnectionInfo()
      };
      debugLog('Connection test successful');
      return connectionInfo;
    } finally {
      client.release();
    }
  } catch (error) {
    debugError('Connection test failed:', error);
    return {
      success: false,
      connected: false,
      error: {
        code: error.code,
        message: error.message,
        errno: error.errno,
        syscall: error.syscall
      },
      connectionInfo: getConnectionInfo()
    };
  }
}

// Get pool status for diagnostics
export function getPoolStatus() {
  if (!pool) {
    return {
      initialized: false,
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0
    };
  }
  
  return {
    initialized: true,
    totalCount: pool.totalCount || 0,
    idleCount: pool.idleCount || 0,
    waitingCount: pool.waitingCount || 0
  };
}