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

    // Create tenants table
    const tenantsTable = await queryInterface.describeTable('tenants').catch(() => null);
    if (!tenantsTable) {
      await queryInterface.createTable('tenants', {
        id: {
          type: Sequelize.STRING(255),
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
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
        database_url: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        api_key: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
      });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
        CREATE TRIGGER update_tenants_updated_at
        BEFORE UPDATE ON tenants
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create tenant_databases table
    const tenantDatabasesTable = await queryInterface.describeTable('tenant_databases').catch(() => null);
    if (!tenantDatabasesTable) {
      await queryInterface.createTable('tenant_databases', {
        tenant_id: {
          type: Sequelize.STRING(255),
          primaryKey: true,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        host: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        port: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 5432,
        },
        database_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        username: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        ssl: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
        DROP TRIGGER IF EXISTS update_tenant_databases_updated_at ON tenant_databases;
        CREATE TRIGGER update_tenant_databases_updated_at
        BEFORE UPDATE ON tenant_databases
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create tenant_api_keys table
    const tenantApiKeysTable = await queryInterface.describeTable('tenant_api_keys').catch(() => null);
    if (!tenantApiKeysTable) {
      await queryInterface.createTable('tenant_api_keys', {
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
        api_key: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        expires_at: {
          type: Sequelize.DATE,
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
        DROP TRIGGER IF EXISTS update_tenant_api_keys_updated_at ON tenant_api_keys;
        CREATE TRIGGER update_tenant_api_keys_updated_at
        BEFORE UPDATE ON tenant_api_keys
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);

      // Create indexes
      await queryInterface.addIndex('tenant_api_keys', ['tenant_id'], { name: 'idx_tenant_api_keys_tenant_id' });
      await queryInterface.addIndex('tenant_api_keys', ['api_key'], { name: 'idx_tenant_api_keys_api_key' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tenant_api_keys');
    await queryInterface.dropTable('tenant_databases');
    await queryInterface.dropTable('tenants');
  }
};

