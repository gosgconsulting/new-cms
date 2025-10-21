Write-Host "Starting tenant migration..." -ForegroundColor Green
node migrate-tenant-data.js
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
