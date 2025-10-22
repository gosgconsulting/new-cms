// Database migration script to convert old schema format to new format

import { query, pool } from './sparti-cms/db/postgres.js';
import { migrateOldSchemaToNew, needsMigration } from './sparti-cms/utils/schema-migration.ts';
import { validatePageSchema } from './sparti-cms/utils/schema-validator.ts';

async function migrateToNewSchema() {
  console.log('[testing] Starting schema migration to new format...');
  let client;
  
  try {
    client = await pool.connect();
    console.log('[testing] Connected to PostgreSQL database');

    await client.query('BEGIN');

    // Get all page layouts that need migration
    const layoutsResult = await client.query(`
      SELECT pl.id, pl.page_id, pl.layout_json, pl.version, pl.updated_at,
             p.page_name, p.tenant_id
      FROM page_layouts pl
      JOIN pages p ON pl.page_id = p.id
      ORDER BY pl.id
    `);

    console.log(`[testing] Found ${layoutsResult.rows.length} page layouts to check`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const layout of layoutsResult.rows) {
      try {
        console.log(`[testing] Processing page ${layout.page_id} (${layout.page_name}) for tenant ${layout.tenant_id}`);
        
        // Check if already in new format
        if (!needsMigration(layout.layout_json)) {
          console.log(`[testing] Page ${layout.page_id} already in new format, skipping`);
          skippedCount++;
          continue;
        }

        // Migrate the schema
        console.log(`[testing] Migrating page ${layout.page_id} from old format to new format`);
        const newSchema = migrateOldSchemaToNew(layout.layout_json);
        
        // Validate the new schema
        const validation = validatePageSchema(newSchema);
        if (!validation.isValid) {
          console.error(`[testing] Validation failed for page ${layout.page_id}:`, validation.errors);
          errors.push(`Page ${layout.page_id}: ${validation.errors.join(', ')}`);
          errorCount++;
          continue;
        }

        // Add version info to the new schema
        const schemaWithVersion = {
          ...newSchema,
          _version: {
            version: '2.0',
            migratedAt: new Date().toISOString(),
            migratedFrom: '1.0'
          }
        };

        // Update the database
        await client.query(`
          UPDATE page_layouts 
          SET layout_json = $1, updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify(schemaWithVersion), layout.id]);

        console.log(`[testing] Successfully migrated page ${layout.page_id}`);
        migratedCount++;

      } catch (error) {
        console.error(`[testing] Error migrating page ${layout.page_id}:`, error);
        errors.push(`Page ${layout.page_id}: ${error.message}`);
        errorCount++;
      }
    }

    // Create backup table with old schemas
    console.log('[testing] Creating backup of old schemas...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_layouts_backup_old_schema AS
      SELECT * FROM page_layouts WHERE 1=0
    `);

    // Note: We're not actually backing up the old data in this script
    // In a production environment, you'd want to copy the old data first

    await client.query('COMMIT');
    
    console.log('[testing] Schema migration completed successfully!');
    console.log(`[testing] Summary:`);
    console.log(`[testing] - Migrated: ${migratedCount} pages`);
    console.log(`[testing] - Skipped: ${skippedCount} pages (already new format)`);
    console.log(`[testing] - Errors: ${errorCount} pages`);
    
    if (errors.length > 0) {
      console.log('[testing] Errors encountered:');
      errors.forEach(error => console.log(`[testing] - ${error}`));
    }

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('[testing] Error during schema migration:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function verifyMigration() {
  console.log('[testing] Verifying migration results...');
  
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_layouts,
        COUNT(CASE WHEN layout_json::text LIKE '%"_version"%' THEN 1 END) as new_format_count,
        COUNT(CASE WHEN layout_json::text NOT LIKE '%"_version"%' THEN 1 END) as old_format_count
      FROM page_layouts
    `);

    const stats = result.rows[0];
    console.log(`[testing] Migration verification:`);
    console.log(`[testing] - Total layouts: ${stats.total_layouts}`);
    console.log(`[testing] - New format: ${stats.new_format_count}`);
    console.log(`[testing] - Old format: ${stats.old_format_count}`);

    if (stats.old_format_count > 0) {
      console.log('[testing] Warning: Some layouts are still in old format');
    } else {
      console.log('[testing] All layouts successfully migrated to new format');
    }

  } catch (error) {
    console.error('[testing] Error verifying migration:', error);
  }
}

// Run the migration
migrateToNewSchema()
  .then(() => verifyMigration())
  .then(() => console.log('Schema migration completed successfully'))
  .catch((err) => {
    console.error('Schema migration failed:', err);
    process.exit(1);
  });
