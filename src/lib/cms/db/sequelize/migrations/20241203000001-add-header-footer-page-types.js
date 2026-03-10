/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Drop the existing constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE pages 
      DROP CONSTRAINT IF EXISTS valid_page_type;
    `).catch(() => {});

    // Add the updated constraint with header and footer
    await queryInterface.sequelize.query(`
      ALTER TABLE pages 
      ADD CONSTRAINT valid_page_type 
      CHECK (page_type IN ('page', 'landing', 'legal', 'header', 'footer'));
    `).catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    // Revert to original constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE pages 
      DROP CONSTRAINT IF EXISTS valid_page_type;
    `).catch(() => {});

    await queryInterface.sequelize.query(`
      ALTER TABLE pages 
      ADD CONSTRAINT valid_page_type 
      CHECK (page_type IN ('page', 'landing', 'legal'));
    `).catch(() => {});
  }
};

