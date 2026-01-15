/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add subscription fields to products table
    const productsTable = await queryInterface.describeTable('products').catch(() => null);
    if (productsTable) {
      // Check if columns already exist
      const hasIsSubscription = productsTable.is_subscription;
      const hasSubscriptionFrequency = productsTable.subscription_frequency;

      if (!hasIsSubscription) {
        await queryInterface.addColumn('products', 'is_subscription', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        });
      }

      if (!hasSubscriptionFrequency) {
        await queryInterface.addColumn('products', 'subscription_frequency', {
          type: Sequelize.STRING(20),
          allowNull: true,
        });
      }
    }

    // Add subscription fields to pern_products table
    const pernProductsTable = await queryInterface.describeTable('pern_products').catch(() => null);
    if (pernProductsTable) {
      // Check if columns already exist
      const hasIsSubscription = pernProductsTable.is_subscription;
      const hasSubscriptionFrequency = pernProductsTable.subscription_frequency;

      if (!hasIsSubscription) {
        await queryInterface.addColumn('pern_products', 'is_subscription', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        });
      }

      if (!hasSubscriptionFrequency) {
        await queryInterface.addColumn('pern_products', 'subscription_frequency', {
          type: Sequelize.STRING(20),
          allowNull: true,
        });
      }

      // Also make description nullable if it's not already
      if (pernProductsTable.description && pernProductsTable.description.allowNull === false) {
        await queryInterface.changeColumn('pern_products', 'description', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove subscription fields from products table
    const productsTable = await queryInterface.describeTable('products').catch(() => null);
    if (productsTable) {
      if (productsTable.is_subscription) {
        await queryInterface.removeColumn('products', 'is_subscription');
      }
      if (productsTable.subscription_frequency) {
        await queryInterface.removeColumn('products', 'subscription_frequency');
      }
    }

    // Remove subscription fields from pern_products table
    const pernProductsTable = await queryInterface.describeTable('pern_products').catch(() => null);
    if (pernProductsTable) {
      if (pernProductsTable.is_subscription) {
        await queryInterface.removeColumn('pern_products', 'is_subscription');
      }
      if (pernProductsTable.subscription_frequency) {
        await queryInterface.removeColumn('pern_products', 'subscription_frequency');
      }
    }
  }
};
