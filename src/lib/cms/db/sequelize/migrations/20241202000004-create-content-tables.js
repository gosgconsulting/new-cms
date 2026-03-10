/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create posts table
    const postsTable = await queryInterface.describeTable('posts').catch(() => null);
    if (!postsTable) {
      await queryInterface.createTable('posts', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        excerpt: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING(20),
          defaultValue: 'draft',
        },
        post_type: {
          type: Sequelize.STRING(50),
          defaultValue: 'post',
        },
        author_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        parent_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'posts',
            key: 'id',
          },
        },
        menu_order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        featured_image_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        meta_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        meta_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        meta_keywords: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        canonical_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        robots_meta: {
          type: Sequelize.STRING(100),
          defaultValue: 'index,follow',
        },
        og_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        og_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        og_image: {
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
        view_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        last_viewed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        published_at: {
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

      await queryInterface.addIndex('posts', ['slug'], { name: 'idx_posts_slug' });
      await queryInterface.addIndex('posts', ['status'], { name: 'idx_posts_status' });
      await queryInterface.addIndex('posts', ['post_type'], { name: 'idx_posts_type' });
    }

    // Create terms table
    const termsTable = await queryInterface.describeTable('terms').catch(() => null);
    if (!termsTable) {
      await queryInterface.createTable('terms', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(200),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        parent_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'terms',
            key: 'id',
          },
        },
        count: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        meta_title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        meta_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        canonical_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        robots_meta: {
          type: Sequelize.STRING(100),
          defaultValue: 'index,follow',
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

      await queryInterface.addIndex('terms', ['slug'], { name: 'idx_terms_slug' });
    }

    // Create term_taxonomy table
    const termTaxonomyTable = await queryInterface.describeTable('term_taxonomy').catch(() => null);
    if (!termTaxonomyTable) {
      await queryInterface.createTable('term_taxonomy', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        term_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'terms',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        taxonomy: {
          type: Sequelize.STRING(32),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        parent_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        count: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
      });
    }

    // Create term_relationships table
    const termRelationshipsTable = await queryInterface.describeTable('term_relationships').catch(() => null);
    if (!termRelationshipsTable) {
      await queryInterface.createTable('term_relationships', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        object_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        term_taxonomy_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'term_taxonomy',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        term_order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
      });
    }

    // Create breadcrumbs table
    const breadcrumbsTable = await queryInterface.describeTable('breadcrumbs').catch(() => null);
    if (!breadcrumbsTable) {
      await queryInterface.createTable('breadcrumbs', {
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
        breadcrumb_path: {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        auto_generated: {
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

      await queryInterface.addIndex('breadcrumbs', ['object_id', 'object_type'], { name: 'idx_breadcrumbs_object' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('breadcrumbs');
    await queryInterface.dropTable('term_relationships');
    await queryInterface.dropTable('term_taxonomy');
    await queryInterface.dropTable('terms');
    await queryInterface.dropTable('posts');
  }
};

