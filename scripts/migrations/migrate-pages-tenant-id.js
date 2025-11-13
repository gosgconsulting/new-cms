import 'dotenv/config';
import pool from '../../sparti-cms/db/index.js';

/**
 * Migration script to add tenant_id columns to pages tables
 * and migrate existing data to the default tenant
 */
async function migratePagesTenantId() {
  console.log('[testing] Starting pages tenant_id migration...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add tenant_id column to pages table
    console.log('[testing] Adding tenant_id column to pages table...');
    await client.query(`
      ALTER TABLE pages 
      ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255) DEFAULT 'tenant-gosg'
    `);
    
    // Add tenant_id column to landing_pages table
    console.log('[testing] Adding tenant_id column to landing_pages table...');
    await client.query(`
      ALTER TABLE landing_pages 
      ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255) DEFAULT 'tenant-gosg'
    `);
    
    // Add tenant_id column to legal_pages table
    console.log('[testing] Adding tenant_id column to legal_pages table...');
    await client.query(`
      ALTER TABLE legal_pages 
      ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255) DEFAULT 'tenant-gosg'
    `);
    
    // Update existing pages to have the default tenant_id
    console.log('[testing] Updating existing pages with default tenant_id...');
    await client.query(`
      UPDATE pages 
      SET tenant_id = 'tenant-gosg' 
      WHERE tenant_id IS NULL OR tenant_id = ''
    `);
    
    await client.query(`
      UPDATE landing_pages 
      SET tenant_id = 'tenant-gosg' 
      WHERE tenant_id IS NULL OR tenant_id = ''
    `);
    
    await client.query(`
      UPDATE legal_pages 
      SET tenant_id = 'tenant-gosg' 
      WHERE tenant_id IS NULL OR tenant_id = ''
    `);
    
    // Add foreign key constraints
    console.log('[testing] Adding foreign key constraints...');
    await client.query(`
      ALTER TABLE pages 
      ADD CONSTRAINT fk_pages_tenant_id 
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    `);
    
    await client.query(`
      ALTER TABLE landing_pages 
      ADD CONSTRAINT fk_landing_pages_tenant_id 
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    `);
    
    await client.query(`
      ALTER TABLE legal_pages 
      ADD CONSTRAINT fk_legal_pages_tenant_id 
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    `);
    
    // Create indexes for better performance
    console.log('[testing] Creating indexes for tenant_id columns...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_tenant_id ON pages(tenant_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_landing_pages_tenant_id ON landing_pages(tenant_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_legal_pages_tenant_id ON legal_pages(tenant_id)
    `);
    
    await client.query('COMMIT');
    console.log('[testing] Pages tenant_id migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[testing] Error during pages tenant_id migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  migratePagesTenantId()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migratePagesTenantId;
