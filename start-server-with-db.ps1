Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting GO SG Server with Railway DB" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway"
$env:DATABASE_PUBLIC_URL = "postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway"
$env:NODE_ENV = "development"

Write-Host "Database: trolley.proxy.rlwy.net:58867/railway" -ForegroundColor Green
Write-Host "Environment: development" -ForegroundColor Green
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host ""

npm run dev

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
