/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create categories table
    await queryInterface.createTable('categories', {
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
          model: 'categories',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      meta_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      post_count: {
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

    // Create tags table
    await queryInterface.createTable('tags', {
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
      meta_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      post_count: {
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

    // Create post_categories junction table
    await queryInterface.createTable('post_categories', {
      post_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'posts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });

    // Create post_tags junction table
    await queryInterface.createTable('post_tags', {
      post_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'posts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tag_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });

    // Create indexes
    await queryInterface.addIndex('categories', ['slug'], { name: 'idx_categories_slug' });
    await queryInterface.addIndex('categories', ['parent_id'], { name: 'idx_categories_parent_id' });
    await queryInterface.addIndex('tags', ['slug'], { name: 'idx_tags_slug' });
    await queryInterface.addIndex('post_categories', ['post_id'], { name: 'idx_post_categories_post_id' });
    await queryInterface.addIndex('post_categories', ['category_id'], { name: 'idx_post_categories_category_id' });
    await queryInterface.addIndex('post_tags', ['post_id'], { name: 'idx_post_tags_post_id' });
    await queryInterface.addIndex('post_tags', ['tag_id'], { name: 'idx_post_tags_tag_id' });

    // Migrate data from terms/term_taxonomy to new tables
    // This will only work if the old tables exist
    const [termsTables] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'terms'
      );
    `);

    if (termsTables[0].exists) {
      // Migrate categories
      await queryInterface.sequelize.query(`
        INSERT INTO categories (id, name, slug, description, parent_id, meta_title, meta_description, created_at, updated_at)
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.description,
          t.parent_id,
          t.meta_title,
          t.meta_description,
          t.created_at,
          t.updated_at
        FROM terms t
        INNER JOIN term_taxonomy tt ON t.id = tt.term_id
        WHERE tt.taxonomy = 'category'
        ON CONFLICT (id) DO NOTHING;
      `);

      // Migrate tags
      await queryInterface.sequelize.query(`
        INSERT INTO tags (id, name, slug, description, meta_title, meta_description, created_at, updated_at)
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.description,
          t.meta_title,
          t.meta_description,
          t.created_at,
          t.updated_at
        FROM terms t
        INNER JOIN term_taxonomy tt ON t.id = tt.term_id
        WHERE tt.taxonomy = 'post_tag'
        ON CONFLICT (id) DO NOTHING;
      `);

      // Migrate post-category relationships
      await queryInterface.sequelize.query(`
        INSERT INTO post_categories (post_id, category_id)
        SELECT DISTINCT
          tr.object_id as post_id,
          t.id as category_id
        FROM term_relationships tr
        INNER JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
        INNER JOIN terms t ON tt.term_id = t.id
        WHERE tt.taxonomy = 'category'
          AND EXISTS (SELECT 1 FROM posts WHERE id = tr.object_id)
          AND EXISTS (SELECT 1 FROM categories WHERE id = t.id)
        ON CONFLICT (post_id, category_id) DO NOTHING;
      `);

      // Migrate post-tag relationships
      await queryInterface.sequelize.query(`
        INSERT INTO post_tags (post_id, tag_id)
        SELECT DISTINCT
          tr.object_id as post_id,
          t.id as tag_id
        FROM term_relationships tr
        INNER JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
        INNER JOIN terms t ON tt.term_id = t.id
        WHERE tt.taxonomy = 'post_tag'
          AND EXISTS (SELECT 1 FROM posts WHERE id = tr.object_id)
          AND EXISTS (SELECT 1 FROM tags WHERE id = t.id)
        ON CONFLICT (post_id, tag_id) DO NOTHING;
      `);

      // Update post_count for categories
      await queryInterface.sequelize.query(`
        UPDATE categories c
        SET post_count = (
          SELECT COUNT(DISTINCT pc.post_id)
          FROM post_categories pc
          WHERE pc.category_id = c.id
        );
      `);

      // Update post_count for tags
      await queryInterface.sequelize.query(`
        UPDATE tags t
        SET post_count = (
          SELECT COUNT(DISTINCT pt.post_id)
          FROM post_tags pt
          WHERE pt.tag_id = t.id
        );
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('post_tags');
    await queryInterface.dropTable('post_categories');
    await queryInterface.dropTable('tags');
    await queryInterface.dropTable('categories');
  }
};

