Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting GO SG Server with database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ensure DATABASE_URL is set in .env for local development." -ForegroundColor Yellow
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host ""

npm run dev

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
