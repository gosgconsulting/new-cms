import { runMigrations } from '../migrations';
import * as createFormSubmissionsTable from './01_create_form_submissions_table';

// List all migrations in order
const migrations = [
  {
    name: createFormSubmissionsTable.name,
    up: createFormSubmissionsTable.up,
    down: createFormSubmissionsTable.down,
  },
  // Add more migrations here as needed
];

// Function to run all migrations
export async function runAllMigrations() {
  try {
    await runMigrations(migrations);
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }
}

// Export individual migrations for direct access if needed
export {
  createFormSubmissionsTable,
};
