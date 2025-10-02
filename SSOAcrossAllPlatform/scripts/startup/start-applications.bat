@echo off
title SSO Platform Launcher
echo ==========================================
echo Starting SSO Platform for Windows 11
echo ==========================================
echo.

:: Check if .NET is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET 8 SDK not found!
    echo Please install from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

:: Check if Keycloak is running
netstat -an | findstr :8080 >nul
if errorlevel 1 (
    echo WARNING: Keycloak not detected on port 8080
    echo Please start Keycloak first using: start-keycloak.bat
    echo.
    choice /C YN /M "Continue anyway"
    if errorlevel 2 exit /b 1
)

echo Building applications...
dotnet build --configuration Release >nul
if errorlevel 1 (
    echo ERROR: Failed to build applications
    pause
    exit /b 1
)

echo.
echo Starting applications in separate windows...
echo.

echo [1/3] Starting CommonLogin on port 5000...
start "CommonLogin - SSO Portal" cmd /k "title CommonLogin Port 5000 && cd CommonLogin && echo Starting CommonLogin... && dotnet run --urls=http://localhost:5000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting App1 on port 5001...
start "App1 - Business Application" cmd /k "title App1 Port 5001 && cd App1 && echo Starting App1... && dotnet run --urls=http://localhost:5001"

timeout /t 3 /nobreak >nul

echo [3/3] Starting App2 on port 5002...
start "App2 - Business Application" cmd /k "title App2 Port 5002 && cd App2 && echo Starting App2... && dotnet run --urls=http://localhost:5002"

echo.
echo ==========================================
echo All applications are starting...
echo Please wait 30-60 seconds for full startup
echo ==========================================
echo.
echo Application URLs:
echo   CommonLogin:    http://localhost:5000
echo   App1:          http://localhost:5001
echo   App2:          http://localhost:5002
echo   Keycloak Admin: http://localhost:8080
echo.
echo Test Users:
echo   admin.user / Admin123!     (All Apps)
echo   app1.user / App1User123!   (App1 Only)
echo   app2.user / App2User123!   (App2 Only)
echo   multi.user / MultiUser123! (App1 & App2)
echo.
echo Press any key to open CommonLogin in browser...
pause >nul
start http://localhost:5000