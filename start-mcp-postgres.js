#!/usr/bin/env node

/**
 * Script to start MCP Database Server for GO SG Website PostgreSQL
 * 
 * This script starts the MCP Database Server with the correct configuration
 * for connecting to the GO SG website's PostgreSQL database.
 */

const { spawn } = require('child_process');
const path = require('path');

// PostgreSQL connection details
const config = {
  host: 'trolley.proxy.rlwy.net',
  port: '58867',
  database: 'railway',
  user: 'postgres',
  password: 'bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG',
  ssl: true,
  connectionTimeout: 30000
};

// Path to the MCP Database Server
const serverPath = path.join(__dirname, 'mcp-database-server', 'dist', 'src', 'index.js');

// Build command arguments
const args = [
  serverPath,
  '--postgresql',
  '--host', config.host,
  '--port', config.port,
  '--database', config.database,
  '--user', config.user,
  '--password', config.password,
  '--ssl', config.ssl.toString(),
  '--connection-timeout', config.connectionTimeout.toString()
];

console.log('Starting MCP Database Server for GO SG Website PostgreSQL...');
console.log(`Connecting to: ${config.host}:${config.port}/${config.database}`);

// Spawn the process
const serverProcess = spawn('node', args, {
  stdio: 'inherit'
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error('Failed to start MCP Database Server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`MCP Database Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Stopping MCP Database Server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping MCP Database Server...');
  serverProcess.kill('SIGTERM');
});
