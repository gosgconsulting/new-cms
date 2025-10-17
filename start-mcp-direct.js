#!/usr/bin/env node

/**
 * Direct MCP Database Server for Railway PostgreSQL
 * 
 * Simple script to start MCP Database Server with proper Railway SSL configuration
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Railway PostgreSQL connection details
const config = {
  host: 'trolley.proxy.rlwy.net',
  port: '58867',
  database: 'railway',
  user: 'postgres',
  password: 'bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG'
};

console.log('🚀 Starting MCP Database Server for Railway PostgreSQL...');
console.log(`📡 Connecting to: ${config.host}:${config.port}/${config.database}`);
console.log('🔒 SSL: Configured for Railway (rejectUnauthorized: false)');
console.log('');

// Path to the MCP Database Server
const serverPath = path.join(__dirname, 'mcp-database-server', 'dist', 'src', 'index.js');

// Command arguments with proper SSL configuration for Railway
const args = [
  serverPath,
  '--postgresql',
  '--host', config.host,
  '--port', config.port,
  '--database', config.database,
  '--user', config.user,
  '--password', config.password,
  '--ssl', '{"rejectUnauthorized":false}',
  '--connection-timeout', '30000'
];

console.log('🔧 Starting MCP server with Railway SSL configuration...');

// Start the MCP server
const serverProcess = spawn('node', args, {
  stdio: 'inherit'
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start MCP Database Server:', error.message);
  process.exit(1);
});

serverProcess.on('close', (code, signal) => {
  if (signal) {
    console.log(`\n📴 MCP Database Server terminated by signal: ${signal}`);
  } else {
    console.log(`\n📴 MCP Database Server exited with code: ${code}`);
  }
  process.exit(code || 0);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
});

console.log('✅ MCP Database Server started successfully!');
console.log('💡 Press Ctrl+C to stop the server');
console.log('🔗 You can now use Claude Desktop to query your database');
console.log('');
