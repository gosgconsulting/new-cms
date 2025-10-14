import { runAllMigrations } from './migrations';

// Initialize the database
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await runAllMigrations();
    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Export a function to initialize the database on application startup
export default initializeDatabase;
