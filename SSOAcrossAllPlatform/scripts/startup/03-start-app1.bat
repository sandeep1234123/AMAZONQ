@echo off
title Step 3: Start App1 (Business Application)
echo ========================================
echo STEP 3: Starting App1 Business Application
echo ========================================

echo Port: 5101
echo URL: http://localhost:5101
echo Required Roles: app1-user, admin
echo.

:: Check if port 5101 is already in use
netstat -an | findstr :5101 >nul 2>&1
if not errorlevel 1 (
    echo ✓ App1 already running on port 5101
    echo ✓ Skipping startup...
) else (
    echo Starting App1...
    cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\App1"
    start "App1 - Port 5101" cmd /k "dotnet run --urls http://localhost:5101"
    
    echo Waiting for App1 to start...
    timeout /t 8 /nobreak >nul
    
    echo ✓ App1 started successfully!
)
echo ✓ Next: Run 04-start-app2.bat
pause