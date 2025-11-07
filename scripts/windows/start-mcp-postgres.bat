@echo off
echo Starting MCP PostgreSQL Persistent Service...
echo.
echo This will start the MCP Database Server for Railway PostgreSQL
echo and keep it running in the background.
echo.
echo Press Ctrl+C to stop the service.
echo.

node start-mcp-postgres-persistent.js

pause
