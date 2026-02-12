#!/usr/bin/env node

/**
 * Persistent MCP Database Server for PostgreSQL
 * Uses DATABASE_URL (or DATABASE_PUBLIC_URL); restarts on failures.
 */

import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
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

// Configuration
const MAX_RESTARTS = 10;
const RESTART_DELAY = 5000; // 5 seconds
const LOG_FILE = path.join(__dirname, '../../mcp-postgres.log');

let restartCount = 0;
let serverProcess = null;

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
}

// Start the MCP server
function startServer() {
  const serverPath = path.join(__dirname, '../../mcp-database-server', 'dist', 'src', 'index.js');
  
  // Check if server file exists
  if (!fs.existsSync(serverPath)) {
    log(`ERROR: MCP server file not found at ${serverPath}`);
    log('Please ensure you have built the MCP database server with: npm run build');
    process.exit(1);
  }

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

  log(`Starting MCP Database Server (attempt ${restartCount + 1}/${MAX_RESTARTS})`);
  log(`Connecting to: ${config.host}:${config.port}/${config.database}`);

  serverProcess = spawn('node', args, {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  // Handle server output
  serverProcess.stdout.on('data', (data) => {
    log(`STDOUT: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    log(`STDERR: ${data.toString().trim()}`);
  });

  // Handle server events
  serverProcess.on('error', (error) => {
    log(`ERROR: Failed to start MCP Database Server: ${error.message}`);
    handleRestart();
  });

  serverProcess.on('close', (code, signal) => {
    if (signal) {
      log(`INFO: MCP Database Server terminated by signal: ${signal}`);
    } else {
      log(`INFO: MCP Database Server exited with code: ${code}`);
    }
    
    if (code !== 0 && !signal) {
      handleRestart();
    }
  });

  // Reset restart count on successful start (after 30 seconds)
  setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      restartCount = 0;
      log('INFO: MCP Database Server running successfully - restart count reset');
    }
  }, 30000);
}

// Handle server restart
function handleRestart() {
  restartCount++;
  
  if (restartCount >= MAX_RESTARTS) {
    log(`ERROR: Maximum restart attempts (${MAX_RESTARTS}) reached. Stopping.`);
    process.exit(1);
  }
  
  log(`INFO: Restarting MCP Database Server in ${RESTART_DELAY / 1000} seconds...`);
  setTimeout(startServer, RESTART_DELAY);
}

// Handle termination signals
function handleShutdown(signal) {
  log(`INFO: Received ${signal} signal. Shutting down gracefully...`);
  
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
    
    // Force kill after 10 seconds
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        log('WARN: Force killing MCP Database Server');
        serverProcess.kill('SIGKILL');
      }
    }, 10000);
  }
  
  setTimeout(() => {
    log('INFO: Shutdown complete');
    process.exit(0);
  }, 1000);
}

// Register signal handlers
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`ERROR: Uncaught exception: ${error.message}`);
  log(`Stack: ${error.stack}`);
  handleRestart();
});

process.on('unhandledRejection', (reason, promise) => {
  log(`ERROR: Unhandled rejection at: ${promise}, reason: ${reason}`);
  handleRestart();
});

// Initialize log file
log('INFO: Starting MCP PostgreSQL Persistent Service');
log(`INFO: Log file: ${LOG_FILE}`);
log(`INFO: Connecting to ${config.host}:${config.port}/${config.database}`);

// Start the server
startServer();
