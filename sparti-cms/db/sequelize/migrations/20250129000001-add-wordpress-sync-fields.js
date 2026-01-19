/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add WordPress sync fields to posts table
    const postsTable = await queryInterface.describeTable('posts').catch(() => null);
    if (postsTable) {
      // Add wordpress_id column
      if (!postsTable.wordpress_id) {
        await queryInterface.addColumn('posts', 'wordpress_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'WordPress post ID for sync tracking'
        });
      }

      // Add wordpress_sync_enabled column
      if (!postsTable.wordpress_sync_enabled) {
        await queryInterface.addColumn('posts', 'wordpress_sync_enabled', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          comment: 'Whether this post participates in WordPress sync'
        });
      }

      // Add wordpress_last_synced_at column
      if (!postsTable.wordpress_last_synced_at) {
        await queryInterface.addColumn('posts', 'wordpress_last_synced_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp of last successful sync with WordPress'
        });
      }

      // Add wordpress_sync_hash column
      if (!postsTable.wordpress_sync_hash) {
        await queryInterface.addColumn('posts', 'wordpress_sync_hash', {
          type: Sequelize.STRING(64),
          allowNull: true,
          comment: 'Hash of post content for change detection'
        });
      }

      // Create index on wordpress_id for fast lookups
      const indexes = await queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'posts' AND indexname = 'idx_posts_wordpress_id'
      `);
      
      if (indexes[0].length === 0) {
        await queryInterface.addIndex('posts', ['wordpress_id'], {
          name: 'idx_posts_wordpress_id',
          unique: false
        });
      }

      // Create composite index for tenant and wordpress_id lookups
      const compositeIndexes = await queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'posts' AND indexname = 'idx_posts_tenant_wordpress'
      `);
      
      if (compositeIndexes[0].length === 0) {
        await queryInterface.addIndex('posts', ['tenant_id', 'wordpress_id'], {
          name: 'idx_posts_tenant_wordpress',
          unique: false
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('posts', 'idx_posts_wordpress_id');
    } catch (error) {
      console.warn('[testing] Index idx_posts_wordpress_id may not exist:', error.message);
    }

    try {
      await queryInterface.removeIndex('posts', 'idx_posts_tenant_wordpress');
    } catch (error) {
      console.warn('[testing] Index idx_posts_tenant_wordpress may not exist:', error.message);
    }

    // Remove columns from posts
    const postsTable = await queryInterface.describeTable('posts').catch(() => null);
    if (postsTable) {
      if (postsTable.wordpress_id) {
        await queryInterface.removeColumn('posts', 'wordpress_id');
      }
      if (postsTable.wordpress_sync_enabled) {
        await queryInterface.removeColumn('posts', 'wordpress_sync_enabled');
      }
      if (postsTable.wordpress_last_synced_at) {
        await queryInterface.removeColumn('posts', 'wordpress_last_synced_at');
      }
      if (postsTable.wordpress_sync_hash) {
        await queryInterface.removeColumn('posts', 'wordpress_sync_hash');
      }
    }
  }
};
