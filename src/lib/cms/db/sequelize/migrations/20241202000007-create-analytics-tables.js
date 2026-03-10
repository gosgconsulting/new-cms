/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create analytics_page_views table
    const analyticsPageViewsTable = await queryInterface.describeTable('analytics_page_views').catch(() => null);
    if (!analyticsPageViewsTable) {
      await queryInterface.createTable('analytics_page_views', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        page_path: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        page_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        referrer: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        user_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        timestamp: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        duration_seconds: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        bounce: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        country: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        city: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        device_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        browser: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        os: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
      });

      await queryInterface.addIndex('analytics_page_views', ['timestamp'], { name: 'idx_analytics_page_views_timestamp' });
      await queryInterface.addIndex('analytics_page_views', ['page_path'], { name: 'idx_analytics_page_views_page_path' });
      await queryInterface.addIndex('analytics_page_views', ['session_id'], { name: 'idx_analytics_page_views_session' });
      await queryInterface.addIndex('analytics_page_views', ['user_id'], { name: 'idx_analytics_page_views_user' });
    }

    // Create analytics_events table
    const analyticsEventsTable = await queryInterface.describeTable('analytics_events').catch(() => null);
    if (!analyticsEventsTable) {
      await queryInterface.createTable('analytics_events', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        event_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        event_category: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        event_action: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        event_label: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        event_value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        page_path: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        user_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        timestamp: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        properties: {
          type: Sequelize.JSONB,
          defaultValue: {},
        },
        conversion_value: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
      });

      await queryInterface.addIndex('analytics_events', ['timestamp'], { name: 'idx_analytics_events_timestamp' });
      await queryInterface.addIndex('analytics_events', ['event_name'], { name: 'idx_analytics_events_name' });
      await queryInterface.addIndex('analytics_events', ['event_category'], { name: 'idx_analytics_events_category' });
      await queryInterface.addIndex('analytics_events', ['session_id'], { name: 'idx_analytics_events_session' });
    }

    // Create analytics_sessions table
    const analyticsSessionsTable = await queryInterface.describeTable('analytics_sessions').catch(() => null);
    if (!analyticsSessionsTable) {
      await queryInterface.createTable('analytics_sessions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        referrer: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        landing_page: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        exit_page: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        start_time: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        end_time: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        duration_seconds: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        page_views: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        events: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        bounce: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        country: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        city: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        device_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        browser: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        os: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
      });

      await queryInterface.addIndex('analytics_sessions', ['session_id'], { name: 'idx_analytics_sessions_session_id' });
      await queryInterface.addIndex('analytics_sessions', ['start_time'], { name: 'idx_analytics_sessions_start_time' });
      await queryInterface.addIndex('analytics_sessions', ['user_id'], { name: 'idx_analytics_sessions_user_id' });
    }

    // Create analytics_daily_stats table
    const analyticsDailyStatsTable = await queryInterface.describeTable('analytics_daily_stats').catch(() => null);
    if (!analyticsDailyStatsTable) {
      await queryInterface.createTable('analytics_daily_stats', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          unique: true,
        },
        page_views: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        unique_visitors: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        sessions: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        bounce_rate: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        avg_session_duration: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        events: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        conversions: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        conversion_rate: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        top_pages: {
          type: Sequelize.JSONB,
          defaultValue: [],
        },
        top_referrers: {
          type: Sequelize.JSONB,
          defaultValue: [],
        },
        device_breakdown: {
          type: Sequelize.JSONB,
          defaultValue: {},
        },
        browser_breakdown: {
          type: Sequelize.JSONB,
          defaultValue: {},
        },
        country_breakdown: {
          type: Sequelize.JSONB,
          defaultValue: {},
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

      await queryInterface.addIndex('analytics_daily_stats', ['date'], { name: 'idx_analytics_daily_stats_date' });
    }

    // Create analytics_event_definitions table
    const analyticsEventDefinitionsTable = await queryInterface.describeTable('analytics_event_definitions').catch(() => null);
    if (!analyticsEventDefinitionsTable) {
      await queryInterface.createTable('analytics_event_definitions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        category: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        is_conversion: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        conversion_value: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        is_active: {
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
    }

    // Create analytics_goals table
    const analyticsGoalsTable = await queryInterface.describeTable('analytics_goals').catch(() => null);
    if (!analyticsGoalsTable) {
      await queryInterface.createTable('analytics_goals', {
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
        goal_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        target_value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        current_value: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        period: {
          type: Sequelize.STRING(50),
          defaultValue: 'monthly',
        },
        start_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        end_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        is_active: {
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
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('analytics_goals');
    await queryInterface.dropTable('analytics_event_definitions');
    await queryInterface.dropTable('analytics_daily_stats');
    await queryInterface.dropTable('analytics_sessions');
    await queryInterface.dropTable('analytics_events');
    await queryInterface.dropTable('analytics_page_views');
  }
};

