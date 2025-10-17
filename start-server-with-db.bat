@echo off
echo ========================================
echo   Starting GO SG Server with Railway DB
echo ========================================
echo.
echo Setting environment variables...
set DATABASE_URL=postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway
set DATABASE_PUBLIC_URL=postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway
set NODE_ENV=development

echo Database: trolley.proxy.rlwy.net:58867/railway
echo Environment: development
echo.
echo Starting development server...
echo.

npm run dev

pause
