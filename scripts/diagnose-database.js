#!/usr/bin/env node

/**
 * Database Diagnostic Script
 * 
 * This script tests database connectivity and provides actionable error messages
 * to help diagnose login and database connection issues.
 * 
 * Usage: node scripts/diagnose-database.js
 */

import 'dotenv/config';
import { query, testConnection, getConnectionInfo, getPoolStatus } from '../sparti-cms/db/connection.js';
import { getDatabaseState, verifyUsersTableExists, testDatabaseQuery } from '../server/utils/database.js';

console.log('========================================');
console.log('Database Diagnostic Tool');
console.log('========================================\n');

async function runDiagnostics() {
  const results = {
    connection: null,
    usersTable: null,
    sampleQuery: null,
    poolStatus: null,
    environment: null,
    recommendations: []
  };

  // 1. Check environment variables
  console.log('1. Checking environment variables...');
  const connInfo = getConnectionInfo();
  results.environment = connInfo;
  
  if (!connInfo.hasConnectionString) {
    console.error('   ❌ ERROR: No DATABASE_URL found!');
    results.recommendations.push({
      issue: 'Missing database connection string',
      solution: 'Set DATABASE_URL environment variable',
      command: 'Add to .env file: DATABASE_URL=postgresql://user:password@host:port/database'
    });
  } else {
    console.log(`   ✓ Connection string found (source: ${connInfo.source})`);
    console.log(`   - Host: ${connInfo.host || 'unknown'}`);
    console.log(`   - Port: ${connInfo.port || 'unknown'}`);
    console.log(`   - Database: ${connInfo.database || 'unknown'}`);
    console.log(`   - User: ${connInfo.user || 'unknown'}`);
  }
  console.log('');

  // 2. Test database connection
  console.log('2. Testing database connection...');
  try {
    results.connection = await testConnection();
    if (results.connection.success) {
      console.log('   ✓ Connection successful!');
      console.log(`   - PostgreSQL version: ${results.connection.postgresVersion?.split(' ')[0] || 'unknown'}`);
      console.log(`   - Current time: ${results.connection.currentTime}`);
    } else {
      console.error('   ❌ Connection failed!');
      console.error(`   - Error: ${results.connection.error?.message || 'Unknown error'}`);
      console.error(`   - Code: ${results.connection.error?.code || 'N/A'}`);
      
      if (results.connection.error?.code === 'ECONNREFUSED') {
        results.recommendations.push({
          issue: 'Connection refused',
          solution: 'Database server is not running or not accessible',
          command: 'Check if PostgreSQL is running and accessible at the specified host/port'
        });
      } else if (results.connection.error?.code === 'ETIMEDOUT') {
        results.recommendations.push({
          issue: 'Connection timeout',
          solution: 'Database server is not responding',
          command: 'Check network connectivity and firewall settings'
        });
      } else if (results.connection.error?.code === 'ENOTFOUND') {
        results.recommendations.push({
          issue: 'Host not found',
          solution: 'Invalid database hostname',
          command: 'Verify DATABASE_URL hostname is correct'
        });
      } else {
        results.recommendations.push({
          issue: 'Connection error',
          solution: 'Check database credentials and connection string',
          command: 'Verify DATABASE_URL format: postgresql://user:password@host:port/database'
        });
      }
    }
  } catch (error) {
    console.error('   ❌ Connection test error:', error.message);
    results.connection = {
      success: false,
      error: { message: error.message, code: error.code }
    };
  }
  console.log('');

  // 3. Check database initialization state
  console.log('3. Checking database initialization state...');
  const dbState = getDatabaseState();
  console.log(`   - Initialized: ${dbState.dbInitialized ? 'Yes' : 'No'}`);
  if (dbState.dbInitializationError) {
    console.error(`   - Error: ${dbState.dbInitializationError.message}`);
  }
  console.log('');

  // 4. Check pool status
  console.log('4. Checking connection pool status...');
  const poolStatus = getPoolStatus();
  results.poolStatus = poolStatus;
  if (poolStatus.initialized) {
    console.log(`   ✓ Pool initialized`);
    console.log(`   - Total connections: ${poolStatus.totalCount}`);
    console.log(`   - Idle connections: ${poolStatus.idleCount}`);
    console.log(`   - Waiting requests: ${poolStatus.waitingCount}`);
  } else {
    console.log('   - Pool not initialized');
  }
  console.log('');

  // 5. Check if users table exists (only if connection is successful)
  if (results.connection && results.connection.success) {
    console.log('5. Checking if users table exists...');
    results.usersTable = await verifyUsersTableExists();
    if (results.usersTable.exists) {
      console.log('   ✓ Users table exists');
    } else {
      console.error('   ❌ Users table does not exist!');
      if (results.usersTable.error) {
        console.error(`   - Error: ${results.usersTable.error.message}`);
        console.error(`   - Code: ${results.usersTable.error.code}`);
      }
      results.recommendations.push({
        issue: 'Users table missing',
        solution: 'Run database migrations to create required tables',
        command: 'npm run sequelize:migrate'
      });
    }
    console.log('');

    // 6. Test a sample query
    console.log('6. Testing sample query...');
    results.sampleQuery = await testDatabaseQuery('SELECT COUNT(*) as user_count FROM users');
    if (results.sampleQuery.success) {
      console.log('   ✓ Sample query successful');
      if (results.sampleQuery.result && results.sampleQuery.result.length > 0) {
        console.log(`   - User count: ${results.sampleQuery.result[0].user_count || 0}`);
      }
    } else {
      console.error('   ❌ Sample query failed!');
      console.error(`   - Error: ${results.sampleQuery.error?.message || 'Unknown error'}`);
      console.error(`   - Code: ${results.sampleQuery.error?.code || 'N/A'}`);
      
      if (results.sampleQuery.error?.code === '42P01') {
        results.recommendations.push({
          issue: 'Table does not exist',
          solution: 'Run database migrations',
          command: 'npm run sequelize:migrate'
        });
      }
    }
    console.log('');
  } else {
    console.log('5. Skipping users table check (connection failed)');
    console.log('6. Skipping sample query (connection failed)');
    console.log('');
  }

  // Print summary
  console.log('========================================');
  console.log('Diagnostic Summary');
  console.log('========================================\n');

  const allChecksPassed = 
    results.connection?.success &&
    results.usersTable?.exists &&
    results.sampleQuery?.success;

  if (allChecksPassed) {
    console.log('✓ All checks passed! Database is healthy.\n');
  } else {
    console.log('❌ Some checks failed. See recommendations below.\n');
  }

  // Print recommendations
  if (results.recommendations.length > 0) {
    console.log('Recommendations:');
    console.log('----------------');
    results.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}`);
      console.log(`   Command: ${rec.command}`);
    });
    console.log('');
  }

  // Additional help
  console.log('Additional Help:');
  console.log('-----------------');
  console.log('- Check server logs for detailed error messages');
  console.log('- Visit /health/database endpoint for real-time diagnostics');
  console.log('- Ensure DATABASE_URL is set correctly in your .env file');
  console.log('- For cloud DB: ensure database service is not paused');
  console.log('');

  process.exit(allChecksPassed ? 0 : 1);
}

// Run diagnostics
runDiagnostics().catch((error) => {
  console.error('\n❌ Diagnostic script failed:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

