#!/usr/bin/env node

import { config } from 'dotenv';
config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { wordpressToolDefinitions, handleWordPressTool } from './tools/posts.js';

const log = (...args: unknown[]) =>
  process.stderr.write(`[wordpress-mcp] ${args.join(' ')}\n`);

const server = new Server(
  { name: 'wordpress-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: wordpressToolDefinitions };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  log(`Tool called: ${name}`);
  return await handleWordPressTool(name, args as Record<string, unknown>);
});

async function shutdown() {
  log('Shutting down...');
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

async function main() {
  const requiredEnvVars = ['WORDPRESS_URL', 'WORDPRESS_USERNAME', 'WORDPRESS_APP_PASSWORD'];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    log(`ERROR: Missing required environment variables: ${missing.join(', ')}`);
    log('Please set them in .env or as environment variables.');
    process.exit(1);
  }

  log('Starting WordPress MCP server...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Server running — waiting for requests.');
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
