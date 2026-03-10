/** @type {import('sequelize-cli').Migration} */
/**
 * Migration: Allow guest orders in pern_orders table
 * 
 * This migration updates pern_orders table to allow NULL user_id
 * for guest checkout orders, and adds guest_email and guest_name fields.
 */
export default {
  async up(queryInterface, Sequelize) {
    const ordersTable = await queryInterface.describeTable('pern_orders').catch(() => null);
    
    if (ordersTable) {
      // Check if user_id already allows NULL
      const [columnInfo] = await queryInterface.sequelize.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'pern_orders' 
        AND column_name = 'user_id'
      `);
      
      if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
        // Drop foreign key constraint first
        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE pern_orders 
            DROP CONSTRAINT IF EXISTS pern_orders_user_id_fkey;
          `);
          console.log('[migration] Dropped foreign key constraint on pern_orders.user_id');
        } catch (error) {
          console.log('[migration] No foreign key constraint to remove or already removed');
        }
        
        // Remove the NOT NULL constraint
        await queryInterface.sequelize.query(`
          ALTER TABLE pern_orders 
          ALTER COLUMN user_id DROP NOT NULL;
        `);
        
        // Re-add foreign key constraint with ON DELETE SET NULL for safety
        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE pern_orders 
            ADD CONSTRAINT pern_orders_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE SET NULL;
          `);
          console.log('[migration] Re-added foreign key constraint with ON DELETE SET NULL');
        } catch (error) {
          console.log('[migration] Could not re-add foreign key constraint:', error.message);
        }
        
        console.log('[migration] Updated pern_orders.user_id to allow NULL for guest orders');
      }
      
      // Add guest_email column if it doesn't exist
      if (!ordersTable.guest_email) {
        await queryInterface.addColumn('pern_orders', 'guest_email', {
          type: Sequelize.STRING(255),
          allowNull: true,
        });
        console.log('[migration] Added guest_email column to pern_orders');
      }
      
      // Add guest_name column if it doesn't exist
      if (!ordersTable.guest_name) {
        await queryInterface.addColumn('pern_orders', 'guest_name', {
          type: Sequelize.STRING(255),
          allowNull: true,
        });
        console.log('[migration] Added guest_name column to pern_orders');
      }
      
      console.log('[migration] Migration complete: pern_orders now supports guest orders');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert: Set user_id back to NOT NULL
    // Note: This will fail if there are any NULL values
    
    const ordersTable = await queryInterface.describeTable('pern_orders').catch(() => null);
    
    if (ordersTable) {
      // Remove guest columns
      if (ordersTable.guest_email) {
        await queryInterface.removeColumn('pern_orders', 'guest_email');
        console.log('[migration] Removed guest_email column');
      }
      
      if (ordersTable.guest_name) {
        await queryInterface.removeColumn('pern_orders', 'guest_name');
        console.log('[migration] Removed guest_name column');
      }
      
      // Set user_id back to NOT NULL (will fail if NULL values exist)
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE pern_orders 
          ALTER COLUMN user_id SET NOT NULL;
        `);
        console.log('[migration] Reverted pern_orders.user_id to NOT NULL');
      } catch (error) {
        console.error('[migration] Could not revert user_id to NOT NULL. Please remove NULL values first:', error.message);
        throw error;
      }
    }
  }
};
