import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize blog database schema
 */
export async function initializeBlogSchema(tenantId = 'tenant-gosg') {
  console.log(`Initializing blog schema for tenant: ${tenantId}`);
  
  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'schemas', 'schema-blog.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Get connection from pool
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Create tenant schema if it doesn't exist
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${tenantId}"`);
      
      // Set search path to tenant schema
      await client.query(`SET search_path TO "${tenantId}"`);
      
      // Execute the schema SQL
      await client.query(schemaSql);
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log(`Blog schema initialized successfully for tenant: ${tenantId}`);
      return true;
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error(`Error initializing blog schema for tenant ${tenantId}:`, error);
      return false;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error(`Error reading blog schema file:`, error);
    return false;
  }
}

/**
 * Check if blog schema is initialized
 */
export async function isBlogSchemaInitialized(tenantId = 'tenant-gosg') {
  try {
    const client = await pool.connect();
    
    try {
      // Create tenant schema if it doesn't exist
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${tenantId}"`);
      
      // Set search path to tenant schema
      await client.query(`SET search_path TO "${tenantId}"`);
      
      // Check if posts table exists
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = 'posts'
        )
      `, [tenantId]);
      
      return result.rows[0].exists;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error checking blog schema for tenant ${tenantId}:`, error);
    return false;
  }
}

/**
 * Initialize blog schema if not already initialized
 */
export async function ensureBlogSchemaInitialized(tenantId = 'tenant-gosg') {
  const isInitialized = await isBlogSchemaInitialized(tenantId);
  
  if (!isInitialized) {
    return await initializeBlogSchema(tenantId);
  }
  
  console.log(`Blog schema already initialized for tenant: ${tenantId}`);
  return true;
}

// Allow running this directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tenantId = process.argv[2] || 'tenant-gosg';
  
  ensureBlogSchemaInitialized(tenantId)
    .then(success => {
      if (success) {
        console.log('Blog schema initialization complete');
      } else {
        console.error('Blog schema initialization failed');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error during blog schema initialization:', error);
      process.exit(1);
    });
}
