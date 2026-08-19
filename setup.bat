@echo off
title School Management System - Setup
echo ==================================================
echo   School Management System - First-time setup
echo ==================================================
echo.
echo This installs everything and prepares the database.
echo It needs an internet connection ONCE (to download parts).
echo After this, the app runs fully offline.
echo.
pause

echo.
echo [1/6] Installing server files...
cd /d "%~dp0server"
call npm install
if errorlevel 1 goto :error

echo.
echo [2/6] Creating settings file...
if not exist ".env" (
  copy ".env.example" ".env" >nul
  rem give this install its own random security key
  node -e "const fs=require('fs');const c=fs.readFileSync('.env','utf8').replace(/JWT_SECRET=.*/,'JWT_SECRET='+require('crypto').randomBytes(32).toString('hex'));fs.writeFileSync('.env',c)"
)

echo.
echo [3/6] Preparing the database engine...
call npx prisma generate
if errorlevel 1 goto :error

echo.
echo [4/6] Creating the database + demo data...
call npx prisma migrate deploy
if errorlevel 1 goto :error
call npm run db:seed
if errorlevel 1 goto :error

echo.
echo [5/6] Installing app files...
cd /d "%~dp0client"
call npm install
if errorlevel 1 goto :error

echo.
echo [6/6] Building the app...
call npm run build
if errorlevel 1 goto :error

echo.
echo ==================================================
echo   Setup complete!
echo   Now double-click  start-app.bat  to run it.
echo ==================================================
pause
exit /b 0

:error
echo.
echo ==================================================
echo   Setup FAILED.
echo   Make sure Node.js is installed: https://nodejs.org
echo   Then run this setup again.
echo ==================================================
pause
exit /b 1
