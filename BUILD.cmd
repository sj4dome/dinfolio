@echo off
setlocal
cd /d "%~dp0"
title Project Index - Build

where node >nul 2>&1
if errorlevel 1 goto :missing_node
where npm >nul 2>&1
if errorlevel 1 goto :missing_node

if not exist "node_modules\" (
  echo [Project Index] Installing dependencies...
  if exist "package-lock.json" (
    call npm ci
  ) else (
    call npm install
  )
  if errorlevel 1 goto :failed
)

echo.
echo [Project Index] Building production website...
call npm run build
if errorlevel 1 goto :failed

echo.
echo [OK] Build completed. Output folder: dist
pause
exit /b 0

:missing_node
echo [ERROR] Node.js and npm are required. Install Node.js 22 or later.
pause
exit /b 1

:failed
echo.
echo [ERROR] Build failed. See the error above.
pause
exit /b 1
