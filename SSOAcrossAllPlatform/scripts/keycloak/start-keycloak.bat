@echo off
title Keycloak Server
echo ========================================
echo Starting Keycloak Server
echo ========================================

:: Set Java path
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"

:: Check if Keycloak exists
if not exist "..\..\keycloak-23.0.7" (
    echo ERROR: Keycloak not found!
    echo Run setup\install-keycloak.bat first
    pause
    exit /b 1
)

:: Find available port
set PORT=8080
netstat -an | findstr :8080 >nul
if not errorlevel 1 (
    set PORT=8081
    netstat -an | findstr :8081 >nul
    if not errorlevel 1 (
        set PORT=8082
    )
)

echo Starting Keycloak on port %PORT%...
echo URL: http://localhost:%PORT%
echo Admin: http://localhost:%PORT%/admin
echo.

cd ..\..\keycloak-23.0.7
call bin\kc.bat start-dev --http-port=%PORT%