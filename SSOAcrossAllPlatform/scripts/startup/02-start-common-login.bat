@echo off
title Step 2: Start Common Login (SSO Hub)
echo ========================================
echo STEP 2: Starting Common Login Application
echo ========================================

echo Port: 5000
echo URL: http://localhost:5000
echo Role: Central SSO Authentication Hub
echo.

:: Check if port 5000 is already in use
netstat -an | findstr :5000 >nul 2>&1
if not errorlevel 1 (
    echo ✓ Common Login already running on port 5000
    echo ✓ Skipping startup...
) else (
    echo Starting Common Login...
    cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\CommonLogin"
    start "Common Login - Port 5000" cmd /k "dotnet run --urls http://localhost:5000"
    
    echo Waiting for Common Login to start...
    timeout /t 10 /nobreak >nul
    
    echo ✓ Common Login started successfully!
)
echo ✓ Next: Run 03-start-app1.bat
pause