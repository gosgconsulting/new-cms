/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Add tenant_id to sitemap_entries table
    const sitemapEntriesTable = await queryInterface.describeTable('sitemap_entries').catch(() => null);
    if (sitemapEntriesTable && !sitemapEntriesTable.tenant_id) {
      await queryInterface.addColumn('sitemap_entries', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });

      // Remove old unique constraint on url if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE sitemap_entries 
          DROP CONSTRAINT IF EXISTS sitemap_entries_url_key;
        `);
      } catch (error) {
        console.log('[migration] No existing url constraint to remove');
      }

      // Add unique constraint for url per tenant
      // Use partial unique index to handle NULL tenant_id (master records)
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_sitemap_url_per_tenant 
        ON sitemap_entries (url, COALESCE(tenant_id, ''))
      `).catch(() => {});

      // Add index for tenant_id (partial index for non-null values)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_sitemap_entries_tenant_id 
        ON sitemap_entries (tenant_id) 
        WHERE tenant_id IS NOT NULL;
      `).catch(() => {});
    }

    // 2. Add tenant_id to robots_config table
    const robotsConfigTable = await queryInterface.describeTable('robots_config').catch(() => null);
    if (robotsConfigTable && !robotsConfigTable.tenant_id) {
      await queryInterface.addColumn('robots_config', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });

      // Add index for tenant_id (partial index for non-null values)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_robots_config_tenant_id 
        ON robots_config (tenant_id) 
        WHERE tenant_id IS NOT NULL;
      `).catch(() => {});
    }

    // 3. Add tenant_id to seo_meta table
    const seoMetaTable = await queryInterface.describeTable('seo_meta').catch(() => null);
    if (seoMetaTable && !seoMetaTable.tenant_id) {
      await queryInterface.addColumn('seo_meta', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });

      // Remove old unique constraint on (object_id, object_type) if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE seo_meta 
          DROP CONSTRAINT IF EXISTS seo_meta_unique;
        `);
      } catch (error) {
        console.log('[migration] No existing seo_meta_unique constraint to remove');
      }

      // Add unique constraint for (object_id, object_type, tenant_id)
      // Use partial unique index to handle NULL tenant_id (master records)
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS seo_meta_unique_per_tenant 
        ON seo_meta (object_id, object_type, COALESCE(tenant_id, ''))
      `).catch(() => {});

      // Add index for tenant_id (partial index for non-null values)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_seo_meta_tenant_id 
        ON seo_meta (tenant_id) 
        WHERE tenant_id IS NOT NULL;
      `).catch(() => {});
    }

    // 4. Verify/add tenant_id to posts table
    const postsTable = await queryInterface.describeTable('posts').catch(() => null);
    if (postsTable && !postsTable.tenant_id) {
      await queryInterface.addColumn('posts', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });

      // Remove old unique constraint on slug if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE posts 
          DROP CONSTRAINT IF EXISTS posts_slug_key;
        `);
      } catch (error) {
        console.log('[migration] No existing slug constraint to remove');
      }

      // Add unique constraint for slug per tenant
      // Use partial unique index to handle NULL tenant_id (master records)
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_post_slug_per_tenant 
        ON posts (slug, COALESCE(tenant_id, ''))
      `).catch(() => {});

      // Add index for tenant_id (partial index for non-null values)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_posts_tenant_id 
        ON posts (tenant_id) 
        WHERE tenant_id IS NOT NULL;
      `).catch(() => {});
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove tenant_id from sitemap_entries
    const sitemapEntriesTable = await queryInterface.describeTable('sitemap_entries').catch(() => null);
    if (sitemapEntriesTable && sitemapEntriesTable.tenant_id) {
      try {
        await queryInterface.sequelize.query(`
          DROP INDEX IF EXISTS unique_sitemap_url_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      try {
        await queryInterface.removeIndex('sitemap_entries', 'idx_sitemap_entries_tenant_id');
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      await queryInterface.removeColumn('sitemap_entries', 'tenant_id');

      // Restore unique constraint on url
      await queryInterface.sequelize.query(`
        ALTER TABLE sitemap_entries 
        ADD CONSTRAINT sitemap_entries_url_key UNIQUE (url);
      `).catch(() => {});
    }

    // Remove tenant_id from robots_config
    const robotsConfigTable = await queryInterface.describeTable('robots_config').catch(() => null);
    if (robotsConfigTable && robotsConfigTable.tenant_id) {
      try {
        await queryInterface.removeIndex('robots_config', 'idx_robots_config_tenant_id');
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      await queryInterface.removeColumn('robots_config', 'tenant_id');
    }

    // Remove tenant_id from seo_meta
    const seoMetaTable = await queryInterface.describeTable('seo_meta').catch(() => null);
    if (seoMetaTable && seoMetaTable.tenant_id) {
      try {
        await queryInterface.sequelize.query(`
          DROP INDEX IF EXISTS seo_meta_unique_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      try {
        await queryInterface.removeIndex('seo_meta', 'idx_seo_meta_tenant_id');
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      await queryInterface.removeColumn('seo_meta', 'tenant_id');

      // Restore unique constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE seo_meta 
        ADD CONSTRAINT seo_meta_unique UNIQUE (object_id, object_type);
      `).catch(() => {});
    }

    // Remove tenant_id from posts
    const postsTable = await queryInterface.describeTable('posts').catch(() => null);
    if (postsTable && postsTable.tenant_id) {
      try {
        await queryInterface.sequelize.query(`
          DROP INDEX IF EXISTS unique_post_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      try {
        await queryInterface.removeIndex('posts', 'idx_posts_tenant_id');
      } catch (error) {
        console.log('[migration] Error removing index:', error);
      }

      await queryInterface.removeColumn('posts', 'tenant_id');

      // Restore unique constraint on slug
      await queryInterface.sequelize.query(`
        ALTER TABLE posts 
        ADD CONSTRAINT posts_slug_key UNIQUE (slug);
      `).catch(() => {});
    }
  }
};

