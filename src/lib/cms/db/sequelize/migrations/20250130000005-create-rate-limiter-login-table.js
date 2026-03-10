/** @type {import('sequelize-cli').Migration} */
/**
 * Create rate_limiter_login table.
 * Schema expected by rate-limiter-flexible RateLimiterPostgreSQL (tableName: 'rate_limiter_login').
 */
export default {
  async up(queryInterface) {
    const exists = await queryInterface.describeTable('rate_limiter_login').catch(() => null);
    if (exists) return;

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "rate_limiter_login" (
        key VARCHAR(255) PRIMARY KEY,
        points INTEGER NOT NULL DEFAULT 0,
        expire BIGINT
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rate_limiter_login', { cascade: true });
  },
};
