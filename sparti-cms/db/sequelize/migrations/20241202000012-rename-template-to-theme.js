/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if template_id column exists
    const tableDescription = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tableDescription && tableDescription.template_id && !tableDescription.theme_id) {
      // Rename template_id column to theme_id
      await queryInterface.sequelize.query(`
        ALTER TABLE tenants 
        RENAME COLUMN template_id TO theme_id;
      `);

      // Rename index
      await queryInterface.sequelize.query(`
        ALTER INDEX IF EXISTS idx_tenants_template_id 
        RENAME TO idx_tenants_theme_id;
      `).catch(() => {
        // If index doesn't exist with that name, create it
        return queryInterface.addIndex('tenants', ['theme_id'], {
          name: 'idx_tenants_theme_id',
          unique: false,
        });
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert: rename theme_id back to template_id
    const tableDescription = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tableDescription && tableDescription.theme_id && !tableDescription.template_id) {
      await queryInterface.sequelize.query(`
        ALTER TABLE tenants 
        RENAME COLUMN theme_id TO template_id;
      `);

      await queryInterface.sequelize.query(`
        ALTER INDEX IF EXISTS idx_tenants_theme_id 
        RENAME TO idx_tenants_template_id;
      `).catch(() => {
        return queryInterface.addIndex('tenants', ['template_id'], {
          name: 'idx_tenants_template_id',
          unique: false,
        });
      });
    }
  }
};

