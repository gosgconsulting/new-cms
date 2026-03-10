/**
 * Check and fix site_settings table schema
 * This script verifies that all required columns exist and creates them if missing
 */

import { query } from '../index.js';

async function checkAndFixSchema() {
  try {
    console.log('[schema-check] Checking site_settings table schema...');
    
    // Check if table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('[schema-check] Creating site_settings table...');
      await query(`
        CREATE TABLE site_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(255) NOT NULL,
          setting_value TEXT,
          setting_type VARCHAR(50) DEFAULT 'text',
          setting_category VARCHAR(100) DEFAULT 'general',
          is_public BOOLEAN DEFAULT false,
          tenant_id VARCHAR(255),
          theme_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('[schema-check] ✓ Table created');
    } else {
      console.log('[schema-check] ✓ Table exists');
    }
    
    // Check and add missing columns
    const requiredColumns = [
      { name: 'tenant_id', type: 'VARCHAR(255)', nullable: true },
      { name: 'theme_id', type: 'VARCHAR(255)', nullable: true },
      { name: 'setting_category', type: 'VARCHAR(100)', nullable: false, default: "'general'" },
      { name: 'is_public', type: 'BOOLEAN', nullable: false, default: 'false' }
    ];
    
    for (const col of requiredColumns) {
      const columnExists = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'site_settings' 
          AND column_name = $1
        )
      `, [col.name]);
      
      if (!columnExists.rows[0].exists) {
        console.log(`[schema-check] Adding missing column: ${col.name}...`);
        let alterQuery = `ALTER TABLE site_settings ADD COLUMN ${col.name} ${col.type}`;
        if (!col.nullable) {
          alterQuery += ' NOT NULL';
        }
        if (col.default) {
          alterQuery += ` DEFAULT ${col.default}`;
        }
        await query(alterQuery);
        console.log(`[schema-check] ✓ Column ${col.name} added`);
      } else {
        console.log(`[schema-check] ✓ Column ${col.name} exists`);
      }
    }
    
    // Check and create indexes
    const indexes = [
      { name: 'idx_site_settings_tenant_theme', columns: '(tenant_id, theme_id)' },
      { name: 'idx_site_settings_theme_id', columns: '(theme_id)' },
      { name: 'idx_site_settings_category', columns: '(setting_category)' }
    ];
    
    for (const idx of indexes) {
      const indexExists = await query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE tablename = 'site_settings' 
          AND indexname = $1
        )
      `, [idx.name]);
      
      if (!indexExists.rows[0].exists) {
        console.log(`[schema-check] Creating index: ${idx.name}...`);
        await query(`CREATE INDEX ${idx.name} ON site_settings ${idx.columns}`);
        console.log(`[schema-check] ✓ Index ${idx.name} created`);
      } else {
        console.log(`[schema-check] ✓ Index ${idx.name} exists`);
      }
    }
    
    // Check and update unique index (COALESCE-based)
    const indexExists = await query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = 'site_settings_setting_key_tenant_theme_unique'
      )
    `);
    
    if (!indexExists.rows[0].exists) {
      console.log('[schema-check] Creating unique index with COALESCE...');
      // Drop old constraints/indexes if they exist
      try {
        await query(`ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_key`);
        await query(`ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_tenant_id_key`);
        await query(`ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_tenant_id_theme_id_key`);
        await query(`DROP INDEX IF EXISTS site_settings_setting_key_tenant_theme_unique`);
      } catch (e) {
        // Ignore if doesn't exist
      }
      
      await query(`
        CREATE UNIQUE INDEX site_settings_setting_key_tenant_theme_unique 
        ON site_settings (setting_key, COALESCE(tenant_id, ''), COALESCE(theme_id, ''))
      `);
      console.log('[schema-check] ✓ Unique index created');
    } else {
      console.log('[schema-check] ✓ Unique index exists');
    }
    
    // Note: We do NOT update NULL tenant_id values
    // NULL tenant_id represents master settings (shared across all tenants)
    // This is intentional and should be preserved
    const nullTenantCount = await query(`
      SELECT COUNT(*) as count 
      FROM site_settings 
      WHERE tenant_id IS NULL
    `);
    
    if (parseInt(nullTenantCount.rows[0].count) > 0) {
      console.log(`[schema-check] Note: ${nullTenantCount.rows[0].count} master settings (tenant_id = NULL) found - these are preserved as shared settings`);
    }
    
    console.log('\n[schema-check] ✓ Schema check completed successfully!');
    console.log('[schema-check] The site_settings table is ready for theme styles.\n');
    
    // Show final table structure
    const finalStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'site_settings'
      ORDER BY ordinal_position
    `);
    
    console.log('[schema-check] Final table structure:');
    console.table(finalStructure.rows);
    
  } catch (error) {
    console.error('[schema-check] ✗ Schema check failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAndFixSchema()
    .then(() => {
      console.log('[schema-check] Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[schema-check] Failed:', error);
      process.exit(1);
    });
}

export default checkAndFixSchema;


