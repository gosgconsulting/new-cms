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
    console.log('[testing] Using default connection string');
  }
  
  // Extract host and port for logging (without exposing credentials)
  try {
    const url = new URL(connString.replace('postgresql://', 'http://'));
    console.log(`[testing] Connecting to database at ${url.hostname}:${url.port || 5432}`);
  } catch (e) {
    console.log('[testing] Could not parse connection string for logging');
  }
  
  return connString;
};

// Lazy initialization of pool to ensure dotenv is loaded first
let pool = null;

const getPool = () => {
  if (!pool) {
    // Database configuration
    const dbConfig = {
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false }, // Always use SSL with Railway
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    };
    
    // Create connection pool
    pool = new Pool(dbConfig);
    
    // Test connection
    pool.on('connect', () => {
      console.log('[testing] Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
      console.error('[testing] PostgreSQL connection pool error:', err);
      // Don't exit the process on pool errors - let individual queries handle errors
    });
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
