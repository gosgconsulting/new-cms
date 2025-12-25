/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create update_updated_at_column function if it doesn't exist
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create tenant_integrations table
    const tenantIntegrationsTable = await queryInterface.describeTable('tenant_integrations').catch(() => null);
    if (!tenantIntegrationsTable) {
      await queryInterface.createTable('tenant_integrations', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        integration_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        config: {
          type: Sequelize.JSONB,
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
      });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_tenant_integrations_updated_at ON tenant_integrations;
        CREATE TRIGGER update_tenant_integrations_updated_at
        BEFORE UPDATE ON tenant_integrations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);

      // Create unique constraint on tenant_id + integration_type
      await queryInterface.addIndex('tenant_integrations', ['tenant_id', 'integration_type'], {
        name: 'idx_tenant_integrations_unique',
        unique: true,
      });

      // Create index on tenant_id for faster lookups
      await queryInterface.addIndex('tenant_integrations', ['tenant_id'], {
        name: 'idx_tenant_integrations_tenant_id',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tenant_integrations');
  }
};

