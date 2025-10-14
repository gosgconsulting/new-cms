import { Pool } from 'pg';

// Load environment variables from Railway
const databaseUrl = import.meta.env.VITE_DATABASE_PUBLIC_URL || process.env.DATABASE_PUBLIC_URL;

if (!databaseUrl) {
  console.error('DATABASE_PUBLIC_URL environment variable is not set');
}

// Create a new PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Railway PostgreSQL
  }
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  } else {
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

// Helper function to execute SQL queries
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Export the pool for direct use if needed
export default pool;
