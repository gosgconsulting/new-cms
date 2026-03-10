/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add external_id and external_source to products table
    const productsTable = await queryInterface.describeTable('products').catch(() => null);
    if (productsTable) {
      // Check if external_id column exists
      if (!productsTable.external_id) {
        await queryInterface.addColumn('products', 'external_id', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'External product ID (e.g., WooCommerce product ID)'
        });
      }

      // Check if external_source column exists
      if (!productsTable.external_source) {
        await queryInterface.addColumn('products', 'external_source', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'External source identifier (e.g., "woocommerce")'
        });
      }

      // Create index for external lookups
      const indexes = await queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'products' AND indexname = 'idx_products_external'
      `);
      
      if (indexes[0].length === 0) {
        await queryInterface.addIndex('products', ['external_id', 'external_source', 'tenant_id'], {
          name: 'idx_products_external',
          unique: false
        });
      }
    }

    // Add external_id and external_source to orders table
    const ordersTable = await queryInterface.describeTable('orders').catch(() => null);
    if (ordersTable) {
      // Check if external_id column exists
      if (!ordersTable.external_id) {
        await queryInterface.addColumn('orders', 'external_id', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'External order ID (e.g., WooCommerce order ID)'
        });
      }

      // Check if external_source column exists
      if (!ordersTable.external_source) {
        await queryInterface.addColumn('orders', 'external_source', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'External source identifier (e.g., "woocommerce")'
        });
      }

      // Create index for external lookups
      const orderIndexes = await queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'orders' AND indexname = 'idx_orders_external'
      `);
      
      if (orderIndexes[0].length === 0) {
        await queryInterface.addIndex('orders', ['external_id', 'external_source', 'tenant_id'], {
          name: 'idx_orders_external',
          unique: false
        });
      }
    }

    // Add external_id and external_source to product_categories table (optional, for category sync)
    const categoriesTable = await queryInterface.describeTable('product_categories').catch(() => null);
    if (categoriesTable) {
      if (!categoriesTable.external_id) {
        await queryInterface.addColumn('product_categories', 'external_id', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'External category ID (e.g., WooCommerce category ID)'
        });
      }

      if (!categoriesTable.external_source) {
        await queryInterface.addColumn('product_categories', 'external_source', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'External source identifier (e.g., "woocommerce")'
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('products', 'idx_products_external');
    } catch (error) {
      console.warn('[testing] Index idx_products_external may not exist:', error.message);
    }

    try {
      await queryInterface.removeIndex('orders', 'idx_orders_external');
    } catch (error) {
      console.warn('[testing] Index idx_orders_external may not exist:', error.message);
    }

    // Remove columns from products
    const productsTable = await queryInterface.describeTable('products').catch(() => null);
    if (productsTable) {
      if (productsTable.external_id) {
        await queryInterface.removeColumn('products', 'external_id');
      }
      if (productsTable.external_source) {
        await queryInterface.removeColumn('products', 'external_source');
      }
    }

    // Remove columns from orders
    const ordersTable = await queryInterface.describeTable('orders').catch(() => null);
    if (ordersTable) {
      if (ordersTable.external_id) {
        await queryInterface.removeColumn('orders', 'external_id');
      }
      if (ordersTable.external_source) {
        await queryInterface.removeColumn('orders', 'external_source');
      }
    }

    // Remove columns from product_categories
    const categoriesTable = await queryInterface.describeTable('product_categories').catch(() => null);
    if (categoriesTable) {
      if (categoriesTable.external_id) {
        await queryInterface.removeColumn('product_categories', 'external_id');
      }
      if (categoriesTable.external_source) {
        await queryInterface.removeColumn('product_categories', 'external_source');
      }
    }
  }
};
