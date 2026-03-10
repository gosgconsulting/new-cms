/** @type {import('sequelize-cli').Migration} */
/**
 * Create smtp_config table.
 * Used by server/routes/system.js for SMTP/email configuration.
 */
export default {
  async up(queryInterface, Sequelize) {
    const exists = await queryInterface.describeTable('smtp_config').catch(() => null);
    if (exists) return;

    await queryInterface.sequelize.query(`
      CREATE TABLE smtp_config (
        id SERIAL PRIMARY KEY,
        host VARCHAR(255) NOT NULL,
        port INTEGER NOT NULL DEFAULT 587,
        username VARCHAR(255) NOT NULL,
        password TEXT NOT NULL,
        from_email VARCHAR(255) NOT NULL,
        from_name VARCHAR(255),
        security VARCHAR(10) NOT NULL DEFAULT 'tls',
        enabled BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('smtp_config', { cascade: true });
  },
};
