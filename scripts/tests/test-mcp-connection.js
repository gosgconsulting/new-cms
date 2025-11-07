#!/usr/bin/env node

/**
 * Test MCP PostgreSQL Connection
 * 
 * This script tests the connection to Railway PostgreSQL with the exact
 * same parameters used by the MCP server to verify connectivity.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing MCP PostgreSQL Connection...\n');

// Railway PostgreSQL connection details
const config = {
  host: 'trolley.proxy.rlwy.net',
  port: '58867',
  database: 'railway',
  user: 'postgres',
  password: 'bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG'
};

console.log('📋 Connection Parameters:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   User: ${config.user}`);
console.log(`   SSL: {"rejectUnauthorized":false}`);
console.log('');

// Path to the MCP Database Server
const serverPath = path.join(__dirname, 'mcp-database-server', 'dist', 'src', 'index.js');

console.log(`🔍 MCP Server Path: ${serverPath}`);

// Test command
const args = [
  serverPath,
  '--postgresql',
  '--host', config.host,
  '--port', config.port,
  '--database', config.database,
  '--user', config.user,
  '--password', config.password,
  '--ssl', '{"rejectUnauthorized":false}',
  '--connection-timeout', '10000'
];

console.log('\n🚀 Starting connection test...');
console.log('⏱️  Timeout: 10 seconds');
console.log('');

const testProcess = spawn('node', args, {
  stdio: 'pipe'
});

let output = '';
let errorOutput = '';

testProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log(`📤 ${text.trim()}`);
});

testProcess.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  console.log(`🔴 ${text.trim()}`);
});

testProcess.on('close', (code) => {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST RESULTS:');
  console.log('═'.repeat(60));
  
  if (code === 0) {
    console.log('✅ SUCCESS: MCP PostgreSQL connection established!');
    console.log('🔗 The Database Viewer should work in Claude Desktop');
  } else {
    console.log('❌ FAILED: MCP PostgreSQL connection failed');
    console.log(`   Exit code: ${code}`);
  }
  
  if (output.includes('PostgreSQL connection established successfully')) {
    console.log('✅ Connection Status: CONNECTED');
  } else if (output.includes('self-signed certificate')) {
    console.log('🔒 SSL Issue: Self-signed certificate error detected');
    console.log('💡 Solution: Using rejectUnauthorized:false for Railway');
  } else if (errorOutput.includes('ENOTFOUND') || errorOutput.includes('ECONNREFUSED')) {
    console.log('🌐 Network Issue: Cannot reach Railway PostgreSQL server');
    console.log('💡 Check: Internet connection and Railway service status');
  } else if (errorOutput.includes('authentication failed')) {
    console.log('🔑 Auth Issue: PostgreSQL authentication failed');
    console.log('💡 Check: Database credentials in Railway dashboard');
  }
  
  console.log('\n📖 Next Steps:');
  if (code === 0) {
    console.log('1. Start MCP server: npm run mcp:start');
    console.log('2. Test with Claude: "List all tables in my gosg-postgres database"');
  } else {
    console.log('1. Check Railway PostgreSQL service status');
    console.log('2. Verify database credentials');
    console.log('3. Check network connectivity');
  }
  
  process.exit(code);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.log('\n⏰ Test timeout reached. Stopping test...');
  testProcess.kill('SIGTERM');
  setTimeout(() => {
    if (!testProcess.killed) {
      testProcess.kill('SIGKILL');
    }
  }, 2000);
}, 15000);
