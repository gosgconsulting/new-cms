#!/usr/bin/env node

/**
 * Test MCP PostgreSQL Connection
 *
 * Uses DATABASE_URL from .env to test the same connection the MCP server uses.
 */

import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseDatabaseUrl(url) {
  if (!url || !url.startsWith('postgres')) return null;
  const u = new URL(url.replace(/^postgres(ql)?:\/\//, 'http://'));
  return { host: u.hostname, port: u.port || '5432', database: u.pathname.slice(1), user: u.username, password: u.password };
}

console.log('🧪 Testing MCP PostgreSQL Connection...\n');

const dbUrl = process.env.DATABASE_URL;
const config = dbUrl ? parseDatabaseUrl(dbUrl) : null;
if (!config) {
  console.error('DATABASE_URL is not set. Add it to .env for local development.');
  process.exit(1);
}

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
    console.log('💡 Solution: Using rejectUnauthorized:false for cloud Postgres');
  } else if (errorOutput.includes('ENOTFOUND') || errorOutput.includes('ECONNREFUSED')) {
    console.log('🌐 Network Issue: Cannot reach Postgres server');
    console.log('💡 Check: Internet connection and database service status');
  } else if (errorOutput.includes('authentication failed')) {
    console.log('🔑 Auth Issue: PostgreSQL authentication failed');
    console.log('💡 Check: DATABASE_URL credentials in .env or Vercel');
  }

  console.log('\n📖 Next Steps:');
  if (code === 0) {
    console.log('1. Start MCP server: npm run mcp:start');
    console.log('2. Test with Claude: "List all tables in my gosg-postgres database"');
  } else {
    console.log('1. Check Postgres service status');
    console.log('2. Verify DATABASE_URL in .env or Vercel');
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
