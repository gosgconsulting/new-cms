import { getSequelize } from '../sequelize.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run Sequelize migrations programmatically
 * @param {string[]} migrationNames - Optional array of specific migration names to run. If not provided, runs all pending migrations.
 * @returns {Promise<void>}
 */
export async function runMigrations(migrationNames = null) {
  const sequelize = getSequelize();
  const queryInterface = sequelize.getQueryInterface();
  
  // Ensure SequelizeMeta table exists
  try {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);
  } catch (error) {
    // Table might already exist, ignore
  }

  // Get list of executed migrations
  const [executedMigrations] = await queryInterface.sequelize.query(
    'SELECT name FROM "SequelizeMeta" ORDER BY name'
  );
  const executedNames = executedMigrations.map((r) => r.name);

  // Get all migration files
  const fs = await import('fs');
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();

  // Filter migrations to run
  let migrationsToRun = migrationFiles;
  if (migrationNames && migrationNames.length > 0) {
    migrationsToRun = migrationFiles.filter(file => 
      migrationNames.includes(file) && !executedNames.includes(file)
    );
  } else {
    migrationsToRun = migrationFiles.filter(file => 
      !executedNames.includes(file)
    );
  }

  // Run each migration
  for (const migrationFile of migrationsToRun) {
    try {
      console.log(`[testing] Running migration: ${migrationFile}`);
      
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migration = await import(`file://${migrationPath}`);
      
      // Handle ES module default export
      const migrationModule = migration.default || migration;
      
      if (migrationModule && migrationModule.up) {
        await migrationModule.up(queryInterface, Sequelize);
      } else {
        throw new Error(`Migration ${migrationFile} does not export an 'up' function`);
      }

      // Record migration as executed
      await queryInterface.sequelize.query(
        `INSERT INTO "SequelizeMeta" (name) VALUES ('${migrationFile}')`
      );
      
      console.log(`[testing] Completed migration: ${migrationFile}`);
    } catch (error) {
      console.error(`[testing] Error running migration ${migrationFile}:`, error);
      throw error;
    }
  }

  if (migrationsToRun.length === 0) {
    console.log('[testing] No pending migrations to run');
  } else {
    console.log(`[testing] Successfully ran ${migrationsToRun.length} migration(s)`);
  }
}

/**
 * Check if a specific migration has been executed
 * @param {string} migrationName - Name of the migration to check
 * @returns {Promise<boolean>}
 */
export async function isMigrationExecuted(migrationName) {
  const sequelize = getSequelize();
  
  try {
    const [results] = await sequelize.query(
      `SELECT name FROM "SequelizeMeta" WHERE name = '${migrationName}'`
    );
    return results.length > 0;
  } catch (error) {
    // If SequelizeMeta table doesn't exist, no migrations have run
    if (error.message.includes('does not exist')) {
      return false;
    }
    throw error;
  }
}

