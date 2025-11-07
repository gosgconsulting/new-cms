# MCP PostgreSQL Database Viewer Sync Guide

This guide explains how to set up persistent synchronization between your Railway PostgreSQL database and the Database Viewer in Claude Desktop.

## Overview

Your Database Viewer shows the following tables:
- `users` (150 rows)
- `projects` (25 rows) 
- `project_steps` (120 rows)
- `settings` (1 row)
- `analytics_events` (2,500 rows)

## Quick Setup (Recommended)

### 1. Build and Start MCP Server

Run this single command to build and start the persistent MCP server:

```bash
npm run mcp:setup
```

This will:
- Build the MCP database server
- Start the persistent service with automatic restart
- Keep the connection alive to your Railway PostgreSQL database

### 2. Alternative Startup Methods

**Option A: Using PowerShell (Windows)**
```powershell
.\start-mcp-postgres.ps1
```

**Option B: Using Batch File (Windows)**
```cmd
start-mcp-postgres.bat
```

**Option C: Using Node.js directly**
```bash
npm run mcp:start
```

## Manual Setup

### 1. Ensure MCP Database Server is Built

```bash
cd mcp-database-server
npm install
npm run build
cd ..
```

### 2. Start Persistent Service

```bash
node start-mcp-postgres-persistent.js
```

## Features of the Persistent Service

### Automatic Restart
- Automatically restarts if the connection fails
- Maximum 10 restart attempts with 5-second delays
- Resets restart counter after 30 seconds of successful operation

### Logging
- All activities logged to `mcp-postgres.log`
- Console output with timestamps
- Error tracking and debugging information

### Graceful Shutdown
- Handles SIGINT and SIGTERM signals
- Graceful shutdown with 10-second timeout
- Proper cleanup of resources

## Configuration

The service connects to your Railway PostgreSQL with these settings:

```javascript
{
  host: 'trolley.proxy.rlwy.net',
  port: '58867',
  database: 'railway',
  user: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeout: 30000
}
```

## Claude Desktop Integration

Your MCP configuration in `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gosg-postgres": {
      "command": "node",
      "args": [
        "C:\\Oliver-dev\\gosgwebsite\\mcp-database-server\\dist\\src\\index.js",
        "--postgresql",
        "--host", "trolley.proxy.rlwy.net",
        "--port", "58867",
        "--database", "railway",
        "--user", "postgres",
        "--password", "bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG",
        "--ssl", "{ \"rejectUnauthorized\": false }",
        "--connection-timeout", "30000"
      ]
    }
  }
}
```

## Using the Database Viewer

Once the MCP server is running, you can:

### 1. Query Tables
```
Show me all records from the settings table
```

### 2. Analyze Data
```
Analyze the analytics_events table and show me the top 10 most frequent events
```

### 3. Get Schema Information
```
Describe the structure of the projects table
```

### 4. Run Complex Queries
```
Show me all active projects with their completion percentage based on project_steps
```

## Monitoring and Maintenance

### Check Service Status
```bash
# View recent logs
tail -f mcp-postgres.log

# Check if process is running (Windows)
tasklist | findstr "node"
```

### Stop the Service
- Press `Ctrl+C` in the terminal where it's running
- Or kill the process using Task Manager

### Restart the Service
```bash
npm run mcp:start
```

## Troubleshooting

### Connection Issues
1. **SSL Certificate Error**: Already handled with `rejectUnauthorized: false`
2. **Network Timeout**: Increase `connection-timeout` value
3. **Authentication Failed**: Verify Railway PostgreSQL credentials

### Service Not Starting
1. Check if MCP server is built: `ls mcp-database-server/dist/src/index.js`
2. Verify Node.js is installed: `node --version`
3. Check log file: `cat mcp-postgres.log`

### Database Viewer Not Updating
1. Restart Claude Desktop
2. Check MCP server is running
3. Verify MCP configuration file is correct

## Advanced Configuration

### Custom Connection Settings
Edit `start-mcp-postgres-persistent.js` to modify:
- Connection timeout
- Restart attempts
- Restart delay
- Log file location

### Running as Windows Service
For production use, consider using tools like:
- `node-windows` to create a Windows service
- `pm2` for process management
- Task Scheduler for automatic startup

## Security Notes

- Database credentials are stored in plain text in the scripts
- Consider using environment variables for production
- Restrict network access to the database if possible
- Use read-only database user when appropriate

## Next Steps

1. **Start the service**: `npm run mcp:setup`
2. **Test connection**: Ask Claude to list your database tables
3. **Monitor logs**: Check `mcp-postgres.log` for any issues
4. **Set up automatic startup**: Configure to start with Windows if needed

Your PostgreSQL database will now be persistently available in the Database Viewer!
