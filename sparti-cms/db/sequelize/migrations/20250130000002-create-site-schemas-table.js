/** @type {import('sequelize-cli').Migration} */
/**
 * Create site_schemas table.
 * Used by sparti-cms/db/initBrandingSchema.js and branding module for tenant/global schema storage.
 */
export default {
  async up(queryInterface, Sequelize) {
    const exists = await queryInterface.describeTable('site_schemas').catch(() => null);
    if (exists) return;

    await queryInterface.createTable('site_schemas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenant_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      schema_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      schema_value: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      language: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'default',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('site_schemas', ['tenant_id', 'schema_key', 'language'], {
      name: 'site_schemas_schema_key_tenant_id_language_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('site_schemas', { cascade: true });
  },
};
