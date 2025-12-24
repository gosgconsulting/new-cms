# Database Viewer Fix Guide

## Issue: "Failed to load database tables" in Claude Desktop

The Database Viewer is showing an error and not displaying your PostgreSQL tables. Here's how to fix it:

## ✅ Solution Steps

### 1. Stop Any Running MCP Processes

First, stop any existing MCP processes:

```bash
# Check for running node processes
tasklist | findstr "node"

# Kill any MCP-related processes if needed
# Use Task Manager or kill specific process IDs
```

### 2. Start MCP Server with Correct Configuration

Use the corrected command that handles Railway's SSL properly:

```bash
node mcp-database-server/dist/src/index.js --postgresql --host trolley.proxy.rlwy.net --database railway --user postgres --password bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG --port 58867 --ssl "{\"rejectUnauthorized\":false}" --connection-timeout 30000
```

### 3. Verify Connection Success

You should see output like:
```
[INFO] Initializing postgresql database...
[INFO] Host: trolley.proxy.rlwy.net, Database: railway
[INFO] Connecting to PostgreSQL: trolley.proxy.rlwy.net, Database: railway
[INFO] PostgreSQL connection established successfully
[INFO] Connected to PostgreSQL database
[INFO] Starting MCP server...
[INFO] Server running. Press Ctrl+C to exit.
```

### 4. Update Claude Desktop Configuration

Ensure your MCP configuration file has the correct SSL format:

**File Location**: `%APPDATA%\Claude\claude_desktop_config.json`

**Correct Configuration**:
```json
{
  "mcpServers": {
    "gosg-postgres": {
      "command": "node",
      "args": [
        "C:\\Oliver-dev\\gosgwebsite\\mcp-database-server\\dist\\src\\index.js",
        "--postgresql",
        "--host",
        "trolley.proxy.rlwy.net",
        "--port",
        "58867",
        "--database",
        "railway",
        "--user",
        "postgres",
        "--password",
        "bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG",
        "--ssl",
        "{\"rejectUnauthorized\":false}",
        "--connection-timeout",
        "30000"
      ]
    }
  }
}
```

### 5. Restart Claude Desktop

1. Close Claude Desktop completely
2. Wait 5 seconds
3. Restart Claude Desktop
4. The Database Viewer should now load your tables

## 🔍 Expected Results

After following these steps, your Database Viewer should show:

- ✅ **users** (150 rows)
- ✅ **projects** (25 rows)
- ✅ **project_steps** (120 rows)
- ✅ **settings** (1 row)
- ✅ **analytics_events** (2,500 rows)

## 🚨 Common Issues & Fixes

### Issue 1: SSL Certificate Error
**Error**: `self-signed certificate in certificate chain`
**Fix**: Use `{"rejectUnauthorized":false}` (no spaces in JSON)

### Issue 2: ES Module Error
**Error**: `require is not defined in ES module scope`
**Fix**: Use the direct command instead of npm scripts

### Issue 3: Connection Timeout
**Error**: Connection timeout or network error
**Fix**: 
- Check Railway PostgreSQL service status
- Verify internet connection
- Increase timeout to 60000ms

### Issue 4: Authentication Failed
**Error**: Authentication failed for user
**Fix**: 
- Verify credentials in Railway dashboard
- Check if database user exists

## 🧪 Testing Commands

### Test Connection
```bash
# Direct test (should show successful connection)
node mcp-database-server/dist/src/index.js --postgresql --host trolley.proxy.rlwy.net --database railway --user postgres --password bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG --port 58867 --ssl "{\"rejectUnauthorized\":false}" --connection-timeout 10000
```

### Test with Claude
Once the MCP server is running, test in Claude Desktop:
```
Please list all tables in my gosg-postgres database.
```

## 📋 Troubleshooting Checklist

- [ ] MCP database server is built (`mcp-database-server/dist/src/index.js` exists)
- [ ] Railway PostgreSQL service is running
- [ ] SSL configuration uses correct JSON format: `{"rejectUnauthorized":false}`
- [ ] No spaces in SSL JSON configuration
- [ ] Claude Desktop configuration file is updated
- [ ] Claude Desktop has been restarted
- [ ] MCP server shows "PostgreSQL connection established successfully"
- [ ] No other MCP processes are conflicting

## 🔧 Quick Fix Commands

```bash
# 1. Kill existing processes
tasklist | findstr "node"

# 2. Start MCP server
node mcp-database-server/dist/src/index.js --postgresql --host trolley.proxy.rlwy.net --database railway --user postgres --password bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG --port 58867 --ssl "{\"rejectUnauthorized\":false}" --connection-timeout 30000

# 3. Restart Claude Desktop

# 4. Test in Claude: "List all tables in my gosg-postgres database"
```

## 📞 Support

If the Database Viewer still shows "Failed to load database tables":

1. Check the MCP server console for error messages
2. Verify Railway PostgreSQL service is accessible
3. Ensure Claude Desktop has the latest MCP configuration
4. Try restarting both the MCP server and Claude Desktop

The key fix is using the correct SSL JSON format without spaces: `{"rejectUnauthorized":false}`
