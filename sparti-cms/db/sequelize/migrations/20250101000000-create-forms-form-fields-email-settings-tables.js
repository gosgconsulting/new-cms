/** @type {import('sequelize-cli').Migration} */
/**
 * Create forms module base tables: forms, form_fields, email_settings.
 * Must run before 20250101000006 (adds tenant_id to forms).
 * Uses IF NOT EXISTS for idempotency on existing DBs.
 */
export default {
  async up(queryInterface, Sequelize) {
    // forms - used by forms management, referenced by 20250101000006
    const formsExists = await queryInterface.describeTable('forms').catch(() => null);
    if (!formsExists) {
      await queryInterface.createTable('forms', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        fields: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        settings: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('NOW()'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('NOW()'),
        },
      });
    }

    // form_fields - used by forms module
    const formFieldsExists = await queryInterface.describeTable('form_fields').catch(() => null);
    if (!formFieldsExists) {
      await queryInterface.createTable('form_fields', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        form_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'forms', key: 'id' },
          onDelete: 'CASCADE',
        },
        field_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        field_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        field_label: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        placeholder: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        is_required: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        validation_rules: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
        },
        options: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: [],
        },
        sort_order: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('NOW()'),
        },
      });
    }

    // email_settings - used by forms module (server/routes/forms.js, sparti-cms/db/modules/forms.js)
    const emailSettingsExists = await queryInterface.describeTable('email_settings').catch(() => null);
    if (!emailSettingsExists) {
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS email_settings (
          id SERIAL PRIMARY KEY,
          form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
          notification_enabled BOOLEAN DEFAULT true,
          notification_emails TEXT[] DEFAULT '{}',
          notification_subject VARCHAR(255) DEFAULT 'New Form Submission',
          notification_template TEXT DEFAULT 'You have received a new form submission.',
          auto_reply_enabled BOOLEAN DEFAULT false,
          auto_reply_subject VARCHAR(255) DEFAULT 'Thank you for your submission',
          auto_reply_template TEXT DEFAULT 'Thank you for contacting us. We will get back to you soon.',
          from_email VARCHAR(255),
          from_name VARCHAR(255),
          notification_from_email VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_settings', { cascade: true }).catch(() => {});
    await queryInterface.dropTable('form_fields', { cascade: true }).catch(() => {});
    await queryInterface.dropTable('forms', { cascade: true }).catch(() => {});
  },
};
