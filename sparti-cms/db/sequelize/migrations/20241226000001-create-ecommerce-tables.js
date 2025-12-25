/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Ensure update_updated_at_column function exists
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create products table
    const productsTable = await queryInterface.describeTable('products').catch(() => null);
    if (!productsTable) {
      await queryInterface.createTable('products', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        handle: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'draft',
          allowNull: false,
        },
        featured_image: {
          type: Sequelize.TEXT,
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

      // Add unique constraint for handle per tenant
      await queryInterface.sequelize.query(`
        ALTER TABLE products 
        ADD CONSTRAINT unique_handle_per_tenant 
        UNIQUE (handle, tenant_id);
      `).catch(() => {});

      // Create indexes
      await queryInterface.addIndex('products', ['tenant_id'], { name: 'idx_products_tenant_id' });
      await queryInterface.addIndex('products', ['handle', 'tenant_id'], { 
        name: 'idx_products_handle_tenant',
        unique: true 
      });
      await queryInterface.addIndex('products', ['status'], { name: 'idx_products_status' });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
        CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create product_variants table
    const productVariantsTable = await queryInterface.describeTable('product_variants').catch(() => null);
    if (!productVariantsTable) {
      await queryInterface.createTable('product_variants', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        sku: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        compare_at_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        inventory_quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false,
        },
        inventory_management: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
      await queryInterface.addIndex('product_variants', ['product_id'], { name: 'idx_product_variants_product_id' });
      await queryInterface.addIndex('product_variants', ['tenant_id'], { name: 'idx_product_variants_tenant_id' });
      await queryInterface.addIndex('product_variants', ['sku'], { name: 'idx_product_variants_sku' });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
        CREATE TRIGGER update_product_variants_updated_at
        BEFORE UPDATE ON product_variants
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create product_categories table
    const productCategoriesTable = await queryInterface.describeTable('product_categories').catch(() => null);
    if (!productCategoriesTable) {
      await queryInterface.createTable('product_categories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        parent_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'product_categories',
            key: 'id',
          },
          onDelete: 'SET NULL',
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
        ALTER TABLE product_categories 
        ADD CONSTRAINT unique_category_slug_per_tenant 
        UNIQUE (slug, tenant_id);
      `).catch(() => {});

      // Create indexes
      await queryInterface.addIndex('product_categories', ['tenant_id'], { name: 'idx_product_categories_tenant_id' });
      await queryInterface.addIndex('product_categories', ['slug', 'tenant_id'], { 
        name: 'idx_product_categories_slug_tenant',
        unique: true 
      });
      await queryInterface.addIndex('product_categories', ['parent_id'], { name: 'idx_product_categories_parent_id' });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
        CREATE TRIGGER update_product_categories_updated_at
        BEFORE UPDATE ON product_categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create product_category_relations table (many-to-many)
    const productCategoryRelationsTable = await queryInterface.describeTable('product_category_relations').catch(() => null);
    if (!productCategoryRelationsTable) {
      await queryInterface.createTable('product_category_relations', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        category_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'product_categories',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create indexes
      await queryInterface.addIndex('product_category_relations', ['product_id'], { name: 'idx_product_category_relations_product_id' });
      await queryInterface.addIndex('product_category_relations', ['category_id'], { name: 'idx_product_category_relations_category_id' });
      
      // Add unique constraint to prevent duplicate relations
      await queryInterface.sequelize.query(`
        ALTER TABLE product_category_relations 
        ADD CONSTRAINT unique_product_category_relation 
        UNIQUE (product_id, category_id);
      `).catch(() => {});
    }

    // Create orders table
    const ordersTable = await queryInterface.describeTable('orders').catch(() => null);
    if (!ordersTable) {
      await queryInterface.createTable('orders', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        order_number: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        customer_email: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        customer_first_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        customer_last_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'pending',
          allowNull: false,
        },
        subtotal: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        tax_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        shipping_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        total_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        stripe_payment_intent_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        stripe_charge_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        shipping_address: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        billing_address: {
          type: Sequelize.JSONB,
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
      await queryInterface.addIndex('orders', ['tenant_id'], { name: 'idx_orders_tenant_id' });
      await queryInterface.addIndex('orders', ['order_number'], { name: 'idx_orders_order_number', unique: true });
      await queryInterface.addIndex('orders', ['status'], { name: 'idx_orders_status' });
      await queryInterface.addIndex('orders', ['customer_email'], { name: 'idx_orders_customer_email' });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
        CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create order_items table
    const orderItemsTable = await queryInterface.describeTable('order_items').catch(() => null);
    if (!orderItemsTable) {
      await queryInterface.createTable('order_items', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'orders',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
        variant_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'product_variants',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        unit_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        total_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create indexes
      await queryInterface.addIndex('order_items', ['order_id'], { name: 'idx_order_items_order_id' });
      await queryInterface.addIndex('order_items', ['product_id'], { name: 'idx_order_items_product_id' });
      await queryInterface.addIndex('order_items', ['variant_id'], { name: 'idx_order_items_variant_id' });
    }

    // Add Stripe Connect columns to tenants table
    const tenantsTable = await queryInterface.describeTable('tenants');
    const hasStripeConnectAccountId = tenantsTable.stripe_connect_account_id !== undefined;
    const hasStripeConnectOnboardingCompleted = tenantsTable.stripe_connect_onboarding_completed !== undefined;

    if (!hasStripeConnectAccountId) {
      await queryInterface.addColumn('tenants', 'stripe_connect_account_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!hasStripeConnectOnboardingCompleted) {
      await queryInterface.addColumn('tenants', 'stripe_connect_onboarding_completed', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('product_category_relations');
    await queryInterface.dropTable('product_categories');
    await queryInterface.dropTable('product_variants');
    await queryInterface.dropTable('products');
    
    // Remove Stripe Connect columns from tenants
    const tenantsTable = await queryInterface.describeTable('tenants');
    if (tenantsTable.stripe_connect_account_id) {
      await queryInterface.removeColumn('tenants', 'stripe_connect_account_id');
    }
    if (tenantsTable.stripe_connect_onboarding_completed) {
      await queryInterface.removeColumn('tenants', 'stripe_connect_onboarding_completed');
    }
  }
};


