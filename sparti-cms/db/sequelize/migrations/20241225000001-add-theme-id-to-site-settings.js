/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if site_settings table exists and get its structure
    const siteSettingsTable = await queryInterface.describeTable('site_settings').catch(() => null);
    
    if (!siteSettingsTable) {
      console.log('[migration] site_settings table does not exist, skipping theme_id addition');
      return;
    }

    // Add tenant_id column if it doesn't exist (for backward compatibility)
    if (!siteSettingsTable.tenant_id) {
      await queryInterface.addColumn('site_settings', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
      console.log('[migration] Added tenant_id column to site_settings table');
    }

    // Add theme_id column if it doesn't exist
    if (!siteSettingsTable.theme_id) {
      await queryInterface.addColumn('site_settings', 'theme_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        // Note: We don't add foreign key constraint as themes are stored in file system
        // but we can reference theme slugs here
      });
      console.log('[migration] Added theme_id column to site_settings table');
    }

    // Remove old unique constraint on setting_key if it exists
    try {
      // Check for unique constraint on setting_key
      const constraints = await queryInterface.sequelize.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'site_settings' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%setting_key%'
      `);
      
      if (constraints[0].length > 0) {
        // Drop the old unique constraint
        await queryInterface.sequelize.query(`
          ALTER TABLE site_settings 
          DROP CONSTRAINT IF EXISTS site_settings_setting_key_key
        `);
        console.log('[migration] Removed old unique constraint on setting_key');
      }
    } catch (error) {
      console.log('[migration] Could not remove old constraint (may not exist):', error.message);
    }

    // Create new unique constraint on (setting_key, tenant_id, theme_id)
    // This allows same setting_key for different tenant+theme combinations
    try {
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS site_settings_setting_key_tenant_theme_unique 
        ON site_settings (setting_key, COALESCE(tenant_id, ''), COALESCE(theme_id, ''))
      `);
      console.log('[migration] Created unique constraint on (setting_key, tenant_id, theme_id)');
    } catch (error) {
      console.log('[migration] Could not create unique constraint:', error.message);
    }

    // Add indexes for performance
    try {
      // Index for tenant_id + theme_id queries
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_site_settings_tenant_theme 
        ON site_settings (tenant_id, theme_id) 
        WHERE tenant_id IS NOT NULL AND theme_id IS NOT NULL
      `);
      console.log('[migration] Added index on (tenant_id, theme_id)');
    } catch (error) {
      console.log('[migration] Could not add tenant_theme index:', error.message);
    }

    try {
      // Index for theme_id queries
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_site_settings_theme_id 
        ON site_settings (theme_id) 
        WHERE theme_id IS NOT NULL
      `);
      console.log('[migration] Added index on theme_id');
    } catch (error) {
      console.log('[migration] Could not add theme_id index:', error.message);
    }

    // Migrate existing data: set theme_id = NULL for existing records (backward compatible)
    await queryInterface.sequelize.query(`
      UPDATE site_settings 
      SET theme_id = NULL 
      WHERE theme_id IS NULL
    `);
    console.log('[migration] Existing records set with theme_id = NULL for backward compatibility');
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('site_settings', 'idx_site_settings_tenant_theme').catch(() => {});
    await queryInterface.removeIndex('site_settings', 'idx_site_settings_theme_id').catch(() => {});
    
    // Remove unique constraint
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS site_settings_setting_key_tenant_theme_unique
    `).catch(() => {});
    
    // Restore old unique constraint on setting_key
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE site_settings 
        ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key)
      `);
    } catch (error) {
      console.log('[migration] Could not restore old constraint:', error.message);
    }
    
    // Remove theme_id column
    await queryInterface.removeColumn('site_settings', 'theme_id').catch(() => {});
    
    console.log('[migration] Removed theme_id column and related constraints from site_settings table');
  }
};
