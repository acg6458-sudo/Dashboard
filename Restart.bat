@echo off
chcp 65001 >nul
echo ========================================
echo   Dashboard Network Device Monitor - Restart Script
echo ========================================
echo.

cd /d "%~dp0"

echo [STEP 1/6] Stopping currently running services...
echo.

echo [STOPPING] Finding and stopping Node.js processes...

set FRONTEND_PID=
set BACKEND_PID=

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4005" ^| findstr "LISTEN"') do (
    set FRONTEND_PID=%%a
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4006" ^| findstr "LISTEN"') do (
    set BACKEND_PID=%%a
)

if defined FRONTEND_PID (
    echo [STOPPING] Stopping frontend service (PID: %FRONTEND_PID%)...
    taskkill /F /PID %FRONTEND_PID% >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Frontend service stopped
    ) else (
        echo [SKIP] Frontend service already stopped or not running
    )
) else (
    echo [SKIP] No running frontend service detected
)

if defined BACKEND_PID (
    echo [STOPPING] Stopping backend service (PID: %BACKEND_PID%)...
    taskkill /F /PID %BACKEND_PID% >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Backend service stopped
    ) else (
        echo [SKIP] Backend service already stopped or not running
    )
) else (
    echo [SKIP] No running backend service detected
)

echo [WAITING] Waiting for processes to fully stop...
timeout /t 2 /nobreak >nul

echo.
echo [STEP 2/6] Verifying ports have been released...
echo.

netstat -ano | findstr ":4005" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 4005 still in use, attempting force stop...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4005" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
) else (
    echo [OK] Port 4005 has been released
)

netstat -ano | findstr ":4006" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 4006 still in use, attempting force stop...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4006" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
) else (
    echo [OK] Port 4006 has been released
)

echo.
echo [STEP 3/6] Cleaning temporary resources...
echo.

if exist "dashboard-client\node_modules\.vite" (
    echo [CLEANUP] Cleaning Vite cache...
    rd /s /q "dashboard-client\node_modules\.vite" 2>nul
    echo [COMPLETE] Vite cache cleaned
)

if exist "%TEMP%\vite-*" (
    echo [CLEANUP] Cleaning system Vite temporary files...
    del /q /f "%TEMP%\vite-*" 2>nul
    echo [COMPLETE] System temp files cleaned
)

echo.
echo [STEP 4/6] Checking dependencies...
echo.

cd /d "dashboard-server"
if exist node_modules (
    echo [OK] Backend dependencies present
) else (
    echo [INSTALL] Backend dependencies not found, installing...
    call npm install
    if %errorlevel% equ 0 (
        echo [COMPLETE] Backend dependencies installed
    ) else (
        echo [ERROR] Backend dependencies installation failed
    )
)

cd /d "dashboard-client"
if exist node_modules (
    echo [OK] Frontend dependencies present
) else (
    echo [INSTALL] Frontend dependencies not found, installing...
    call npm install
    if %errorlevel% equ 0 (
        echo [COMPLETE] Frontend dependencies installed
    ) else (
        echo [ERROR] Frontend dependencies installation failed
    )
)

cd /d "%~dp0"

echo.
echo [STEP 5/6] Verifying Node.js environment...
echo.

node --version >nul
if %errorlevel% equ 0 (
    echo [OK] Node.js is available:
    node --version
) else (
    echo [ERROR] Node.js not found
)

echo.
echo [STEP 6/6] Starting services...
echo.

echo [STARTING] Backend service (http://localhost:4006)...
start "Dashboard Server" cmd /k "cd /d "%~dp0dashboard-server" ^&^& node server.js"

echo [WAITING] Waiting for backend service to initialize...
timeout /t 5 /nobreak >nul

netstat -ano | findstr ":4006" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend service started
) else (
    echo [FAILED] Backend service failed to start, please check error logs
)

echo.
echo [STARTING] Frontend service (http://localhost:4005)...
start "Dashboard Client" cmd /k "cd /d "%~dp0dashboard-client" ^&^& npm run dev"

echo [WAITING] Waiting for frontend service to initialize...
timeout /t 5 /nobreak >nul

netstat -ano | findstr ":4005" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend service started
) else (
    echo [FAILED] Frontend service failed to start, please check npm dependencies
)

echo.
echo ========================================
echo   Project Restart Complete!
echo ========================================
echo.
echo Service URLs:
echo   - Frontend: http://localhost:4005
echo   - Backend: http://localhost:4006
echo   - API:  http://localhost:4006/api
echo.
pause
