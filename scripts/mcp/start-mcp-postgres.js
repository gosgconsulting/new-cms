#!/usr/bin/env node

/**
 * Start MCP Database Server for PostgreSQL
 * Uses DATABASE_URL (or DATABASE_PUBLIC_URL) from environment or .env.
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

function parseDatabaseUrl(url) {
  if (!url || !url.startsWith('postgres')) return null;
  const u = new URL(url.replace(/^postgres(ql)?:\/\//, 'http://'));
  return {
    host: u.hostname,
    port: u.port || '5432',
    database: u.pathname.slice(1) || 'postgres',
    user: u.username,
    password: u.password,
  };
}

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
const config = connectionString ? parseDatabaseUrl(connectionString) : null;
if (!config) {
  console.error('Set DATABASE_URL or DATABASE_PUBLIC_URL in .env or environment.');
  process.exit(1);
}

// Path to the MCP Database Server
const serverPath = path.join(__dirname, '../../mcp-database-server', 'dist', 'src', 'index.js');

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
