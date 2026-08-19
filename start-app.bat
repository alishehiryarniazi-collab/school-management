@echo off
title School Management System (running)
cd /d "%~dp0server"
set NODE_ENV=production

rem If setup hasn't been run yet, guide the user.
if not exist "node_modules" (
  echo It looks like setup hasn't run yet.
  echo Please double-click  setup.bat  first.
  echo.
  pause
  exit /b 1
)

echo Starting the School Management System...
echo (The addresses to open will appear below.)
echo.
call npm run start

rem If the server stops/crashes, keep the window open so the message is readable.
echo.
echo The server has stopped.
pause
