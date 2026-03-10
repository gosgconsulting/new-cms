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

    // Create components table
    const componentsTable = await queryInterface.describeTable('components').catch(() => null);
    if (!componentsTable) {
      await queryInterface.createTable('components', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        category: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        content: {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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

      await queryInterface.addIndex('components', ['type'], { name: 'idx_components_type' });
      await queryInterface.addIndex('components', ['category'], { name: 'idx_components_category' });
      await queryInterface.addIndex('components', ['is_active'], { name: 'idx_components_active' });
    }

    // Create media_folders table
    const mediaFoldersTable = await queryInterface.describeTable('media_folders').catch(() => null);
    if (!mediaFoldersTable) {
      await queryInterface.createTable('media_folders', {
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
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        parent_folder_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'media_folders',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        folder_path: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_media_folders_updated_at ON media_folders;
        CREATE TRIGGER update_media_folders_updated_at 
        BEFORE UPDATE ON media_folders 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      await queryInterface.addIndex('media_folders', ['slug'], { name: 'idx_media_folders_slug' });
      await queryInterface.addIndex('media_folders', ['parent_folder_id'], { name: 'idx_media_folders_parent' });
      await queryInterface.addIndex('media_folders', ['folder_path'], { name: 'idx_media_folders_path' });
      await queryInterface.addIndex('media_folders', ['is_active'], { name: 'idx_media_folders_active' });
    }

    // Create media table
    const mediaTable = await queryInterface.describeTable('media').catch(() => null);
    if (!mediaTable) {
      await queryInterface.createTable('media', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        filename: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        original_filename: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        alt_text: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        url: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        relative_path: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        mime_type: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        file_extension: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        file_size: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        width: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        height: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        duration: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        folder_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'media_folders',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        media_type: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        is_featured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        seo_optimized: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        usage_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        last_used_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true,
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

      // Add check constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE media ADD CONSTRAINT media_media_type_check 
        CHECK (media_type IN ('image', 'video', 'audio', 'document', 'other'));
      `).catch(() => {});

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_media_updated_at ON media;
        CREATE TRIGGER update_media_updated_at 
        BEFORE UPDATE ON media 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      await queryInterface.addIndex('media', ['slug'], { name: 'idx_media_slug' });
      await queryInterface.addIndex('media', ['filename'], { name: 'idx_media_filename' });
      await queryInterface.addIndex('media', ['folder_id'], { name: 'idx_media_folder' });
      await queryInterface.addIndex('media', ['media_type'], { name: 'idx_media_type' });
      await queryInterface.addIndex('media', ['mime_type'], { name: 'idx_media_mime_type' });
      await queryInterface.addIndex('media', ['is_active'], { name: 'idx_media_active' });
      await queryInterface.addIndex('media', ['is_featured'], { name: 'idx_media_featured' });
      await queryInterface.addIndex('media', ['created_at'], { name: 'idx_media_created' });
      await queryInterface.addIndex('media', ['usage_count'], { name: 'idx_media_usage_count' });
    }

    // Create media_usage table
    const mediaUsageTable = await queryInterface.describeTable('media_usage').catch(() => null);
    if (!mediaUsageTable) {
      await queryInterface.createTable('media_usage', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        media_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'media',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        usage_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        usage_id: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        usage_context: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.addIndex('media_usage', ['media_id'], { name: 'idx_media_usage_media_id' });
      await queryInterface.addIndex('media_usage', ['usage_type'], { name: 'idx_media_usage_type' });
      await queryInterface.addIndex('media_usage', ['usage_type', 'usage_id'], { name: 'idx_media_usage_context' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('media_usage');
    await queryInterface.dropTable('media');
    await queryInterface.dropTable('media_folders');
    await queryInterface.dropTable('components');
  }
};

