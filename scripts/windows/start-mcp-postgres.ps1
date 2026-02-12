# MCP PostgreSQL Persistent Service Starter
# This script starts the MCP Database Server (uses DATABASE_URL from .env)

Write-Host "Starting MCP PostgreSQL Persistent Service..." -ForegroundColor Green
Write-Host ""
Write-Host "This will start the MCP Database Server (ensure DATABASE_URL is in .env)" -ForegroundColor Yellow
Write-Host "and keep it running in the background with automatic restart on failure." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the service." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if MCP database server is built
$mcpServerPath = Join-Path $PSScriptRoot "mcp-database-server\dist\src\index.js"
if (-not (Test-Path $mcpServerPath)) {
    Write-Host "ERROR: MCP Database Server not found at: $mcpServerPath" -ForegroundColor Red
    Write-Host "Please build the MCP database server first:" -ForegroundColor Yellow
    Write-Host "  cd mcp-database-server" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor Cyan
    Write-Host "  npm run build" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the persistent service
try {
    Write-Host "Starting persistent MCP service..." -ForegroundColor Green
    node (Join-Path $PSScriptRoot "start-mcp-postgres-persistent.js")
} catch {
    Write-Host "ERROR: Failed to start MCP service: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
