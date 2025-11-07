@echo off
echo ========================================
echo   MCP PostgreSQL Database Server
echo   Fixed Configuration for Railway
echo ========================================
echo.
echo Starting MCP server with correct SSL settings...
echo Host: trolley.proxy.rlwy.net:58867
echo Database: railway
echo SSL: rejectUnauthorized=false
echo.

node mcp-database-server/dist/src/index.js --postgresql --host trolley.proxy.rlwy.net --database railway --user postgres --password bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG --port 58867 --ssl "{\"rejectUnauthorized\":false}" --connection-timeout 30000

echo.
echo MCP server stopped.
pause
