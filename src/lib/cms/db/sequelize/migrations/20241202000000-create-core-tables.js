/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create site_settings table
    const siteSettingsTable = await queryInterface.describeTable('site_settings').catch(() => null);
    if (!siteSettingsTable) {
      await queryInterface.createTable('site_settings', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        setting_key: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        setting_value: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        setting_type: {
          type: Sequelize.STRING(50),
          defaultValue: 'text',
        },
        setting_category: {
          type: Sequelize.STRING(100),
          defaultValue: 'general',
        },
        is_public: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
    }

    // Create form_submissions table
    const formSubmissionsTable = await queryInterface.describeTable('form_submissions').catch(() => null);
    if (!formSubmissionsTable) {
      await queryInterface.createTable('form_submissions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        form_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        form_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        company: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'new',
        },
        submitted_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        ip_address: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      });

      await queryInterface.addIndex('form_submissions', ['form_id'], { name: 'idx_form_submissions_form_id' });
      await queryInterface.addIndex('form_submissions', ['submitted_at'], { name: 'idx_form_submissions_submitted_at' });
    }

    // Create contacts table
    const contactsTable = await queryInterface.describeTable('contacts').catch(() => null);
    if (!contactsTable) {
      await queryInterface.createTable('contacts', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        first_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        last_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        company: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        source: {
          type: Sequelize.STRING(100),
          defaultValue: 'form',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'new',
        },
        tags: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
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
    }

    // Create projects table
    const projectsTable = await queryInterface.describeTable('projects').catch(() => null);
    if (!projectsTable) {
      await queryInterface.createTable('projects', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'active',
        },
        category: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        priority: {
          type: Sequelize.STRING(20),
          defaultValue: 'medium',
        },
        start_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        end_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        progress: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
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
    }

    // Create project_steps table
    const projectStepsTable = await queryInterface.describeTable('project_steps').catch(() => null);
    if (!projectStepsTable) {
      await queryInterface.createTable('project_steps', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        project_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'projects',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'pending',
        },
        step_order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        estimated_hours: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        actual_hours: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        assigned_to: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        due_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        completed_at: {
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
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('project_steps');
    await queryInterface.dropTable('projects');
    await queryInterface.dropTable('contacts');
    await queryInterface.dropTable('form_submissions');
    await queryInterface.dropTable('site_settings');
  }
};

