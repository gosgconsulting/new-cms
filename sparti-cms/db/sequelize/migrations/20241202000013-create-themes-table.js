/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if themes table already exists
    const tableDescription = await queryInterface.describeTable('themes').catch(() => null);
    
    if (!tableDescription) {
      // Create themes table
      await queryInterface.createTable('themes', {
        id: {
          type: Sequelize.STRING(255),
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
      });

      // Create indexes
      await queryInterface.addIndex('themes', ['slug'], {
        name: 'idx_themes_slug',
        unique: true,
      });

      await queryInterface.addIndex('themes', ['is_active'], {
        name: 'idx_themes_is_active',
        unique: false,
      });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
        CREATE TRIGGER update_themes_updated_at
        BEFORE UPDATE ON themes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `).catch(() => {
        // Function might not exist yet, that's okay
        console.log('[testing] Note: update_updated_at_column function may not exist yet');
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('themes', 'idx_themes_slug').catch(() => null);
    await queryInterface.removeIndex('themes', 'idx_themes_is_active').catch(() => null);
    
    // Remove trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
    `).catch(() => null);
    
    // Remove themes table
    await queryInterface.dropTable('themes').catch(() => null);
  }
};

