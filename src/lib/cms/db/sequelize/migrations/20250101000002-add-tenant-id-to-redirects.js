/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Add tenant_id to redirects table
 * 
 * This migration adds tenant_id column to redirects table to support
 * shared master redirects (tenant_id = NULL) and tenant-specific redirects.
 */
export default {
  async up(queryInterface, Sequelize) {
    // Add tenant_id to redirects table
    const redirectsTable = await queryInterface.describeTable('redirects').catch(() => null);
    if (redirectsTable && !redirectsTable.tenant_id) {
      await queryInterface.addColumn('redirects', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });

      // Remove old unique constraint on old_url if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE redirects 
          DROP CONSTRAINT IF EXISTS redirects_old_url_key;
        `);
      } catch (error) {
        console.log('[migration] No existing old_url constraint to remove');
      }

      // Add unique constraint for old_url per tenant
      // Use COALESCE to handle NULL tenant_id (master records)
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_redirect_old_url_per_tenant 
        ON redirects (old_url, COALESCE(tenant_id, ''))
      `).catch((err) => {
        console.log('[migration] Note: unique index may already exist:', err.message);
      });

      // Add index for tenant_id (partial index for non-null values)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_redirects_tenant_id 
        ON redirects (tenant_id) 
        WHERE tenant_id IS NOT NULL;
      `).catch(() => {});

      console.log('[migration] Added tenant_id column to redirects table');
    } else if (redirectsTable && redirectsTable.tenant_id) {
      console.log('[migration] redirects table already has tenant_id column');
    } else {
      console.log('[migration] redirects table does not exist, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove tenant_id from redirects
    const redirectsTable = await queryInterface.describeTable('redirects').catch(() => null);
    if (redirectsTable && redirectsTable.tenant_id) {
      // First, set any NULL values to a default tenant
      await queryInterface.sequelize.query(`
        UPDATE redirects 
        SET tenant_id = 'tenant-gosg' 
        WHERE tenant_id IS NULL
      `).catch(() => {
        console.log('[migration] No NULL values to update in redirects');
      });

      // Remove indexes
      try {
        await queryInterface.sequelize.query(`
          DROP INDEX IF EXISTS unique_redirect_old_url_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      try {
        await queryInterface.removeIndex('redirects', 'idx_redirects_tenant_id');
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      // Remove column
      await queryInterface.removeColumn('redirects', 'tenant_id');

      // Restore unique constraint on old_url
      await queryInterface.sequelize.query(`
        ALTER TABLE redirects 
        ADD CONSTRAINT redirects_old_url_key UNIQUE (old_url);
      `).catch(() => {});
    }
  }
};

