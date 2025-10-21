Write-Host "Checking tenants in the database..." -ForegroundColor Green
node check-tenants.js
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
