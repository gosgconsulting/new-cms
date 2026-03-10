/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Add stripe_publishable_key to tenants table
 * 
 * Stripe publishable keys cannot be derived from secret keys.
 * They must be stored separately.
 */
export default {
  async up(queryInterface, Sequelize) {
    const tenantsTable = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tenantsTable && !tenantsTable.stripe_publishable_key) {
      await queryInterface.addColumn('tenants', 'stripe_publishable_key', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Tenant-specific Stripe publishable key (pk_test_... or pk_live_...)',
      });
      console.log('[migration] Added stripe_publishable_key column to tenants');
    }
  },

  async down(queryInterface, Sequelize) {
    const tenantsTable = await queryInterface.describeTable('tenants').catch(() => null);
    
    if (tenantsTable && tenantsTable.stripe_publishable_key) {
      await queryInterface.removeColumn('tenants', 'stripe_publishable_key');
      console.log('[migration] Removed stripe_publishable_key column from tenants');
    }
  }
};
