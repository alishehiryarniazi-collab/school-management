@echo off
title School Management System - Stop
echo Stopping the School Management System...

rem Read the port from server\.env so this always matches the running app.
set APPPORT=4000
for /f "tokens=2 delims==" %%a in ('findstr /b "PORT=" "%~dp0server\.env"') do set APPPORT=%%a

set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr ":%APPPORT% "') do (
  taskkill /F /PID %%a >nul 2>&1
  set FOUND=1
)

if "%FOUND%"=="1" (
  echo Stopped ^(was on port %APPPORT%^).
) else (
  echo It was not running on port %APPPORT%.
)
rem brief pause so the message is readable (ping works even on a double-click)
ping -n 3 127.0.0.1 >nul 2>&1
