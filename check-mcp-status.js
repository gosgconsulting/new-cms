#!/usr/bin/env node

/**
 * MCP PostgreSQL Service Status Checker
 * 
 * This script checks if the MCP Database Server is running
 * and displays connection status information.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, 'mcp-postgres.log');

function checkLogFile() {
  console.log('🔍 Checking MCP PostgreSQL Service Status...\n');
  
  if (!fs.existsSync(LOG_FILE)) {
    console.log('❌ Log file not found. Service may not be running.');
    console.log(`   Expected log file: ${LOG_FILE}`);
    return false;
  }
  
  try {
    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = logContent.trim().split('\n');
    const recentLines = lines.slice(-10); // Get last 10 lines
    
    console.log('📋 Recent log entries:');
    console.log('─'.repeat(60));
    recentLines.forEach(line => {
      if (line.includes('ERROR')) {
        console.log(`🔴 ${line}`);
      } else if (line.includes('INFO')) {
        console.log(`🟢 ${line}`);
      } else if (line.includes('WARN')) {
        console.log(`🟡 ${line}`);
      } else {
        console.log(`   ${line}`);
      }
    });
    console.log('─'.repeat(60));
    
    // Check if service is running based on recent logs
    const hasRecentConnection = recentLines.some(line => 
      line.includes('PostgreSQL connection established successfully') ||
      line.includes('Server running')
    );
    
    const hasRecentError = recentLines.some(line => 
      line.includes('ERROR') || line.includes('Failed')
    );
    
    if (hasRecentConnection && !hasRecentError) {
      console.log('✅ Service appears to be running successfully');
      return true;
    } else if (hasRecentError) {
      console.log('⚠️  Service has recent errors - check logs above');
      return false;
    } else {
      console.log('❓ Service status unclear - check logs above');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error reading log file: ${error.message}`);
    return false;
  }
}

function checkProcesses() {
  console.log('\n🔍 Checking for running Node.js processes...\n');
  
  // Check for running node processes (Windows)
  exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Could not check running processes (Windows)');
      // Try alternative method for other systems
      exec('ps aux | grep node', (error2, stdout2, stderr2) => {
        if (error2) {
          console.log('❌ Could not check running processes');
        } else {
          const nodeProcesses = stdout2.split('\n').filter(line => 
            line.includes('node') && 
            line.includes('mcp') &&
            !line.includes('grep')
          );
          
          if (nodeProcesses.length > 0) {
            console.log('✅ Found MCP-related Node.js processes:');
            nodeProcesses.forEach(process => {
              console.log(`   ${process.trim()}`);
            });
          } else {
            console.log('❌ No MCP-related Node.js processes found');
          }
        }
      });
    } else {
      const lines = stdout.split('\n');
      const nodeProcesses = lines.filter(line => 
        line.includes('node.exe') && 
        !line.includes('ImageName')
      );
      
      if (nodeProcesses.length > 0) {
        console.log('✅ Found Node.js processes:');
        nodeProcesses.forEach(process => {
          console.log(`   ${process.trim()}`);
        });
      } else {
        console.log('❌ No Node.js processes found');
      }
    }
  });
}

function showInstructions() {
  console.log('\n📖 Quick Commands:');
  console.log('─'.repeat(40));
  console.log('Start service:    npm run mcp:start');
  console.log('Setup service:    npm run mcp:setup');
  console.log('Check logs:       type mcp-postgres.log');
  console.log('Stop service:     Press Ctrl+C in service terminal');
  console.log('\n🔗 Test with Claude:');
  console.log('Ask Claude: "Please list all tables in my gosg-postgres database"');
}

// Main execution
console.log('🚀 MCP PostgreSQL Service Status Checker');
console.log('═'.repeat(50));

const logStatus = checkLogFile();
checkProcesses();
showInstructions();

// Summary
setTimeout(() => {
  console.log('\n📊 Summary:');
  console.log('═'.repeat(30));
  if (logStatus) {
    console.log('✅ MCP PostgreSQL Service: RUNNING');
    console.log('🔗 Database Viewer should be available in Claude Desktop');
  } else {
    console.log('❌ MCP PostgreSQL Service: NOT RUNNING or HAS ERRORS');
    console.log('💡 Try running: npm run mcp:start');
  }
}, 2000);
