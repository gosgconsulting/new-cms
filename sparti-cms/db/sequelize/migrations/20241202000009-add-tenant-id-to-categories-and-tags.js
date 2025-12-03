/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if categories table exists and doesn't have tenant_id
    const categoriesTable = await queryInterface.describeTable('categories').catch(() => null);
    if (categoriesTable && !categoriesTable.tenant_id) {
      // Add tenant_id column to categories table
      await queryInterface.addColumn('categories', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'tenant-gosg',
      });

      // Remove old unique constraint on slug if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE categories 
          DROP CONSTRAINT IF EXISTS categories_slug_key;
        `);
      } catch (error) {
        // Ignore if constraint doesn't exist
        console.log('[testing] No existing slug constraint to remove');
      }

      // Add unique constraint for slug per tenant
      await queryInterface.sequelize.query(`
        ALTER TABLE categories 
        ADD CONSTRAINT unique_category_slug_per_tenant 
        UNIQUE (slug, tenant_id);
      `).catch(() => {});

      // Add indexes for tenant_id
      await queryInterface.addIndex('categories', ['tenant_id'], { name: 'idx_categories_tenant_id' });
      await queryInterface.addIndex('categories', ['slug', 'tenant_id'], { name: 'idx_categories_slug_tenant' });
    }

    // Check if tags table exists and doesn't have tenant_id
    const tagsTable = await queryInterface.describeTable('tags').catch(() => null);
    if (tagsTable && !tagsTable.tenant_id) {
      // Add tenant_id column to tags table
      await queryInterface.addColumn('tags', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'tenant-gosg',
      });

      // Remove old unique constraint on slug if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE tags 
          DROP CONSTRAINT IF EXISTS tags_slug_key;
        `);
      } catch (error) {
        // Ignore if constraint doesn't exist
        console.log('[testing] No existing slug constraint to remove');
      }

      // Add unique constraint for slug per tenant
      await queryInterface.sequelize.query(`
        ALTER TABLE tags 
        ADD CONSTRAINT unique_tag_slug_per_tenant 
        UNIQUE (slug, tenant_id);
      `).catch(() => {});

      // Add indexes for tenant_id
      await queryInterface.addIndex('tags', ['tenant_id'], { name: 'idx_tags_tenant_id' });
      await queryInterface.addIndex('tags', ['slug', 'tenant_id'], { name: 'idx_tags_slug_tenant' });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove tenant_id column and related constraints/indexes from categories
    const categoriesTable = await queryInterface.describeTable('categories').catch(() => null);
    if (categoriesTable && categoriesTable.tenant_id) {
      // Remove unique constraint
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE categories 
          DROP CONSTRAINT IF EXISTS unique_category_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[testing] Error removing unique constraint:', error);
      }

      // Remove indexes
      try {
        await queryInterface.removeIndex('categories', 'idx_categories_tenant_id');
        await queryInterface.removeIndex('categories', 'idx_categories_slug_tenant');
      } catch (error) {
        console.log('[testing] Error removing indexes:', error);
      }

      // Remove column
      await queryInterface.removeColumn('categories', 'tenant_id');

      // Restore unique constraint on slug
      await queryInterface.sequelize.query(`
        ALTER TABLE categories 
        ADD CONSTRAINT categories_slug_key UNIQUE (slug);
      `).catch(() => {});
    }

    // Remove tenant_id column and related constraints/indexes from tags
    const tagsTable = await queryInterface.describeTable('tags').catch(() => null);
    if (tagsTable && tagsTable.tenant_id) {
      // Remove unique constraint
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE tags 
          DROP CONSTRAINT IF EXISTS unique_tag_slug_per_tenant;
        `);
      } catch (error) {
        console.log('[testing] Error removing unique constraint:', error);
      }

      // Remove indexes
      try {
        await queryInterface.removeIndex('tags', 'idx_tags_tenant_id');
        await queryInterface.removeIndex('tags', 'idx_tags_slug_tenant');
      } catch (error) {
        console.log('[testing] Error removing indexes:', error);
      }

      // Remove column
      await queryInterface.removeColumn('tags', 'tenant_id');

      // Restore unique constraint on slug
      await queryInterface.sequelize.query(`
        ALTER TABLE tags 
        ADD CONSTRAINT tags_slug_key UNIQUE (slug);
      `).catch(() => {});
    }
  }
};
