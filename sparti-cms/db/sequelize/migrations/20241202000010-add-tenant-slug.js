/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if slug column already exists
    const tableDescription = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tableDescription && !tableDescription.slug) {
      // Add slug column
      await queryInterface.addColumn('tenants', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      });

      // Create index on slug for fast lookups
      await queryInterface.addIndex('tenants', ['slug'], {
        name: 'idx_tenants_slug',
        unique: true,
      });

      // Migrate existing tenants: generate slugs from folder names or tenant names
      // For now, we'll generate slugs from tenant names (lowercase, replace spaces with hyphens)
      await queryInterface.sequelize.query(`
        UPDATE tenants
        SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
        WHERE slug IS NULL;
      `);

      // For tenants that might have duplicate slugs, append their id
      await queryInterface.sequelize.query(`
        UPDATE tenants t1
        SET slug = t1.slug || '-' || SUBSTRING(t1.id, 1, 8)
        WHERE EXISTS (
          SELECT 1 FROM tenants t2
          WHERE t2.slug = t1.slug AND t2.id != t1.id
        );
      `);

      // Make slug NOT NULL after migration
      await queryInterface.changeColumn('tenants', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('tenants', 'idx_tenants_slug').catch(() => null);
    
    // Remove slug column
    await queryInterface.removeColumn('tenants', 'slug').catch(() => null);
  }
};

