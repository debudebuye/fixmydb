@echo off
title FixMyDB
cd /d "%~dp0"

echo ============================================
echo   FixMyDB - Database Schema Analyzer
echo ============================================
echo.

:: Build frontend
echo [1/2] Building frontend...
cd frontend
call npm run build > nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Frontend build failed. Running full install...
    call npm install
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend build failed. Exiting.
        pause
        exit /b 1
    )
)
echo    Frontend built successfully.
cd ..

:: Start backend in production mode
echo [2/2] Starting FixMyDB server...
cd backend
set NODE_ENV=production
set AUTO_OPEN=true
echo.
echo    Server will open in your browser automatically.
echo    Close this window or use Task Manager to stop.
echo.
node src/index.js

pause
