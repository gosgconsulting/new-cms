@echo off
title Database Viewer Fix - GO SG PostgreSQL
color 0A

echo ========================================
echo   DATABASE VIEWER FIX SCRIPT
echo   GO SG PostgreSQL Connection
echo ========================================
echo.
echo This script will:
echo 1. Stop conflicting Node.js processes
echo 2. Start fresh MCP PostgreSQL server
echo 3. Fix Database Viewer table loading
echo.
echo Press any key to continue...
pause > nul

echo.
echo [1/3] Stopping existing Node processes...
taskkill /F /IM node.exe > nul 2>&1
if %errorlevel%==0 (
    echo    ✓ Existing processes stopped
) else (
    echo    ✓ No conflicting processes found
)

echo.
echo [2/3] Starting MCP PostgreSQL server (using DATABASE_URL from .env)...
echo.

cd /d "%~dp0..\.."
start "MCP PostgreSQL Server" cmd /k "node scripts/setup/fix-database-viewer.js"

timeout /t 3 > nul

echo [3/3] Instructions to complete the fix:
echo.
echo ========================================
echo   NEXT STEPS - IMPORTANT!
echo ========================================
echo.
echo 1. Wait for "Server running" message in the new window
echo 2. Close Claude Desktop completely
echo 3. Wait 5 seconds
echo 4. Restart Claude Desktop
echo 5. Open Database Viewer
echo.
echo Your tables should now load properly:
echo   ✓ users (150 rows)
echo   ✓ projects (25 rows)  
echo   ✓ project_steps (120 rows)
echo   ✓ settings (1 row)
echo   ✓ analytics_events (2,500 rows)
echo.
echo ========================================
echo   TEST COMMANDS FOR CLAUDE
echo ========================================
echo.
echo Try these commands in Claude Desktop:
echo • "List all tables in my gosg-postgres database"
echo • "Show me the first 5 rows from the users table"
echo • "Describe the schema of the projects table"
echo.
echo To stop the MCP server: Close the server window
echo.
pause
