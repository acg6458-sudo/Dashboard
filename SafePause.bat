@echo off
chcp 65001 >nul
echo ========================================
echo   Dashboard Network Device Monitor - Safe Stop Script
echo ========================================
echo.

cd /d "%~dp0"

echo [STEP 1/4] Finding project-related processes...
echo.

echo [INFO] Looking for frontend service on port 4005...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4005" ^| findstr "LISTEN"') do (
    echo [FOUND] Frontend service process (PID: %%a)
    echo [STOPPING] Stopping frontend service...
    taskkill /F /PID %%a
)

echo.
echo [INFO] Looking for backend service on port 4006...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4006" ^| findstr "LISTEN"') do (
    echo [FOUND] Backend service process (PID: %%a)
    echo [STOPPING] Stopping backend service...
    taskkill /F /PID %%a
)

echo.
echo [STEP 2/4] Waiting for processes to terminate...
timeout /t 3 /nobreak >nul

echo.
echo [STEP 3/4] Verifying ports have been released...
echo.

netstat -ano | findstr ":4005" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 4005 still in use, forcing termination...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4005" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
) else (
    echo [OK] Port 4005 has been released
)

netstat -ano | findstr ":4006" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 4006 still in use, forcing termination...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4006" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
) else (
    echo [OK] Port 4006 has been released
)

echo.
echo [STEP 4/4] Final verification...
echo.

netstat -ano | findstr ":4005" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Frontend service still running
) else (
    echo [SUCCESS] Frontend service stopped
)

netstat -ano | findstr ":4006" | findstr "LISTEN" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Backend service still running
) else (
    echo [SUCCESS] Backend service stopped
)

echo.
echo ========================================
echo   Safe Stop Complete
echo ========================================
echo.
pause
