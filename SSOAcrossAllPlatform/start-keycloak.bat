@echo off
title Keycloak 23.0.7 Server
echo ========================================
echo Starting Keycloak 23.0.7 for Windows 11
echo ========================================
echo.

:: Check if Keycloak directory exists
if not exist "keycloak-23.0.7" (
    echo ERROR: keycloak-23.0.7 directory not found!
    echo.
    echo Please run setup-windows11.ps1 first, or download manually:
    echo https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip
    echo.
    pause
    exit /b 1
)

:: Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java not found!
    echo Please install Java 11+ from: https://adoptium.net/
    pause
    exit /b 1
)

echo Java found - Starting Keycloak...
echo.
echo Keycloak will be available at: http://localhost:8080
echo Admin Console: http://localhost:8080/admin
echo.
echo Press Ctrl+C to stop Keycloak
echo ========================================
echo.

cd keycloak-23.0.7
bin\kc.bat start-dev --http-port=8080

echo.
echo Keycloak stopped.
pause