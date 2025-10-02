@echo off
title Step 1: Start Keycloak Server
echo ========================================
echo STEP 1: Starting Keycloak Server
echo ========================================

:: Set Java path
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"

:: Check if Keycloak is already running
netstat -an | findstr ":808" >nul 2>&1
if not errorlevel 1 (
    echo ✓ Keycloak already running
    echo ✓ Skipping startup...
) else (
    :: Find available port
    set PORT=8080
    netstat -an | findstr :8080 >nul 2>&1
    if not errorlevel 1 (
        set PORT=8081
        netstat -an | findstr :8081 >nul 2>&1
        if not errorlevel 1 (
            set PORT=8082
        )
    )
    
    echo Starting Keycloak on port %PORT%...
    echo Admin Console: http://localhost:%PORT%/admin
    echo Username: Admin
    echo Password: Admin_123
    echo.
    
    cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\keycloak-23.0.7"
    start "Keycloak Server" cmd /k "bin\kc.bat start-dev --http-port=%PORT%"
    
    echo Waiting for Keycloak to start...
    timeout /t 15 /nobreak >nul
    
    echo ✓ Keycloak started successfully!
)
echo ✓ Next: Run 02-start-common-login.bat
pause