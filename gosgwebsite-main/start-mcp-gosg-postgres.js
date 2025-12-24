#!/usr/bin/env node

/**
 * MCP Database Server Startup Script for GOSG PostgreSQL
 * This script starts the MCP database server with the correct Railway PostgreSQL configuration
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Railway PostgreSQL connection parameters
const MCP_SERVER_PATH = path.join(__dirname, 'mcp-database-server', 'dist', 'src', 'index.js');
const RAILWAY_CONFIG = {
  host: 'mainline.proxy.rlwy.net',
  port: '37013',
  database: 'railway',
  user: 'postgres',
  password: 'bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG',
  ssl: '{"rejectUnauthorized":false}',
  connectionTimeout: '30000'
};

console.log('[INFO] Starting MCP Database Server for GOSG PostgreSQL...');
console.log(`[INFO] Connecting to: ${RAILWAY_CONFIG.host}:${RAILWAY_CONFIG.port}/${RAILWAY_CONFIG.database}`);

// Build the command arguments
const args = [
  MCP_SERVER_PATH,
  '--postgresql',
  '--host', RAILWAY_CONFIG.host,
  '--port', RAILWAY_CONFIG.port,
  '--database', RAILWAY_CONFIG.database,
  '--user', RAILWAY_CONFIG.user,
  '--password', RAILWAY_CONFIG.password,
  '--ssl', RAILWAY_CONFIG.ssl,
  '--connection-timeout', RAILWAY_CONFIG.connectionTimeout
];

// Start the MCP server
const mcpServer = spawn('node', args, {
  stdio: 'inherit',
  cwd: __dirname
});

mcpServer.on('error', (error) => {
  console.error('[ERROR] Failed to start MCP server:', error);
  process.exit(1);
});

mcpServer.on('close', (code) => {
  console.log(`[INFO] MCP server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[INFO] Shutting down MCP server...');
  mcpServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n[INFO] Shutting down MCP server...');
  mcpServer.kill('SIGTERM');
});

