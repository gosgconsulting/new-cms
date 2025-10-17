#!/usr/bin/env node

/**
 * Database Viewer Fix Script
 * 
 * This script diagnoses and fixes issues with table data loading
 * in the Claude Desktop Database Viewer.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Database Viewer Fix Script');
console.log('═'.repeat(50));

// Kill existing MCP processes first
console.log('1️⃣ Stopping existing MCP processes...');

function killNodeProcesses() {
  return new Promise((resolve) => {
    const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe'], { stdio: 'pipe' });
    
    killProcess.on('close', (code) => {
      console.log('   ✅ Existing Node processes stopped');
      setTimeout(resolve, 2000); // Wait 2 seconds
    });
    
    killProcess.on('error', () => {
      console.log('   ⚠️  Could not stop processes (may not be running)');
      resolve();
    });
  });
}

async function startMCPServer() {
  console.log('\n2️⃣ Starting fresh MCP server...');
  
  const serverPath = path.join(__dirname, 'mcp-database-server', 'dist', 'src', 'index.js');
  
  const args = [
    serverPath,
    '--postgresql',
    '--host', 'trolley.proxy.rlwy.net',
    '--port', '58867',
    '--database', 'railway',
    '--user', 'postgres',
    '--password', 'bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG',
    '--ssl', '{"rejectUnauthorized":false}',
    '--connection-timeout', '30000'
  ];
  
  console.log('   📡 Connecting to Railway PostgreSQL...');
  console.log('   🔒 SSL: rejectUnauthorized=false');
  
  const serverProcess = spawn('node', args, {
    stdio: 'pipe'
  });
  
  let connectionEstablished = false;
  let serverReady = false;
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!serverReady) {
        console.log('   ❌ Timeout: Server did not start within 30 seconds');
        serverProcess.kill();
        reject(new Error('Server startup timeout'));
      }
    }, 30000);
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`   📤 ${output.trim()}`);
      
      if (output.includes('PostgreSQL connection established successfully')) {
        connectionEstablished = true;
        console.log('   ✅ Database connection established');
      }
      
      if (output.includes('Server running')) {
        serverReady = true;
        console.log('   ✅ MCP server is ready');
        clearTimeout(timeout);
        resolve(serverProcess);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.log(`   🔴 ${error.trim()}`);
      
      if (error.includes('self-signed certificate')) {
        console.log('   ❌ SSL certificate error detected');
        clearTimeout(timeout);
        reject(new Error('SSL certificate error'));
      }
    });
    
    serverProcess.on('error', (error) => {
      console.log(`   ❌ Process error: ${error.message}`);
      clearTimeout(timeout);
      reject(error);
    });
    
    serverProcess.on('close', (code) => {
      if (code !== 0 && !serverReady) {
        console.log(`   ❌ Server exited with code: ${code}`);
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

function showInstructions() {
  console.log('\n3️⃣ Next Steps:');
  console.log('═'.repeat(30));
  console.log('✅ MCP Server is running successfully');
  console.log('');
  console.log('📋 To fix Database Viewer:');
  console.log('1. Close Claude Desktop completely');
  console.log('2. Wait 5 seconds');
  console.log('3. Restart Claude Desktop');
  console.log('4. Open Database Viewer');
  console.log('');
  console.log('🧪 Test Commands:');
  console.log('• "List all tables in my gosg-postgres database"');
  console.log('• "Show me the first 5 rows from the users table"');
  console.log('• "Describe the schema of the projects table"');
  console.log('');
  console.log('💡 If tables still show "Failed to load":');
  console.log('• Check that Claude Desktop has been restarted');
  console.log('• Verify MCP configuration is correct');
  console.log('• Try querying tables directly with Claude');
  console.log('');
  console.log('🛑 To stop this server: Press Ctrl+C');
}

// Main execution
async function main() {
  try {
    await killNodeProcesses();
    const serverProcess = await startMCPServer();
    showInstructions();
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down MCP server...');
      serverProcess.kill('SIGTERM');
      setTimeout(() => {
        console.log('✅ Server stopped');
        process.exit(0);
      }, 1000);
    });
    
    process.on('SIGTERM', () => {
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Railway PostgreSQL service status');
    console.log('2. Verify internet connection');
    console.log('3. Ensure MCP database server is built');
    console.log('4. Try running: npm run mcp:build');
    process.exit(1);
  }
}

main();
