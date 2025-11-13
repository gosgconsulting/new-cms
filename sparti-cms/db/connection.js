import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_PUBLIC_URL || 
                   process.env.DATABASE_URL || 
                   'postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway',
  ssl: { rejectUnauthorized: false }, // Always use SSL with Railway
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Helper function to execute queries
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
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

// Export pool as default
export default pool;

