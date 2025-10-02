@echo off
title Start All SSO Applications Now
echo ========================================
echo STARTING ALL SSO APPLICATIONS
echo ========================================

:: Kill any existing processes
echo Stopping existing applications...
taskkill /F /IM dotnet.exe 2>nul
taskkill /F /IM java.exe 2>nul
timeout /t 2 >nul

:: Start Keycloak
echo Starting Keycloak...
cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\keycloak-23.0.7"
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
start "Keycloak" cmd /c "bin\kc.bat start-dev --http-port=8081"
timeout /t 10 >nul

:: Start all .NET applications simultaneously
echo Starting all .NET applications...

start "CommonLogin" cmd /c "cd /d D:\AMAZONQ\SSOAcrossAllPlatform\CommonLogin && dotnet run --urls http://localhost:5000"
timeout /t 3 >nul

start "App1" cmd /c "cd /d D:\AMAZONQ\SSOAcrossAllPlatform\App1 && dotnet run --urls http://localhost:5101"
timeout /t 2 >nul

start "App2" cmd /c "cd /d D:\AMAZONQ\SSOAcrossAllPlatform\App2 && dotnet run --urls http://localhost:5102"
timeout /t 2 >nul

start "App3" cmd /c "cd /d D:\AMAZONQ\SSOAcrossAllPlatform\App3 && dotnet run --urls http://localhost:5103"

echo.
echo Waiting for all applications to start...
timeout /t 15 >nul

echo.
echo ========================================
echo CHECKING APPLICATION STATUS
echo ========================================
netstat -an | findstr ":808" >nul && echo ✓ Keycloak: Running || echo ✗ Keycloak: Failed
netstat -an | findstr ":5000" >nul && echo ✓ CommonLogin: Running || echo ✗ CommonLogin: Failed
netstat -an | findstr ":5101" >nul && echo ✓ App1: Running || echo ✗ App1: Failed
netstat -an | findstr ":5102" >nul && echo ✓ App2: Running || echo ✗ App2: Failed
netstat -an | findstr ":5103" >nul && echo ✓ App3: Running || echo ✗ App3: Failed

echo.
echo ========================================
echo ACCESS YOUR APPLICATIONS
echo ========================================
echo Keycloak Admin: http://localhost:8081/admin
echo CommonLogin: http://localhost:5000
echo App1: http://localhost:5101
echo App2: http://localhost:5102
echo App3: http://localhost:5103
echo ========================================
pause