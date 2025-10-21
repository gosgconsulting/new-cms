Write-Host "Initializing tenant database..." -ForegroundColor Green
node initialize-tenant-db.js
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
