import 'dotenv/config';
import pool from '../../sparti-cms/db/postgres.js';

/**
 * Script to fix slug uniqueness to be per-tenant instead of global
 */
async function fixSlugUniqueness() {
  console.log('[testing] Fixing slug uniqueness constraints...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop existing unique constraints on slug columns
    console.log('[testing] Dropping existing unique constraints...');
    
    // Check if constraints exist before dropping
    const pagesConstraint = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'pages' AND constraint_name = 'pages_slug_key'
    `);
    
    if (pagesConstraint.rows.length > 0) {
      await client.query('ALTER TABLE pages DROP CONSTRAINT pages_slug_key');
      console.log('[testing] Dropped pages_slug_key constraint');
    }
    
    const landingConstraint = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'landing_pages' AND constraint_name = 'landing_pages_slug_key'
    `);
    
    if (landingConstraint.rows.length > 0) {
      await client.query('ALTER TABLE landing_pages DROP CONSTRAINT landing_pages_slug_key');
      console.log('[testing] Dropped landing_pages_slug_key constraint');
    }
    
    const legalConstraint = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'legal_pages' AND constraint_name = 'legal_pages_slug_key'
    `);
    
    if (legalConstraint.rows.length > 0) {
      await client.query('ALTER TABLE legal_pages DROP CONSTRAINT legal_pages_slug_key');
      console.log('[testing] Dropped legal_pages_slug_key constraint');
    }
    
    // Create new unique constraints that include tenant_id
    console.log('[testing] Creating new tenant-aware unique constraints...');
    
    await client.query(`
      ALTER TABLE pages 
      ADD CONSTRAINT pages_slug_tenant_unique 
      UNIQUE (slug, tenant_id)
    `);
    
    await client.query(`
      ALTER TABLE landing_pages 
      ADD CONSTRAINT landing_pages_slug_tenant_unique 
      UNIQUE (slug, tenant_id)
    `);
    
    await client.query(`
      ALTER TABLE legal_pages 
      ADD CONSTRAINT legal_pages_slug_tenant_unique 
      UNIQUE (slug, tenant_id)
    `);
    
    console.log('[testing] Created new tenant-aware unique constraints');
    
    await client.query('COMMIT');
    console.log('[testing] Slug uniqueness constraints fixed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[testing] Error fixing slug uniqueness:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run fix if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  fixSlugUniqueness()
    .then(() => {
      console.log('Slug uniqueness fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Slug uniqueness fix failed:', error);
      process.exit(1);
    });
}

export default fixSlugUniqueness;
