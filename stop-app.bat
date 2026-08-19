@echo off
title School Management System - Stop
echo Stopping the School Management System...

rem Find and stop whatever is serving on port 4000.
set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
  set FOUND=1
)

if "%FOUND%"=="1" (
  echo Stopped.
) else (
  echo It was not running.
)
timeout /t 2 >nul
