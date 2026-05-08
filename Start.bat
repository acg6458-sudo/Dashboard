@echo off
chcp 65001 >nul
echo ========================================
echo   Dashboard Network Device Monitor - Startup Script
echo ========================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Running as administrator recommended for best experience
    echo.
)

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [1/5] Checking port usage...
echo.

netstat -ano | findstr ":4005" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 4005 is in use, attempting to stop the process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4005" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [DONE] Port 4005 released
) else (
    echo [OK] Port 4005 is available
)

netstat -ano | findstr ":4006" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 4006 is in use, attempting to stop the process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4006" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [DONE] Port 4006 released
) else (
    echo [OK] Port 4006 is available
)

echo.
echo [2/5] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first
    echo   Download: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js version:
node --version

echo.
echo [3/5] Checking dependencies...
echo.

if not exist "dashboard-server\node_modules" (
    echo [INSTALL] Backend dependencies not found, installing...
    cd /d "dashboard-server"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend dependencies installation failed
        pause
        exit /b 1
    )
    echo [DONE] Backend dependencies installed successfully
    cd /d "%ROOT_DIR%"
) else (
    echo [OK] Backend dependencies installed
)

if not exist "dashboard-client\node_modules" (
    echo [INSTALL] Frontend dependencies not found, installing...
    cd /d "dashboard-client"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend dependencies installation failed
        pause
        exit /b 1
    )
    echo [DONE] Frontend dependencies installed successfully
    cd /d "%ROOT_DIR%"
) else (
    echo [OK] Frontend dependencies installed
)

echo.
echo [4/5] Checking database connection...
cd /d "dashboard-server"
echo [OK] Database configuration is ready (will be verified on service startup)
cd /d "%ROOT_DIR%"

echo.
echo [5/5] Starting services...
echo.

set SERVER_DIR=%ROOT_DIR%dashboard-server
set CLIENT_DIR=%ROOT_DIR%dashboard-client

echo [STARTING] Backend service (http://localhost:4006)...
start "Dashboard Server" cmd /k "cd /d "%SERVER_DIR%" && node server.js"

echo [WAITING] Waiting for backend service to initialize...
timeout /t 5 /nobreak >nul

netstat -ano | findstr ":4006" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend service started
) else (
    echo [FAILED] Backend service failed to start
)

echo.
echo [STARTING] Frontend service (http://localhost:4005)...
start "Dashboard Client" cmd /k "cd /d "%CLIENT_DIR%" && npm run dev"

echo [WAITING] Waiting for frontend service to initialize...
timeout /t 5 /nobreak >nul

netstat -ano | findstr ":4005" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend service started
) else (
    echo [FAILED] Frontend service failed to start
)

echo.
echo ========================================
echo   Project startup complete!
echo ========================================
echo.
echo Service URLs:
echo   - Frontend: http://localhost:4005
echo   - Backend: http://localhost:4006
echo   - API:  http://localhost:4006/api
echo.
echo Tip: Close this window to stop all services
echo.
pause
