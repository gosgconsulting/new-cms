/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add tenant_id column to contacts table
    const contactsTable = await queryInterface.describeTable('contacts');
    
    if (!contactsTable.tenant_id) {
      await queryInterface.addColumn('contacts', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
      
      // Create index for better query performance
      await queryInterface.addIndex('contacts', ['tenant_id'], {
        name: 'idx_contacts_tenant_id'
      });
      
      console.log('[testing] Added tenant_id column to contacts table');
    }
    
    // Add tenant_id column to form_submissions table if it doesn't exist
    const formSubmissionsTable = await queryInterface.describeTable('form_submissions').catch(() => null);
    
    if (formSubmissionsTable && !formSubmissionsTable.tenant_id) {
      await queryInterface.addColumn('form_submissions', 'tenant_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
      
      // Create index for better query performance
      await queryInterface.addIndex('form_submissions', ['tenant_id'], {
        name: 'idx_form_submissions_tenant_id'
      });
      
      console.log('[testing] Added tenant_id column to form_submissions table');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('contacts', 'idx_contacts_tenant_id').catch(() => {});
    await queryInterface.removeIndex('form_submissions', 'idx_form_submissions_tenant_id').catch(() => {});
    
    // Remove columns
    await queryInterface.removeColumn('contacts', 'tenant_id').catch(() => {});
    await queryInterface.removeColumn('form_submissions', 'tenant_id').catch(() => {});
    
    console.log('[testing] Removed tenant_id columns from contacts and form_submissions tables');
  }
};

