/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Allow NULL tenant_id for master records
 * 
 * This migration updates categories and tags tables to allow NULL tenant_id
 * for master/shared records that are accessible to all tenants.
 * 
 * Master records (tenant_id = NULL) are shared across all tenants.
 * Tenant-specific records (tenant_id = specific_tenant) override master data.
 */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Update categories table to allow NULL tenant_id
    const categoriesTable = await queryInterface.describeTable('categories').catch(() => null);
    if (categoriesTable && categoriesTable.tenant_id) {
      // Check if column already allows NULL
      const [columnInfo] = await queryInterface.sequelize.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'tenant_id'
      `);
      
      if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
        // Remove the NOT NULL constraint and default value
        await queryInterface.sequelize.query(`
          ALTER TABLE categories 
          ALTER COLUMN tenant_id DROP NOT NULL,
          ALTER COLUMN tenant_id DROP DEFAULT;
        `);
        
        console.log('[migration] Updated categories.tenant_id to allow NULL for master records');
      }
      
      // Update unique constraint to handle NULL properly
      // PostgreSQL treats NULL as distinct, but we want to ensure proper uniqueness
      // Drop existing constraint if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE categories 
          DROP CONSTRAINT IF EXISTS unique_category_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] No existing unique constraint to remove');
      }
      
      // Create unique index that handles NULL properly
      // Using COALESCE to treat NULL as empty string for uniqueness
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_category_slug_per_tenant 
        ON categories (slug, COALESCE(tenant_id, ''))
      `).catch((err) => {
        console.log('[migration] Note: unique index may already exist:', err.message);
      });
    }

    // 2. Update tags table to allow NULL tenant_id
    const tagsTable = await queryInterface.describeTable('tags').catch(() => null);
    if (tagsTable && tagsTable.tenant_id) {
      // Check if column already allows NULL
      const [columnInfo] = await queryInterface.sequelize.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'tags' 
        AND column_name = 'tenant_id'
      `);
      
      if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
        // Remove the NOT NULL constraint and default value
        await queryInterface.sequelize.query(`
          ALTER TABLE tags 
          ALTER COLUMN tenant_id DROP NOT NULL,
          ALTER COLUMN tenant_id DROP DEFAULT;
        `);
        
        console.log('[migration] Updated tags.tenant_id to allow NULL for master records');
      }
      
      // Update unique constraint to handle NULL properly
      // Drop existing constraint if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE tags 
          DROP CONSTRAINT IF EXISTS unique_tag_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] No existing unique constraint to remove');
      }
      
      // Create unique index that handles NULL properly
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_tag_slug_per_tenant 
        ON tags (slug, COALESCE(tenant_id, ''))
      `).catch((err) => {
        console.log('[migration] Note: unique index may already exist:', err.message);
      });
    }

    console.log('[migration] Migration complete: categories and tags now support NULL tenant_id for master records');
  },

  async down(queryInterface, Sequelize) {
    // Revert: Set tenant_id back to NOT NULL with default
    // Note: This will fail if there are any NULL values
    
    const categoriesTable = await queryInterface.describeTable('categories').catch(() => null);
    if (categoriesTable && categoriesTable.tenant_id) {
      // First, set any NULL values to a default tenant
      await queryInterface.sequelize.query(`
        UPDATE categories 
        SET tenant_id = 'tenant-gosg' 
        WHERE tenant_id IS NULL
      `).catch(() => {
        console.log('[migration] No NULL values to update in categories');
      });
      
      // Restore NOT NULL constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE categories 
        ALTER COLUMN tenant_id SET NOT NULL,
        ALTER COLUMN tenant_id SET DEFAULT 'tenant-gosg';
      `);
    }

    const tagsTable = await queryInterface.describeTable('tags').catch(() => null);
    if (tagsTable && tagsTable.tenant_id) {
      // First, set any NULL values to a default tenant
      await queryInterface.sequelize.query(`
        UPDATE tags 
        SET tenant_id = 'tenant-gosg' 
        WHERE tenant_id IS NULL
      `).catch(() => {
        console.log('[migration] No NULL values to update in tags');
      });
      
      // Restore NOT NULL constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE tags 
        ALTER COLUMN tenant_id SET NOT NULL,
        ALTER COLUMN tenant_id SET DEFAULT 'tenant-gosg';
      `);
    }
  }
};

