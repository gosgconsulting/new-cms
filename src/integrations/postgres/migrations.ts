import { query } from './client';

// Create a migrations table if it doesn't exist
export async function initializeMigrationsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Migrations table initialized');
  } catch (error) {
    console.error('Error initializing migrations table:', error);
    throw error;
  }
}

// Check if a migration has been applied
export async function hasMigrationBeenApplied(migrationName: string) {
  try {
    const result = await query(
      'SELECT COUNT(*) FROM migrations WHERE name = $1',
      [migrationName]
    );
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error(`Error checking if migration ${migrationName} has been applied:`, error);
    throw error;
  }
}

// Record that a migration has been applied
export async function recordMigration(migrationName: string) {
  try {
    await query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [migrationName]
    );
    console.log(`Migration ${migrationName} recorded`);
  } catch (error) {
    console.error(`Error recording migration ${migrationName}:`, error);
    throw error;
  }
}

// Apply a migration if it hasn't been applied yet
export async function applyMigration(migrationName: string, migrationFunction: () => Promise<void>) {
  try {
    // Initialize migrations table if it doesn't exist
    await initializeMigrationsTable();
    
    // Check if migration has already been applied
    const migrationApplied = await hasMigrationBeenApplied(migrationName);
    
    if (migrationApplied) {
      console.log(`Migration ${migrationName} has already been applied, skipping...`);
      return;
    }
    
    // Apply the migration
    console.log(`Applying migration ${migrationName}...`);
    await migrationFunction();
    
    // Record that the migration has been applied
    await recordMigration(migrationName);
    
    console.log(`Migration ${migrationName} applied successfully`);
  } catch (error) {
    console.error(`Error applying migration ${migrationName}:`, error);
    throw error;
  }
}

// Run all migrations in order
export async function runMigrations(migrations: { name: string; up: () => Promise<void> }[]) {
  try {
    console.log('Running migrations...');
    
    for (const migration of migrations) {
      await applyMigration(migration.name, migration.up);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}
