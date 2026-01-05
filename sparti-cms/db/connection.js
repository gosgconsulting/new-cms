import { Pool } from 'pg';

// Get connection string from environment or use default
const getConnectionString = () => {
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  
  // Log which connection string source is being used (without exposing credentials)
  if (process.env.DATABASE_PUBLIC_URL) {
    console.log('[testing] Using DATABASE_PUBLIC_URL for connection');
  } else if (process.env.DATABASE_URL) {
    console.log('[testing] Using DATABASE_URL for connection');
  } else {
    console.error('[testing] WARNING: No DATABASE_URL or DATABASE_PUBLIC_URL found in environment variables!');
    console.error('[testing] Connection will fail. Please set DATABASE_URL or DATABASE_PUBLIC_URL.');
    throw new Error('DATABASE_URL or DATABASE_PUBLIC_URL environment variable is required');
  }
  
  // Extract host and port for logging (without exposing credentials)
  try {
    const url = new URL(connString.replace('postgresql://', 'http://'));
    console.log(`[testing] Connecting to database at ${url.hostname}:${url.port || 5432}`);
    console.log(`[testing] Database name: ${url.pathname.replace('/', '') || 'default'}`);
  } catch (e) {
    console.error('[testing] Could not parse connection string for logging:', e.message);
    console.error('[testing] Connection string format should be: postgresql://user:password@host:port/database');
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

const getPool = () => {
  if (!pool) {
    console.log('[testing] Initializing database connection pool...');
    const connInfo = getConnectionInfo();
    console.log('[testing] Connection info:', {
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
      const isLocalhost = connString.includes('localhost') || connString.includes('127.0.0.1') || connString.includes('::1');
      const useSSL = !isLocalhost || process.env.DATABASE_SSL === 'true';
      
      // Database configuration
      const dbConfig = {
        connectionString: connString,
        ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}), // Only use SSL for remote connections or if explicitly enabled
        // Connection pool settings
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
      };
      
      // Create connection pool
      pool = new Pool(dbConfig);
      
      // Test connection
      pool.on('connect', (client) => {
        console.log('[testing] Connected to PostgreSQL database');
        console.log('[testing] Connection pool active');
      });

      pool.on('error', (err) => {
        console.error('[testing] PostgreSQL connection pool error:', err);
        console.error('[testing] Pool error details:', {
          code: err.code,
          message: err.message,
          errno: err.errno,
          syscall: err.syscall
        });
        // Don't exit the process on pool errors - let individual queries handle errors
      });
      
      console.log('[testing] Database connection pool created');
    } catch (error) {
      console.error('[testing] Failed to create database connection pool:', error);
      console.error('[testing] Pool creation error details:', {
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
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    let client;
    try {
      // Get pool (lazy initialization ensures dotenv is loaded)
      const poolInstance = getPool();
      
      // Get a client from the pool with timeout
      client = await Promise.race([
        poolInstance.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
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
          console.error('[testing] Error releasing client:', releaseError);
        }
      }
      
      lastError = error;
      
      // Log detailed error information
      if (attempt === 1) {
        console.error('[testing] Query error (attempt 1):', error.message);
        if (error.code) {
          console.error('[testing] Error code:', error.code);
        }
        if (error.errno) {
          console.error('[testing] Error number:', error.errno);
        }
        if (error.syscall) {
          console.error('[testing] System call:', error.syscall);
        }
      } else {
        console.error(`[testing] Query error (attempt ${attempt}/${retries}):`, error.message);
      }
      
      // Don't retry on certain errors
      if (error.code === '42P01' || // Table doesn't exist
          error.code === '23505' || // Unique violation
          error.code === '23503') { // Foreign key violation
        throw error;
      }
      
      // For connection errors, provide helpful message
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        if (attempt === 1) {
          console.error('[testing] Database connection issue detected. Possible causes:');
          console.error('[testing]   - Database server is not running or not accessible');
          console.error('[testing]   - Network connectivity issues');
          console.error('[testing]   - Incorrect connection string or credentials');
          console.error('[testing]   - Firewall blocking the connection');
          console.error('[testing]   - Database server may be paused (Railway free tier)');
        }
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[testing] Retrying query in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  console.error('[testing] Query failed after all retries');
  console.error('[testing] Last error:', lastError.message);
  if (lastError.code === 'ECONNRESET') {
    console.error('[testing]');
    console.error('[testing] ============================================');
    console.error('[testing] DATABASE CONNECTION FAILED');
    console.error('[testing] ============================================');
    console.error('[testing] The server will continue running, but database');
    console.error('[testing] operations will fail until the connection is fixed.');
    console.error('[testing]');
    console.error('[testing] To fix this:');
    console.error('[testing] 1. Check if your database server is running');
    console.error('[testing] 2. Verify DATABASE_URL or DATABASE_PUBLIC_URL env var');
    console.error('[testing] 3. Check network connectivity');
    console.error('[testing] 4. For Railway: ensure database is not paused');
    console.error('[testing] ============================================');
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
    // Execute the entire SQL text as-is - PostgreSQL handles multi-statement SQL
    // Using a single query ensures all statements run in the same transaction context
    await client.query(sqlText);
  } catch (error) {
    // Log the error but don't fail completely - some statements might fail if objects already exist
    console.error('[testing] Error in multi-statement SQL execution:', error.message);
    // Re-throw critical errors (like connection errors)
    if (error.code && !['42P07', '42710', '23505'].includes(error.code)) {
      // 42P07 = relation already exists, 42710 = duplicate object, 23505 = unique violation
      // These are expected in idempotent migrations
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
// The pool will be created when first accessed, ensuring dotenv is loaded
export { getPool };

// Export a proxy object that lazily initializes the pool when accessed
// This ensures dotenv is loaded before the pool is created
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
    console.log('[testing] Testing database connection...');
    const poolInstance = getPool();
    const client = await poolInstance.connect();
    
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      const connectionInfo = {
        success: true,
        connected: true,
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].pg_version,
        connectionInfo: getConnectionInfo()
      };
      console.log('[testing] Connection test successful');
      return connectionInfo;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[testing] Connection test failed:', error);
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
