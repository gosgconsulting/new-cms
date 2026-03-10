/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add tenant-specific Stripe keys to tenants table
    const tenantsTable = await queryInterface.describeTable('tenants');
    const hasStripeSecretKey = tenantsTable.stripe_secret_key !== undefined;
    const hasStripeWebhookSecret = tenantsTable.stripe_webhook_secret !== undefined;

    if (!hasStripeSecretKey) {
      await queryInterface.addColumn('tenants', 'stripe_secret_key', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Tenant-specific Stripe secret key (encrypted)',
      });
    }

    if (!hasStripeWebhookSecret) {
      await queryInterface.addColumn('tenants', 'stripe_webhook_secret', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Tenant-specific Stripe webhook secret (encrypted)',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns if migration is rolled back
    const tenantsTable = await queryInterface.describeTable('tenants');
    
    if (tenantsTable.stripe_secret_key !== undefined) {
      await queryInterface.removeColumn('tenants', 'stripe_secret_key');
    }

    if (tenantsTable.stripe_webhook_secret !== undefined) {
      await queryInterface.removeColumn('tenants', 'stripe_webhook_secret');
    }
  },
};
