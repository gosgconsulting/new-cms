/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if themes table exists
    const tableDescription = await queryInterface.describeTable('themes').catch(() => null);
    
    if (tableDescription) {
      // Check if tags column already exists
      if (!tableDescription.tags) {
        // Add tags column as TEXT[] (PostgreSQL array type)
        await queryInterface.addColumn('themes', 'tags', {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: true,
          defaultValue: [],
        });
        
        console.log('[migration] Added tags column to themes table');
      } else {
        console.log('[migration] Tags column already exists in themes table');
      }
    } else {
      console.log('[migration] Themes table does not exist, skipping tags column addition');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove tags column
    const tableDescription = await queryInterface.describeTable('themes').catch(() => null);
    
    if (tableDescription && tableDescription.tags) {
      await queryInterface.removeColumn('themes', 'tags');
      console.log('[migration] Removed tags column from themes table');
    }
  }
};
