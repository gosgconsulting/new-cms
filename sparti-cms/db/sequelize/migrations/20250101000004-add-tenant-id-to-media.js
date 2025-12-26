/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Add tenant_id to media and media_folders tables
 * 
 * This migration makes media tenant-based, where each tenant has their own
 * media files and folders connected to individual storage.
 */
export default {
  async up(queryInterface, Sequelize) {
    // Add tenant_id to media_folders table
    const mediaFoldersTable = await queryInterface.describeTable('media_folders').catch(() => null);
    if (mediaFoldersTable && !mediaFoldersTable.tenant_id) {
      // First add column as nullable
      await queryInterface.addColumn('media_folders', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true, // Start as nullable
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      });

      // Update existing records to use default tenant (first tenant or 'tenant-gosg')
      const [tenants] = await queryInterface.sequelize.query(`
        SELECT id FROM tenants ORDER BY id LIMIT 1
      `);
      const defaultTenantId = tenants.length > 0 ? tenants[0].id : 'tenant-gosg';
      
      await queryInterface.sequelize.query(`
        UPDATE media_folders 
        SET tenant_id = $1 
        WHERE tenant_id IS NULL
      `, { bind: [defaultTenantId] });

      // Now make it NOT NULL
      await queryInterface.changeColumn('media_folders', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      });

      // Update unique constraint on slug to include tenant_id
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE media_folders
          DROP CONSTRAINT IF EXISTS media_folders_slug_key;
        `);
      } catch (error) {
        console.log('[migration] No existing media_folders_slug_key constraint to remove');
      }

      // Add unique constraint for slug per tenant
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_media_folder_slug_per_tenant
        ON media_folders (slug, tenant_id)
      `).catch(() => {});

      // Add index on tenant_id
      await queryInterface.addIndex('media_folders', ['tenant_id'], {
        name: 'idx_media_folders_tenant_id',
      });

      console.log('[migration] Added tenant_id column to media_folders table');
    }

    // Add tenant_id to media table
    const mediaTable = await queryInterface.describeTable('media').catch(() => null);
    if (mediaTable && !mediaTable.tenant_id) {
      // First add column as nullable
      await queryInterface.addColumn('media', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true, // Start as nullable
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      });

      // Update existing records to use default tenant (first tenant or 'tenant-gosg')
      const [tenants] = await queryInterface.sequelize.query(`
        SELECT id FROM tenants ORDER BY id LIMIT 1
      `);
      const defaultTenantId = tenants.length > 0 ? tenants[0].id : 'tenant-gosg';
      
      await queryInterface.sequelize.query(`
        UPDATE media 
        SET tenant_id = $1 
        WHERE tenant_id IS NULL
      `, { bind: [defaultTenantId] });

      // Now make it NOT NULL
      await queryInterface.changeColumn('media', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      });

      // Update unique constraint on slug to include tenant_id
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE media
          DROP CONSTRAINT IF EXISTS media_slug_key;
        `);
      } catch (error) {
        console.log('[migration] No existing media_slug_key constraint to remove');
      }

      // Add unique constraint for slug per tenant
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_media_slug_per_tenant
        ON media (slug, tenant_id)
      `).catch(() => {});

      // Add index on tenant_id
      await queryInterface.addIndex('media', ['tenant_id'], {
        name: 'idx_media_tenant_id',
      });

      console.log('[migration] Added tenant_id column to media table');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove tenant_id from media table
    const mediaTable = await queryInterface.describeTable('media').catch(() => null);
    if (mediaTable && mediaTable.tenant_id) {
      // Remove unique constraint
      try {
        await queryInterface.sequelize.query(`
          DROP INDEX IF EXISTS unique_media_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] No unique_media_slug_per_tenant index to remove');
      }

      // Restore old unique constraint
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS media_slug_key
        ON media (slug)
      `).catch(() => {});

      await queryInterface.removeIndex('media', 'idx_media_tenant_id');
      await queryInterface.removeColumn('media', 'tenant_id');
    }

    // Remove tenant_id from media_folders table
    const mediaFoldersTable = await queryInterface.describeTable('media_folders').catch(() => null);
    if (mediaFoldersTable && mediaFoldersTable.tenant_id) {
      // Remove unique constraint
      try {
        await queryInterface.sequelize.query(`
          DROP INDEX IF EXISTS unique_media_folder_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] No unique_media_folder_slug_per_tenant index to remove');
      }

      // Restore old unique constraint
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS media_folders_slug_key
        ON media_folders (slug)
      `).catch(() => {});

      await queryInterface.removeIndex('media_folders', 'idx_media_folders_tenant_id');
      await queryInterface.removeColumn('media_folders', 'tenant_id');
    }
  }
};

