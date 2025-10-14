import pool, { query } from './client';
import initializeDatabase from './init';

// Export all PostgreSQL related functions and objects
export {
  pool,
  query,
  initializeDatabase,
};

// Default export for convenience
export default {
  pool,
  query,
  initializeDatabase,
};
