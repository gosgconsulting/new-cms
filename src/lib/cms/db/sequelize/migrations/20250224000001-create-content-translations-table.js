/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        // Create content_translations table
        const table = await queryInterface.describeTable('content_translations').catch(() => null);
        if (!table) {
            await queryInterface.createTable('content_translations', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                tenant_id: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                content_type: {
                    type: Sequelize.STRING(50),
                    allowNull: false,
                    comment: 'page or post',
                },
                content_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                language: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                    comment: 'ISO language code, e.g. zh, ms, fr',
                },
                field_name: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    comment: 'Field being translated, e.g. title, content, excerpt, meta_title',
                },
                translated_value: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                source_hash: {
                    type: Sequelize.STRING(64),
                    allowNull: true,
                    comment: 'MD5 hash of source text for outdated detection',
                },
                status: {
                    type: Sequelize.STRING(20),
                    defaultValue: 'draft',
                    comment: 'draft, ai_generated, reviewed, published',
                },
                translated_by: {
                    type: Sequelize.STRING(50),
                    allowNull: true,
                    comment: 'ai, user, or user_id',
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

            // Composite unique constraint: one translation per field per content per language per tenant
            await queryInterface.addConstraint('content_translations', {
                fields: ['tenant_id', 'content_type', 'content_id', 'language', 'field_name'],
                type: 'unique',
                name: 'content_translations_unique_field',
            });

            // Index for looking up all translations for a specific content item in a language
            await queryInterface.addIndex('content_translations',
                ['tenant_id', 'content_type', 'content_id', 'language'],
                { name: 'idx_translations_lookup' }
            );

            // Index for translation status overview queries
            await queryInterface.addIndex('content_translations',
                ['tenant_id', 'language', 'status'],
                { name: 'idx_translations_status' }
            );

            // Index for content type filtering
            await queryInterface.addIndex('content_translations',
                ['tenant_id', 'content_type', 'status'],
                { name: 'idx_translations_type_status' }
            );
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('content_translations');
    }
};
