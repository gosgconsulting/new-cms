/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if template_id column already exists
    const tableDescription = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tableDescription && !tableDescription.template_id) {
      // Add template_id column
      await queryInterface.addColumn('tenants', 'template_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });

      // Create index on template_id for faster lookups
      await queryInterface.addIndex('tenants', ['template_id'], {
        name: 'idx_tenants_template_id',
        unique: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('tenants', 'idx_tenants_template_id').catch(() => null);
    
    // Remove template_id column
    await queryInterface.removeColumn('tenants', 'template_id').catch(() => null);
  }
};

