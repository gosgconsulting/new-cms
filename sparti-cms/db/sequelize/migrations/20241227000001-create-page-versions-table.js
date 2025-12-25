/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create page_versions table
    const pageVersionsTable = await queryInterface.describeTable('page_versions').catch(() => null);
    if (!pageVersionsTable) {
      await queryInterface.createTable('page_versions', {
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
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        version_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        // Page metadata fields (snapshot at time of save)
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
        // Landing page specific fields
        campaign_source: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        conversion_goal: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        // Legal page specific fields
        legal_type: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        last_reviewed_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        // Layout data (components)
        layout_json: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: { components: [] },
        },
        // User who created this version
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        // Optional comment/description for this version
        comment: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create unique constraint: one version number per page per tenant
      await queryInterface.sequelize.query(`
        ALTER TABLE page_versions 
        ADD CONSTRAINT unique_version_per_page 
        UNIQUE (page_id, tenant_id, version_number);
      `).catch(() => {});

      // Create indexes for performance
      await queryInterface.addIndex('page_versions', ['page_id'], { 
        name: 'idx_page_versions_page_id' 
      });
      await queryInterface.addIndex('page_versions', ['tenant_id'], { 
        name: 'idx_page_versions_tenant_id' 
      });
      await queryInterface.addIndex('page_versions', ['page_id', 'tenant_id'], { 
        name: 'idx_page_versions_page_tenant' 
      });
      await queryInterface.addIndex('page_versions', ['created_at'], { 
        name: 'idx_page_versions_created_at' 
      });
      await queryInterface.addIndex('page_versions', ['created_by'], { 
        name: 'idx_page_versions_created_by' 
      });
      await queryInterface.addIndex('page_versions', ['page_id', 'tenant_id', 'version_number'], { 
        name: 'idx_page_versions_lookup' 
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('page_versions');
  }
};

