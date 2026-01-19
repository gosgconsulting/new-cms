import { getPool } from '../../sparti-cms/db/connection.js';

/**
 * Transaction Utilities
 * Provides transaction support for database operations
 */

/**
 * Execute operations within a transaction
 * Automatically commits on success or rolls back on error
 * 
 * @param {Function} callback - Async function that receives the client
 * @returns {Promise<any>} Result of the callback
 * 
 * @example
 * const result = await withTransaction(async (client) => {
 *   await client.query('INSERT INTO users ...');
 *   await client.query('INSERT INTO profiles ...');
 *   return { success: true };
 * });
 */
export async function withTransaction(callback) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');
    console.log('[Transaction] Started');

    // Execute callback with client
    const result = await callback(client);

    // Commit transaction
    await client.query('COMMIT');
    console.log('[Transaction] Committed');

    return result;
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('[Transaction] Rolled back due to error:', error);
    throw error;
  } finally {
    // Release client back to pool
    client.release();
  }
}

/**
 * Execute operations within a transaction with savepoint support
 * Allows nested transactions using savepoints
 * 
 * @param {Function} callback - Async function that receives the client and savepoint name
 * @param {string} savepointName - Name of the savepoint
 * @returns {Promise<any>} Result of the callback
 * 
 * @example
 * await withSavepoint(async (client, savepoint) => {
 *   await client.query('INSERT INTO table1 ...');
 *   try {
 *     await client.query('INSERT INTO table2 ...');
 *   } catch (error) {
 *     await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
 *   }
 * }, 'sp1');
 */
export async function withSavepoint(callback, savepointName = 'sp1') {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');
    console.log('[Transaction] Started with savepoint');

    // Create savepoint
    await client.query(`SAVEPOINT ${savepointName}`);
    console.log(`[Transaction] Savepoint '${savepointName}' created`);

    // Execute callback
    const result = await callback(client, savepointName);

    // Commit transaction
    await client.query('COMMIT');
    console.log('[Transaction] Committed');

    return result;
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('[Transaction] Rolled back due to error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create a transaction manager for manual control
 * Use when you need fine-grained control over transaction lifecycle
 * 
 * @returns {Promise<TransactionManager>}
 * 
 * @example
 * const txn = await createTransaction();
 * try {
 *   await txn.query('INSERT INTO ...');
 *   await txn.query('UPDATE ...');
 *   await txn.commit();
 * } catch (error) {
 *   await txn.rollback();
 * } finally {
 *   txn.release();
 * }
 */
export async function createTransaction() {
  const pool = getPool();
  const client = await pool.connect();

  let isActive = true;

  await client.query('BEGIN');
  console.log('[Transaction] Manual transaction started');

  return {
    /**
     * Execute a query within the transaction
     */
    query: async (text, params) => {
      if (!isActive) {
        throw new Error('Transaction is not active');
      }
      return await client.query(text, params);
    },

    /**
     * Commit the transaction
     */
    commit: async () => {
      if (!isActive) {
        throw new Error('Transaction is not active');
      }
      await client.query('COMMIT');
      console.log('[Transaction] Manual transaction committed');
      isActive = false;
    },

    /**
     * Rollback the transaction
     */
    rollback: async () => {
      if (!isActive) {
        throw new Error('Transaction is not active');
      }
      await client.query('ROLLBACK');
      console.log('[Transaction] Manual transaction rolled back');
      isActive = false;
    },

    /**
     * Create a savepoint
     */
    savepoint: async (name) => {
      if (!isActive) {
        throw new Error('Transaction is not active');
      }
      await client.query(`SAVEPOINT ${name}`);
      console.log(`[Transaction] Savepoint '${name}' created`);
    },

    /**
     * Rollback to a savepoint
     */
    rollbackToSavepoint: async (name) => {
      if (!isActive) {
        throw new Error('Transaction is not active');
      }
      await client.query(`ROLLBACK TO SAVEPOINT ${name}`);
      console.log(`[Transaction] Rolled back to savepoint '${name}'`);
    },

    /**
     * Release the client back to the pool
     * Must be called after commit or rollback
     */
    release: () => {
      client.release();
      console.log('[Transaction] Client released');
    },

    /**
     * Check if transaction is still active
     */
    isActive: () => isActive,

    /**
     * Get the underlying client
     * Use with caution
     */
    getClient: () => client
  };
}

/**
 * Execute multiple operations in parallel within a transaction
 * All operations must succeed or all will be rolled back
 * 
 * @param {Array<Function>} operations - Array of async functions
 * @returns {Promise<Array>} Results of all operations
 * 
 * @example
 * const results = await transactionBatch([
 *   (client) => client.query('INSERT INTO table1 ...'),
 *   (client) => client.query('INSERT INTO table2 ...'),
 *   (client) => client.query('INSERT INTO table3 ...')
 * ]);
 */
export async function transactionBatch(operations) {
  return await withTransaction(async (client) => {
    return await Promise.all(
      operations.map(operation => operation(client))
    );
  });
}

/**
 * Execute operations in sequence within a transaction
 * Each operation receives the result of the previous operation
 * 
 * @param {Array<Function>} operations - Array of async functions
 * @returns {Promise<any>} Result of the last operation
 * 
 * @example
 * const result = await transactionSequence([
 *   (client) => client.query('INSERT INTO users ... RETURNING id'),
 *   (client, prevResult) => client.query('INSERT INTO profiles (user_id) VALUES ($1)', [prevResult.rows[0].id])
 * ]);
 */
export async function transactionSequence(operations) {
  return await withTransaction(async (client) => {
    let result = null;
    
    for (const operation of operations) {
      result = await operation(client, result);
    }
    
    return result;
  });
}

/**
 * Retry a transaction on deadlock or serialization failure
 * 
 * @param {Function} callback - Transaction callback
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryDelay - Delay between retries in ms
 * @returns {Promise<any>}
 */
export async function withTransactionRetry(callback, maxRetries = 3, retryDelay = 100) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback);
    } catch (error) {
      lastError = error;
      
      // Retry on deadlock or serialization failure
      const shouldRetry = 
        error.code === '40P01' || // deadlock_detected
        error.code === '40001';    // serialization_failure
      
      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`[Transaction] Retry attempt ${attempt}/${maxRetries} after error:`, error.code);
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw lastError;
}
