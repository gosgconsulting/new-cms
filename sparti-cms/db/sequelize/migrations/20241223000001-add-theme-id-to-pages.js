/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if theme_id column already exists
    const tableDescription = await queryInterface.describeTable('pages').catch(() => null);
    
    if (tableDescription && !tableDescription.theme_id) {
      await queryInterface.addColumn('pages', 'theme_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: 'Theme slug that this page belongs to (for theme-based pages)'
      });
      
      // Add index for theme_id for faster queries
      await queryInterface.addIndex('pages', ['theme_id'], {
        name: 'pages_theme_id_idx',
        where: {
          theme_id: { [Sequelize.Op.ne]: null }
        }
      });
      
      console.log('[testing] Added theme_id column to pages table');
    } else {
      console.log('[testing] theme_id column already exists or pages table does not exist');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('pages').catch(() => null);
    
    if (tableDescription && tableDescription.theme_id) {
      // Remove index first
      await queryInterface.removeIndex('pages', 'pages_theme_id_idx').catch(() => {
        // Index might not exist, ignore error
      });
      
      // Remove column
      await queryInterface.removeColumn('pages', 'theme_id');
      
      console.log('[testing] Removed theme_id column from pages table');
    }
  }
};

