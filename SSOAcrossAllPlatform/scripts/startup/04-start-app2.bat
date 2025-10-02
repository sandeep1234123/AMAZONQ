@echo off
title Step 4: Start App2 (Business Application)
echo ========================================
echo STEP 4: Starting App2 Business Application
echo ========================================

echo Port: 5102
echo URL: http://localhost:5102
echo Required Roles: app2-user, admin
echo.

:: Check if port 5102 is already in use
netstat -an | findstr :5102 >nul 2>&1
if not errorlevel 1 (
    echo ✓ App2 already running on port 5102
    echo ✓ Skipping startup...
) else (
    echo Starting App2...
    cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\App2"
    start "App2 - Port 5102" cmd /k "dotnet run --urls http://localhost:5102"
    
    echo Waiting for App2 to start...
    timeout /t 8 /nobreak >nul
    
    echo ✓ App2 started successfully!
)
echo ✓ Next: Run 05-start-app3.bat
pause