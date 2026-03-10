/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Add storage_name to tenants table
 * 
 * This migration adds storage_name column to tenants table to connect
 * each tenant to an individual storage.
 * The storage_name can be set via STORAGE_{TENANT_ID} env (e.g. on Vercel).
 */
export default {
  async up(queryInterface, Sequelize) {
    const tenantsTable = await queryInterface.describeTable('tenants').catch(() => null);
    if (tenantsTable && !tenantsTable.storage_name) {
      await queryInterface.addColumn('tenants', 'storage_name', {
        type: Sequelize.STRING(255),
        allowNull: true, // Allow NULL for tenants without storage configured
        comment: 'Storage name for connecting tenant to individual storage',
      });

      // Add index on storage_name for faster lookups
      await queryInterface.addIndex('tenants', ['storage_name'], {
        name: 'idx_tenants_storage_name',
        where: { storage_name: { [Sequelize.Op.ne]: null } }, // Partial index for non-null values
      });

      console.log('[migration] Added storage_name column to tenants table');
    }
  },

  async down(queryInterface, Sequelize) {
    const tenantsTable = await queryInterface.describeTable('tenants').catch(() => null);
    if (tenantsTable && tenantsTable.storage_name) {
      await queryInterface.removeIndex('tenants', 'idx_tenants_storage_name');
      await queryInterface.removeColumn('tenants', 'storage_name');
    }
  }
};

