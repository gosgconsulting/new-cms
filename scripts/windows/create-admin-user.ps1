Write-Host "Creating admin user..." -ForegroundColor Green
node create-admin-user.js
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
