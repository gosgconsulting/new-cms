/** @type {import('sequelize-cli').Migration} */
/**
 * Add columns that exist in DB but were not in migrations.
 */
export default {
  async up(queryInterface, Sequelize) {
    // form_submissions.tenant_name
    const formSubmissions = await queryInterface.describeTable('form_submissions').catch(() => null);
    if (formSubmissions && !formSubmissions.tenant_name) {
      await queryInterface.addColumn('form_submissions', 'tenant_name', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    // page_layouts.is_default
    const pageLayouts = await queryInterface.describeTable('page_layouts').catch(() => null);
    if (pageLayouts && !pageLayouts.is_default) {
      await queryInterface.addColumn('page_layouts', 'is_default', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }

    // user_sessions.session_token
    const userSessions = await queryInterface.describeTable('user_sessions').catch(() => null);
    if (userSessions && !userSessions.session_token) {
      await queryInterface.addColumn('user_sessions', 'session_token', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const formSubmissions = await queryInterface.describeTable('form_submissions').catch(() => null);
    if (formSubmissions?.tenant_name) {
      await queryInterface.removeColumn('form_submissions', 'tenant_name');
    }
    const pageLayouts = await queryInterface.describeTable('page_layouts').catch(() => null);
    if (pageLayouts?.is_default) {
      await queryInterface.removeColumn('page_layouts', 'is_default');
    }
    const userSessions = await queryInterface.describeTable('user_sessions').catch(() => null);
    if (userSessions?.session_token) {
      await queryInterface.removeColumn('user_sessions', 'session_token');
    }
  },
};
