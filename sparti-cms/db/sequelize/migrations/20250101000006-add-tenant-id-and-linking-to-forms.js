/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Add tenant_id to forms table and database linking fields to form_fields
 * 
 * This migration makes forms tenant-based and adds support for linking form fields
 * to database tables (contacts, messages).
 */
export default {
  async up(queryInterface, Sequelize) {
    // Add tenant_id to forms table
    const formsTable = await queryInterface.describeTable('forms').catch(() => null);
    if (formsTable && !formsTable.tenant_id) {
      await queryInterface.addColumn('forms', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'tenant-gosg', // Default for existing records
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      });

      // Add index on tenant_id
      await queryInterface.addIndex('forms', ['tenant_id'], {
        name: 'idx_forms_tenant_id',
      });

      console.log('[migration] Added tenant_id column to forms table');
    }

    // Add database linking fields to form_fields table (if it exists)
    const formFieldsTable = await queryInterface.describeTable('form_fields').catch(() => null);
    if (formFieldsTable) {
      if (!formFieldsTable.links_to_table) {
        await queryInterface.addColumn('form_fields', 'links_to_table', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Database table this field links to (e.g., contacts, messages)',
        });
      }

      if (!formFieldsTable.links_to_field) {
        await queryInterface.addColumn('form_fields', 'links_to_field', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Database field this form field maps to (e.g., full_name, email, phone, message)',
        });
      }

      console.log('[migration] Added database linking fields to form_fields table');
    }

    // Note: If forms table uses JSONB for fields (as per docs), the linking info
    // will be stored in the JSONB fields column, so the form_fields table might not exist.
    // The migration handles both cases.
  },

  async down(queryInterface, Sequelize) {
    // Remove database linking fields from form_fields
    const formFieldsTable = await queryInterface.describeTable('form_fields').catch(() => null);
    if (formFieldsTable) {
      if (formFieldsTable.links_to_table) {
        await queryInterface.removeColumn('form_fields', 'links_to_table');
      }
      if (formFieldsTable.links_to_field) {
        await queryInterface.removeColumn('form_fields', 'links_to_field');
      }
    }

    // Remove tenant_id from forms table
    const formsTable = await queryInterface.describeTable('forms').catch(() => null);
    if (formsTable && formsTable.tenant_id) {
      await queryInterface.removeIndex('forms', 'idx_forms_tenant_id');
      await queryInterface.removeColumn('forms', 'tenant_id');
    }
  }
};

