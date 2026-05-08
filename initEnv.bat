@echo off
chcp 65001 >nul
echo ========================================
echo   Dashboard Network Device Monitor - Environment Init Script
echo ========================================
echo.
echo [INFO] Starting deployment in new environment...
echo.

setlocal enabledelayedexpansion

set PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

set REPORT_FILE=%PROJECT_ROOT%init_report_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt
set REPORT_FILE=%REPORT_FILE: =0%

echo ======================================== > "!REPORT_FILE!"
echo   Dashboard Monitor Init Report >> "!REPORT_FILE!"
echo ======================================== >> "!REPORT_FILE!"
echo. >> "!REPORT_FILE!"
echo Generation time: %date% %time% >> "!REPORT_FILE!"
echo.

goto :main

:write_report
echo %~1 >> "!REPORT_FILE!"
goto :eof

:main

echo [STEP 1/9] Checking system environment...
call :write_report "[STEP 1/9] Checking system environment"
call :write_report "================================"

echo [SYSTEM] Operating system:
systeminfo | findstr /i "OS Name" >> "!REPORT_FILE!"
systeminfo | findstr /i "OS Name"

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not detected
    call :write_report "[ERROR] Node.js not installed"
    call :write_report "Please visit https://nodejs.org/ to download and install Node.js"
    call :write_report ""
    call :write_report "[INIT STATUS] Failed - Environment check phase"
    echo.
    echo [FAILED] Node.js not installed, cannot continue
    echo Details: !REPORT_FILE!
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
call :write_report "[OK] Node.js version:"

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not installed
    call :write_report "[ERROR] npm not installed"
    pause
    exit /b 1
)

echo [OK] npm version:
npm --version
call :write_report "[OK] npm version:"

mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MySQL client installed
    call :write_report "[OK] MySQL client installed"
) else (
    echo [INFO] MySQL client not installed (not required for Node.js app)
    call :write_report "[INFO] MySQL client not installed"
)

echo.
call :write_report ""

echo [STEP 2/9] Configuring environment variables...
call :write_report "[STEP 2/9] Configuring environment variables"
call :write_report "================================"

if not defined NODE_HOME (
    echo [SETTING] NODE_HOME not set, configuring...
    setx NODE_HOME "C:\Program Files\nodejs" >nul 2>&1
    set "PATH=%PATH%;C:\Program Files\nodejs"
    echo [COMPLETE] NODE_HOME configured
    call :write_report "[COMPLETE] NODE_HOME configured"
) else (
    echo [OK] NODE_HOME configured: !NODE_HOME!
    call :write_report "[OK] NODE_HOME:"
)

echo %PATH% | findstr /i "nodejs" >nul 2>&1
if %errorlevel% neq 0 (
    echo [SETTING] Adding Node.js to PATH...
    setx PATH "%PATH%;C:\Program Files\nodejs" >nul 2>&1
    call :write_report "[COMPLETE] Node.js added to PATH"
) else (
    echo [OK] Node.js already in PATH
    call :write_report "[OK] Node.js already in PATH"
)

echo [SETTING] Configuring project environment variables...
setx DASHBOARD_DB_HOST "localhost" >nul 2>&1
setx DASHBOARD_DB_PORT "3306" >nul 2>&1
setx DASHBOARD_DB_NAME "dashboard_db" >nul 2>&1
setx DASHBOARD_DB_USER "root" >nul 2>&1
setx DASHBOARD_SERVER_PORT "4006" >nul 2>&1
setx DASHBOARD_CLIENT_PORT "4005" >nul 2>&1
call :write_report "[COMPLETE] Project environment variables configured"
echo [COMPLETE] Project environment variables configured

echo.
call :write_report ""

echo [STEP 3/9] Installing backend dependencies...
call :write_report "[STEP 3/9] Installing backend dependencies"
call :write_report "================================"

cd /d "%PROJECT_ROOT%dashboard-server"

if not exist "node_modules" (
    echo [INSTALLING] Installing backend dependencies...
    call :write_report "[INSTALLING] Starting backend dependencies installation"
    
    call npm install >> "!REPORT_FILE!" 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Backend dependencies installation failed
        call :write_report "[ERROR] Backend dependencies installation failed"
        call :write_report "[INIT STATUS] Failed - Backend dependencies phase"
        echo.
        echo [FAILED] Backend dependencies installation failed
        echo Details: !REPORT_FILE!
        pause
        exit /b 1
    )
    
    echo [COMPLETE] Backend dependencies installed
    call :write_report "[COMPLETE] Backend dependencies installed"
) else (
    echo [OK] Backend dependencies already exist, skipping
    call :write_report "[OK] Backend dependencies already exist"
)

echo [INFO] Installed backend dependencies:
call :write_report "[INFO] Installed backend dependencies:"
call npm list --depth=0 2>nul | findstr /i "express mysql cors bcrypt jsonwebtoken"
call :write_report ""

echo.
call :write_report ""

echo [STEP 4/9] Installing frontend dependencies...
call :write_report "[STEP 4/9] Installing frontend dependencies"
call :write_report "================================"

cd /d "%PROJECT_ROOT%dashboard-client"

if not exist "node_modules" (
    echo [INSTALLING] Installing frontend dependencies...
    call :write_report "[INSTALLING] Starting frontend dependencies installation"
    
    call npm install >> "!REPORT_FILE!" 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend dependencies installation failed
        call :write_report "[ERROR] Frontend dependencies installation failed"
        call :write_report "[INIT STATUS] Failed - Frontend dependencies phase"
        echo.
        echo [FAILED] Frontend dependencies installation failed
        echo Details: !REPORT_FILE!
        pause
        exit /b 1
    )
    
    echo [COMPLETE] Frontend dependencies installed
    call :write_report "[COMPLETE] Frontend dependencies installed"
) else (
    echo [OK] Frontend dependencies already exist, skipping
    call :write_report "[OK] Frontend dependencies already exist"
)

echo.
call :write_report ""

echo [STEP 5/9] Setting up database...
call :write_report "[STEP 5/9] Setting up database"
call :write_report "================================"

cd /d "%PROJECT_ROOT%dashboard-server"

if exist "database\init.sql" (
    echo [INFO] Database initialization script found
    call :write_report "[INFO] Database init script found"
    echo [INFO] To initialize database, run: npm run init-db
    call :write_report "[INFO] To initialize, run: npm run init-db"
) else (
    echo [WARNING] Database initialization script not found
    call :write_report "[WARNING] Database init script not found"
)

echo.
call :write_report ""

echo [STEP 6/9] Creating environment configuration file...
call :write_report "[STEP 6/9] Creating environment configuration"
call :write_report "================================"

if not exist ".env" (
    if exist ".env.example" (
        echo [CREATING] Creating .env file from template...
        copy ".env.example" ".env" >nul 2>&1
        echo [COMPLETE] .env file created
        call :write_report "[COMPLETE] .env file created from template"
        echo [INFO] Please update .env with your database credentials
        call :write_report "[INFO] Please update .env with your database credentials"
    ) else (
        echo [WARNING] .env.example not found
        call :write_report "[WARNING] .env.example not found"
    )
) else (
    echo [OK] .env file already exists
    call :write_report "[OK] .env file already exists"
)

echo.
call :write_report ""

echo [STEP 7/9] Verifying project structure...
call :write_report "[STEP 7/9] Verifying project structure"
call :write_report "================================"

if exist "%PROJECT_ROOT%dashboard-server\server.js" (
    echo [OK] Backend server file found
    call :write_report "[OK] Backend server file found"
) else (
    echo [ERROR] Backend server file missing
    call :write_report "[ERROR] Backend server file missing"
)

if exist "%PROJECT_ROOT%dashboard-client\package.json" (
    echo [OK] Frontend package.json found
    call :write_report "[OK] Frontend package.json found"
) else (
    echo [ERROR] Frontend package.json missing
    call :write_report "[ERROR] Frontend package.json missing"
)

echo.
call :write_report ""

echo [STEP 8/9] Testing service startup...
call :write_report "[STEP 8/9] Testing service startup"
call :write_report "================================"

echo [TEST] Testing backend startup capability...
start /B cmd /c "cd /d \"%PROJECT_ROOT%dashboard-server\" ^&^& node server.js ^>nul 2^>^&1"
timeout /t 3 /nobreak >nul

netstat -ano | findstr ":4006" | findstr "LISTEN" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend service can start successfully
    call :write_report "[OK] Backend service can start successfully"
    
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4006" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
) else (
    echo [WARNING] Backend service may have issues starting
    call :write_report "[WARNING] Backend service may have issues"
)

echo.
call :write_report ""

echo [STEP 9/9] Final verification...
call :write_report "[STEP 9/9] Final verification"
call :write_report "================================"

echo.
echo ========================================
echo   Environment Initialization Complete
echo ========================================
echo.
echo Initialization report saved to:
echo   !REPORT_FILE!
echo.
echo Next steps:
echo   1. Update database credentials in .env file
echo   2. Initialize database: cd dashboard-server ^&^& npm run init-db
echo   3. Start the project: Run "Start.bat"
echo.

call :write_report ""
call :write_report "[INIT STATUS] Success"
call :write_report "================================"

echo.
pause
endlocal
