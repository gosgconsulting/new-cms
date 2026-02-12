#!/usr/bin/env node

/**
 * Direct MCP Database Server for PostgreSQL
 *
 * Uses DATABASE_URL (or DATABASE_PUBLIC_URL) from environment or .env.
 * SSL rejectUnauthorized: false for cloud Postgres with self-signed certs.
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

console.log('Starting MCP Database Server for PostgreSQL...');
console.log(`Connecting to: ${config.host}:${config.port}/${config.database}`);
console.log('SSL: rejectUnauthorized=false');

const serverPath = path.join(__dirname, '../../mcp-database-server', 'dist', 'src', 'index.js');

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

const serverProcess = spawn('node', args, {
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('Failed to start MCP Database Server:', error.message);
  process.exit(1);
});

serverProcess.on('close', (code, signal) => {
  if (signal) {
    console.log(`MCP server stopped (${signal})`);
  } else if (code !== 0) {
    console.error(`MCP server exited with code ${code}`);
    process.exit(code);
  }
});
