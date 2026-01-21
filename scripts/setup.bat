@echo off
echo ========================================
echo   Lost ^& Found QR - Quick Setup
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Running code formatter...
call npm run format

echo.
echo [3/4] Checking code quality...
call npm run lint:fix

echo.
echo [4/4] Type checking...
call npm run type-check

echo.
echo ========================================
echo   Setup Complete! ✅
echo ========================================
echo.
echo Next steps:
echo   1. Copy .env.example to .env
echo   2. Fill in your environment variables
echo   3. Run: npm start
echo.
pause
