/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create pages table (unified with page_type)
    const pagesTable = await queryInterface.describeTable('pages').catch(() => null);
    if (!pagesTable) {
      await queryInterface.createTable('pages', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        page_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        meta_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        meta_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        seo_index: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'draft',
        },
        page_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'page',
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: 'tenant-gosg',
        },
        campaign_source: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        conversion_goal: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        legal_type: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        last_reviewed_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        version: {
          type: Sequelize.STRING(20),
          defaultValue: '1.0',
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
        ALTER TABLE pages 
        ADD CONSTRAINT unique_slug_per_tenant 
        UNIQUE (slug, tenant_id);
      `).catch(() => {});

      // Add check constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE pages 
        ADD CONSTRAINT valid_page_type 
        CHECK (page_type IN ('page', 'landing', 'legal'));
      `).catch(() => {});

      // Create indexes
      await queryInterface.addIndex('pages', ['page_type'], { name: 'idx_pages_page_type' });
      await queryInterface.addIndex('pages', ['slug'], { name: 'idx_pages_slug' });
      await queryInterface.addIndex('pages', ['status'], { name: 'idx_pages_status' });
      await queryInterface.addIndex('pages', ['tenant_id'], { name: 'idx_pages_tenant_id' });
      await queryInterface.addIndex('pages', ['tenant_id', 'page_type'], { name: 'idx_pages_tenant_type' });
      await queryInterface.addIndex('pages', ['slug', 'tenant_id'], { name: 'idx_pages_slug_tenant' });
    }

    // Create page_layouts table
    const pageLayoutsTable = await queryInterface.describeTable('page_layouts').catch(() => null);
    if (!pageLayoutsTable) {
      await queryInterface.createTable('page_layouts', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        page_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pages',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        language: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'default',
        },
        layout_json: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: { components: [] },
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Add unique constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE page_layouts 
        ADD CONSTRAINT page_layouts_page_id_language_unique 
        UNIQUE (page_id, language);
      `).catch(() => {});
    }

    // Create page_components table
    const pageComponentsTable = await queryInterface.describeTable('page_components').catch(() => null);
    if (!pageComponentsTable) {
      await queryInterface.createTable('page_components', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        page_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pages',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        component_key: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        props: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        sort_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    // Create slug_change_log table
    const slugChangeLogTable = await queryInterface.describeTable('slug_change_log').catch(() => null);
    if (!slugChangeLogTable) {
      await queryInterface.createTable('slug_change_log', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        page_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        page_type: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        old_slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        new_slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        changed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('slug_change_log');
    await queryInterface.dropTable('page_components');
    await queryInterface.dropTable('page_layouts');
    await queryInterface.dropTable('pages');
  }
};

