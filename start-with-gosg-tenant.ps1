Write-Host "Starting server with GO SG CONSULTING tenant..." -ForegroundColor Green
Write-Host "First, migrating tenant data..." -ForegroundColor Yellow
node migrate-tenant-data.js
Write-Host "Starting server..." -ForegroundColor Green
node server-with-tenants.js
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
