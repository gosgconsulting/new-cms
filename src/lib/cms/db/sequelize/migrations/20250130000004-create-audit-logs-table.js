/** @type {import('sequelize-cli').Migration} */
/**
 * Create audit_logs table.
 * Used by server/services/auditService.js for audit trail.
 */
export default {
  async up(queryInterface, Sequelize) {
    const exists = await queryInterface.describeTable('audit_logs').catch(() => null);
    if (exists) return;

    await queryInterface.sequelize.query(`
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        user_id VARCHAR(255),
        tenant_id VARCHAR(255),
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'success',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id)
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type)
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs', { cascade: true });
  },
};
