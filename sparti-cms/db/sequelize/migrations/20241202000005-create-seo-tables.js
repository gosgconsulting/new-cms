/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create redirects table
    const redirectsTable = await queryInterface.describeTable('redirects').catch(() => null);
    if (!redirectsTable) {
      await queryInterface.createTable('redirects', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        old_url: {
          type: Sequelize.STRING(500),
          allowNull: false,
          unique: true,
        },
        new_url: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        redirect_type: {
          type: Sequelize.INTEGER,
          defaultValue: 301,
        },
        status: {
          type: Sequelize.STRING(20),
          defaultValue: 'active',
        },
        hits: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        last_hit: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.STRING(100),
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

      await queryInterface.addIndex('redirects', ['old_url'], { name: 'idx_redirects_old_url' });
      await queryInterface.addIndex('redirects', ['status'], { name: 'idx_redirects_status' });
      await queryInterface.addIndex('redirects', ['hits'], { name: 'idx_redirects_hits' });
    }

    // Create seo_meta table
    const seoMetaTable = await queryInterface.describeTable('seo_meta').catch(() => null);
    if (!seoMetaTable) {
      await queryInterface.createTable('seo_meta', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        object_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        object_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        focus_keyword: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        secondary_keywords: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: true,
        },
        keyword_density: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        readability_score: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        content_length: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        word_count: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        sentence_count: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        paragraph_count: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        facebook_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        facebook_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        facebook_image: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        twitter_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        twitter_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        twitter_image: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        breadcrumb_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        redirect_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        redirect_type: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        noindex: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        nofollow: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        noarchive: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        nosnippet: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        noimageindex: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        schema_type: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        schema_data: {
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

      // Add unique constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE seo_meta 
        ADD CONSTRAINT seo_meta_unique 
        UNIQUE (object_id, object_type);
      `).catch(() => {});

      await queryInterface.addIndex('seo_meta', ['object_id', 'object_type'], { name: 'idx_seo_meta_object' });
      await queryInterface.addIndex('seo_meta', ['focus_keyword'], { name: 'idx_seo_meta_focus_keyword' });
    }

    // Create sitemap_entries table
    const sitemapEntriesTable = await queryInterface.describeTable('sitemap_entries').catch(() => null);
    if (!sitemapEntriesTable) {
      await queryInterface.createTable('sitemap_entries', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        url: {
          type: Sequelize.STRING(500),
          allowNull: false,
          unique: true,
        },
        changefreq: {
          type: Sequelize.STRING(20),
          defaultValue: 'weekly',
        },
        priority: {
          type: Sequelize.DECIMAL(2, 1),
          defaultValue: 0.5,
        },
        lastmod: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        sitemap_type: {
          type: Sequelize.STRING(50),
          defaultValue: 'main',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        object_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        object_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        image_url: {
          type: Sequelize.STRING(500),
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

      await queryInterface.addIndex('sitemap_entries', ['sitemap_type'], { name: 'idx_sitemap_entries_type' });
      await queryInterface.addIndex('sitemap_entries', ['is_active'], { name: 'idx_sitemap_entries_active' });
      await queryInterface.addIndex('sitemap_entries', ['lastmod'], { name: 'idx_sitemap_entries_lastmod' });
    }

    // Create robots_config table
    const robotsConfigTable = await queryInterface.describeTable('robots_config').catch(() => null);
    if (!robotsConfigTable) {
      await queryInterface.createTable('robots_config', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_agent: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        directive: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        path: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        notes: {
          type: Sequelize.TEXT,
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

      await queryInterface.addIndex('robots_config', ['user_agent'], { name: 'idx_robots_config_user_agent' });
      await queryInterface.addIndex('robots_config', ['is_active'], { name: 'idx_robots_config_active' });
    }

    // Create seo_analytics table
    const seoAnalyticsTable = await queryInterface.describeTable('seo_analytics').catch(() => null);
    if (!seoAnalyticsTable) {
      await queryInterface.createTable('seo_analytics', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        url: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        page_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        meta_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        page_views: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        unique_visitors: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        bounce_rate: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        avg_time_on_page: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        organic_clicks: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        organic_impressions: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        avg_position: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        ctr: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        top_keywords: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Add unique constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE seo_analytics 
        ADD CONSTRAINT seo_analytics_unique 
        UNIQUE (url, date);
      `).catch(() => {});

      await queryInterface.addIndex('seo_analytics', ['url'], { name: 'idx_seo_analytics_url' });
      await queryInterface.addIndex('seo_analytics', ['date'], { name: 'idx_seo_analytics_date' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('seo_analytics');
    await queryInterface.dropTable('robots_config');
    await queryInterface.dropTable('sitemap_entries');
    await queryInterface.dropTable('seo_meta');
    await queryInterface.dropTable('redirects');
  }
};

