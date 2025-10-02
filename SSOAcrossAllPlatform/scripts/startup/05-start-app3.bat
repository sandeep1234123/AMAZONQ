@echo off
title Step 5: Start App3 (Business Application)
echo ========================================
echo STEP 5: Starting App3 Business Application
echo ========================================

echo Port: 5103
echo URL: http://localhost:5103
echo Required Roles: app3-user, admin
echo.

:: Check if port 5103 is already in use
netstat -an | findstr :5103 >nul 2>&1
if not errorlevel 1 (
    echo ✓ App3 already running on port 5103
    echo ✓ Skipping startup...
) else (
    echo Starting App3...
    cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\App3"
    start "App3 - Port 5103" cmd /k "dotnet run --urls http://localhost:5103"
    
    echo Waiting for App3 to start...
    timeout /t 8 /nobreak >nul
    
    echo ✓ App3 started successfully!
)
echo ✓ All applications are now running!
echo.
echo ========================================
echo SSO PLATFORM READY
echo ========================================
echo Keycloak Admin: http://localhost:8080/admin (or 8081/8082)
echo Common Login: http://localhost:5000
echo App1: http://localhost:5101
echo App2: http://localhost:5102
echo App3: http://localhost:5103
echo ========================================
pause