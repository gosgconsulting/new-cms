/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Allow NULL tenant_id for master pages
 * 
 * This migration updates pages table to allow NULL tenant_id
 * for master/shared pages (Header, Footer) that are accessible to all tenants.
 */
export default {
  async up(queryInterface, Sequelize) {
    const pagesTable = await queryInterface.describeTable('pages').catch(() => null);
    if (pagesTable && pagesTable.tenant_id) {
      // Check if column already allows NULL
      const [columnInfo] = await queryInterface.sequelize.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'tenant_id'
      `);
      
      if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
        // Remove the NOT NULL constraint
        await queryInterface.sequelize.query(`
          ALTER TABLE pages 
          ALTER COLUMN tenant_id DROP NOT NULL;
        `);
        
        console.log('[migration] Updated pages.tenant_id to allow NULL for master pages');
      }
      
      // Update unique constraint to handle NULL properly
      // Drop existing constraint if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE pages 
          DROP CONSTRAINT IF EXISTS unique_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] No existing unique constraint to remove');
      }
      
      // Create unique index that handles NULL properly
      // Using COALESCE to treat NULL as empty string for uniqueness
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_page_slug_per_tenant 
        ON pages (slug, COALESCE(tenant_id, ''))
      `).catch((err) => {
        console.log('[migration] Note: unique index may already exist:', err.message);
      });
      
      console.log('[migration] Migration complete: pages now support NULL tenant_id for master pages');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert: Set tenant_id back to NOT NULL
    // Note: This will fail if there are any NULL values
    
    const pagesTable = await queryInterface.describeTable('pages').catch(() => null);
    if (pagesTable && pagesTable.tenant_id) {
      // First, set any NULL values to a default tenant
      await queryInterface.sequelize.query(`
        UPDATE pages 
        SET tenant_id = 'tenant-gosg' 
        WHERE tenant_id IS NULL
      `).catch(() => {
        console.log('[migration] No NULL values to update in pages');
      });
      
      // Restore NOT NULL constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE pages 
        ALTER COLUMN tenant_id SET NOT NULL;
      `);
    }
  }
};

