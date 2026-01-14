/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create payment enum type
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE payment AS ENUM ('PAYSTACK', 'STRIPE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `).catch(() => {});

    // Create products table (PERN-Store schema)
    const productsTable = await queryInterface.describeTable('pern_products').catch(() => null);
    if (!productsTable) {
      await queryInterface.createTable('pern_products', {
        product_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        price: {
          type: Sequelize.REAL,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        image_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
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

      // Add unique constraint for slug per tenant
      await queryInterface.sequelize.query(`
        ALTER TABLE pern_products 
        ADD CONSTRAINT unique_slug_per_tenant 
        UNIQUE (slug, tenant_id);
      `).catch(() => {});

      // Create indexes
      await queryInterface.addIndex('pern_products', ['tenant_id'], { 
        name: 'idx_pern_products_tenant_id' 
      });
      await queryInterface.addIndex('pern_products', ['slug', 'tenant_id'], { 
        name: 'idx_pern_products_slug_tenant',
        unique: true 
      });
    }

    // Create cart table
    const cartTable = await queryInterface.describeTable('pern_cart').catch(() => null);
    if (!cartTable) {
      await queryInterface.createTable('pern_cart', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
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

      // Create indexes
      await queryInterface.addIndex('pern_cart', ['user_id'], { 
        name: 'idx_pern_cart_user_id' 
      });
      await queryInterface.addIndex('pern_cart', ['tenant_id'], { 
        name: 'idx_pern_cart_tenant_id' 
      });
      await queryInterface.addIndex('pern_cart', ['user_id', 'tenant_id'], { 
        name: 'idx_pern_cart_user_tenant' 
      });
    }

    // Create cart_item table
    const cartItemTable = await queryInterface.describeTable('pern_cart_item').catch(() => null);
    if (!cartItemTable) {
      await queryInterface.createTable('pern_cart_item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        cart_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pern_cart',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pern_products',
            key: 'product_id',
          },
          onDelete: 'CASCADE',
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
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

      // Create indexes
      await queryInterface.addIndex('pern_cart_item', ['cart_id'], { 
        name: 'idx_pern_cart_item_cart_id' 
      });
      await queryInterface.addIndex('pern_cart_item', ['product_id'], { 
        name: 'idx_pern_cart_item_product_id' 
      });
      await queryInterface.addIndex('pern_cart_item', ['tenant_id'], { 
        name: 'idx_pern_cart_item_tenant_id' 
      });
    }

    // Create orders table
    const ordersTable = await queryInterface.describeTable('pern_orders').catch(() => null);
    if (!ordersTable) {
      await queryInterface.createTable('pern_orders', {
        order_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        status: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        amount: {
          type: Sequelize.REAL,
          allowNull: true,
        },
        total: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        ref: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        payment_method: {
          type: Sequelize.ENUM('PAYSTACK', 'STRIPE'),
          allowNull: true,
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
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

      // Create indexes
      await queryInterface.addIndex('pern_orders', ['user_id'], { 
        name: 'idx_pern_orders_user_id' 
      });
      await queryInterface.addIndex('pern_orders', ['tenant_id'], { 
        name: 'idx_pern_orders_tenant_id' 
      });
      await queryInterface.addIndex('pern_orders', ['status'], { 
        name: 'idx_pern_orders_status' 
      });
      await queryInterface.addIndex('pern_orders', ['date'], { 
        name: 'idx_pern_orders_date' 
      });
    }

    // Create order_item table
    const orderItemTable = await queryInterface.describeTable('pern_order_item').catch(() => null);
    if (!orderItemTable) {
      await queryInterface.createTable('pern_order_item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pern_orders',
            key: 'order_id',
          },
          onDelete: 'CASCADE',
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pern_products',
            key: 'product_id',
          },
          onDelete: 'CASCADE',
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
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

      // Create indexes
      await queryInterface.addIndex('pern_order_item', ['order_id'], { 
        name: 'idx_pern_order_item_order_id' 
      });
      await queryInterface.addIndex('pern_order_item', ['product_id'], { 
        name: 'idx_pern_order_item_product_id' 
      });
      await queryInterface.addIndex('pern_order_item', ['tenant_id'], { 
        name: 'idx_pern_order_item_tenant_id' 
      });
    }

    // Create reviews table
    const reviewsTable = await queryInterface.describeTable('pern_reviews').catch(() => null);
    if (!reviewsTable) {
      await queryInterface.createTable('pern_reviews', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pern_products',
            key: 'product_id',
          },
          onDelete: 'CASCADE',
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        rating: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_DATE'),
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
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

      // Create composite unique constraint (user_id, product_id, tenant_id)
      await queryInterface.sequelize.query(`
        ALTER TABLE pern_reviews 
        ADD CONSTRAINT unique_user_product_tenant 
        UNIQUE (user_id, product_id, tenant_id);
      `).catch(() => {});

      // Create indexes
      await queryInterface.addIndex('pern_reviews', ['product_id'], { 
        name: 'idx_pern_reviews_product_id' 
      });
      await queryInterface.addIndex('pern_reviews', ['user_id'], { 
        name: 'idx_pern_reviews_user_id' 
      });
      await queryInterface.addIndex('pern_reviews', ['tenant_id'], { 
        name: 'idx_pern_reviews_tenant_id' 
      });
      await queryInterface.addIndex('pern_reviews', ['rating'], { 
        name: 'idx_pern_reviews_rating' 
      });
    }

    // Create triggers for updated_at
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_pern_products_updated_at ON pern_products;
      CREATE TRIGGER update_pern_products_updated_at
      BEFORE UPDATE ON pern_products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `).catch(() => {});

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_pern_cart_updated_at ON pern_cart;
      CREATE TRIGGER update_pern_cart_updated_at
      BEFORE UPDATE ON pern_cart
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `).catch(() => {});

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_pern_cart_item_updated_at ON pern_cart_item;
      CREATE TRIGGER update_pern_cart_item_updated_at
      BEFORE UPDATE ON pern_cart_item
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `).catch(() => {});

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_pern_orders_updated_at ON pern_orders;
      CREATE TRIGGER update_pern_orders_updated_at
      BEFORE UPDATE ON pern_orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `).catch(() => {});

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_pern_order_item_updated_at ON pern_order_item;
      CREATE TRIGGER update_pern_order_item_updated_at
      BEFORE UPDATE ON pern_order_item
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `).catch(() => {});

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_pern_reviews_updated_at ON pern_reviews;
      CREATE TRIGGER update_pern_reviews_updated_at
      BEFORE UPDATE ON pern_reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `).catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (respecting foreign keys)
    await queryInterface.dropTable('pern_reviews').catch(() => {});
    await queryInterface.dropTable('pern_order_item').catch(() => {});
    await queryInterface.dropTable('pern_orders').catch(() => {});
    await queryInterface.dropTable('pern_cart_item').catch(() => {});
    await queryInterface.dropTable('pern_cart').catch(() => {});
    await queryInterface.dropTable('pern_products').catch(() => {});
    
    // Drop enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS payment;
    `).catch(() => {});
  }
};
