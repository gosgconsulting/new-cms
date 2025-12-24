# Fix: "Failed to load data for table" in Database Viewer

## 🎯 Issue Identified

Your Database Viewer shows tables but displays "Failed to load data for table: users" when trying to view table contents. This indicates:

✅ **Working**: MCP connection to PostgreSQL  
✅ **Working**: Table schema detection  
❌ **Failing**: Table data retrieval  

## 🔧 Root Cause

The issue is likely caused by:
1. **Multiple MCP processes** running simultaneously
2. **Stale connections** from previous attempts
3. **Permission conflicts** in data access
4. **Claude Desktop cache** not refreshed

## ✅ Quick Fix (Recommended)

### Option 1: Use the Fix Script
**Double-click**: `FIX-DATABASE-VIEWER.bat`

This will:
- Stop all conflicting Node.js processes
- Start a fresh MCP server
- Provide step-by-step instructions

### Option 2: Manual Fix Steps

1. **Stop All Node Processes**:
   ```cmd
   taskkill /F /IM node.exe
   ```

2. **Wait 5 seconds** for processes to fully stop

3. **Start Fresh MCP Server**:
   ```cmd
   node mcp-database-server/dist/src/index.js --postgresql --host trolley.proxy.rlwy.net --database railway --user postgres --password bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG --port 58867 --ssl "{\"rejectUnauthorized\":false}" --connection-timeout 30000
   ```

4. **Wait for Success Message**:
   ```
   [INFO] PostgreSQL connection established successfully
   [INFO] Connected to PostgreSQL database
   [INFO] Starting MCP server...
   [INFO] Server running. Press Ctrl+C to exit.
   ```

5. **Restart Claude Desktop**:
   - Close Claude Desktop completely
   - Wait 5 seconds
   - Restart Claude Desktop
   - Open Database Viewer

## 🧪 Verification Steps

After following the fix:

### 1. Check Tables Load
The Database Viewer should show:
- ✅ users (150 rows) - **Data should load**
- ✅ projects (25 rows) - **Data should load**
- ✅ project_steps (120 rows) - **Data should load**
- ✅ settings (1 row) - **Data should load**
- ✅ analytics_events (2,500 rows) - **Data should load**

### 2. Test Direct Queries
Try these commands in Claude Desktop:

```
Show me the first 5 rows from the users table
```

```
List all tables in my gosg-postgres database with row counts
```

```
Describe the structure of the projects table
```

## 🚨 If Still Not Working

### Check MCP Server Status
Look for these messages in the MCP server window:
- ✅ `PostgreSQL connection established successfully`
- ✅ `Connected to PostgreSQL database`
- ✅ `Starting MCP server...`
- ✅ `Server running. Press Ctrl+C to exit.`

### Verify MCP Configuration
Check `%APPDATA%\Claude\claude_desktop_config.json`:

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
        "--ssl", "{\"rejectUnauthorized\":false}",
        "--connection-timeout", "30000"
      ]
    }
  }
}
```

### Alternative: Query Directly
If Database Viewer still has issues, you can query directly:

```
Please connect to my gosg-postgres database and show me all tables with their row counts.
```

```
Using my gosg-postgres database, show me the schema and first 3 rows of the users table.
```

## 🔍 Common Error Messages & Solutions

| Error Message | Solution |
|---------------|----------|
| "Failed to load data for table" | Restart MCP server + Claude Desktop |
| "Connection timeout" | Check Railway PostgreSQL service status |
| "SSL certificate error" | Verify SSL config: `{"rejectUnauthorized":false}` |
| "Authentication failed" | Check Railway database credentials |
| "No tables found" | Ensure MCP server shows successful connection |

## 📞 Emergency Backup Plan

If Database Viewer continues to fail, you can still access your data:

1. **Direct SQL Queries via Claude**:
   ```
   Execute this SQL query on my gosg-postgres database: SELECT * FROM users LIMIT 5;
   ```

2. **Table Analysis**:
   ```
   Analyze the structure and contents of all tables in my gosg-postgres database.
   ```

3. **Data Export**:
   ```
   Export the contents of the settings table from my gosg-postgres database as JSON.
   ```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Database Viewer shows table names without errors
- ✅ Clicking on tables shows actual data rows
- ✅ No "Failed to load" error messages
- ✅ Claude can query your database directly
- ✅ All 5 tables (users, projects, project_steps, settings, analytics_events) are accessible

The key is ensuring **only one MCP server** is running and **Claude Desktop is fully restarted** after starting the server.
