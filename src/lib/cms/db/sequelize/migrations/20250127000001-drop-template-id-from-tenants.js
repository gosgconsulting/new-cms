/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if template_id column exists
    const tableDescription = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tableDescription && tableDescription.template_id) {
      // Remove index if it exists
      try {
        await queryInterface.removeIndex('tenants', 'idx_tenants_template_id');
      } catch (error) {
        // Index might not exist, ignore error
        console.log('[testing] Index idx_tenants_template_id not found or already removed');
      }
      
      // Remove template_id column
      await queryInterface.removeColumn('tenants', 'template_id');
      console.log('[testing] Successfully removed template_id column from tenants table');
    } else {
      console.log('[testing] template_id column does not exist, skipping removal');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert: add template_id column back
    const tableDescription = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tableDescription && !tableDescription.template_id) {
      await queryInterface.addColumn('tenants', 'template_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });

      // Recreate index
      await queryInterface.addIndex('tenants', ['template_id'], {
        name: 'idx_tenants_template_id',
        unique: false,
      });
    }
  }
};

