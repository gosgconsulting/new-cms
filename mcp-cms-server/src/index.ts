#!/usr/bin/env node

import { config } from 'dotenv';
config(); // Load .env before anything else

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { postToolDefinitions, handlePostTool } from './tools/posts.js';
import { closePool } from './db.js';

const log = (...args: unknown[]) => process.stderr.write(`[sparti-cms-mcp] ${args.join(' ')}\n`);

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  { name: 'sparti-cms', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: postToolDefinitions };
});

// Dispatch tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  log(`Tool called: ${name}`);
  return await handlePostTool(name, args as Record<string, unknown>);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

async function shutdown() {
  log('Shutting down...');
  await closePool();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection: ${reason}`);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.DATABASE_URL) {
    log('ERROR: DATABASE_URL is not set. Please set it in .env or as an environment variable.');
    process.exit(1);
  }

  log('Starting Sparti CMS MCP server...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Server running — waiting for requests.');
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
