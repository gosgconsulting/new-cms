@echo off
echo ========================================
echo   Starting GO SG Server with database
echo ========================================
echo.
echo Ensure DATABASE_URL is set in .env for local development.
echo Starting development server...
echo.

npm run dev

pause
