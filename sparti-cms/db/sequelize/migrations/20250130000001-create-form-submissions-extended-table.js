/** @type {import('sequelize-cli').Migration} */
/**
 * Create form_submissions_extended table.
 * Used by sparti-cms/db/modules/forms.js for enhanced form submission tracking with JSON submission_data.
 */
export default {
  async up(queryInterface, Sequelize) {
    const exists = await queryInterface.describeTable('form_submissions_extended').catch(() => null);
    if (exists) return;

    await queryInterface.createTable('form_submissions_extended', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      form_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'forms', key: 'id' },
        onDelete: 'SET NULL',
      },
      submission_data: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      submitter_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      submitter_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      submitter_ip: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'new',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('NOW()'),
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tenant_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tenant_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    });

    await queryInterface.addIndex('form_submissions_extended', ['form_id'], {
      name: 'idx_form_submissions_extended_form_id',
    });
    await queryInterface.addIndex('form_submissions_extended', ['tenant_id'], {
      name: 'idx_form_submissions_extended_tenant_id',
    });
    await queryInterface.addIndex('form_submissions_extended', ['status'], {
      name: 'idx_form_submissions_extended_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('form_submissions_extended', { cascade: true });
  },
};
