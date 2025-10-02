@echo off
title SSO Platform - Sequential Startup
echo ========================================
echo SSO PLATFORM SEQUENTIAL STARTUP
echo ========================================

:: Check current status
echo Checking current application status...
echo.
netstat -an | findstr ":808" >nul 2>&1
if not errorlevel 1 (echo ✓ Keycloak: Running) else (echo ○ Keycloak: Stopped)
netstat -an | findstr ":5000" >nul 2>&1
if not errorlevel 1 (echo ✓ CommonLogin: Running) else (echo ○ CommonLogin: Stopped)
netstat -an | findstr ":5101" >nul 2>&1
if not errorlevel 1 (echo ✓ App1: Running) else (echo ○ App1: Stopped)
netstat -an | findstr ":5102" >nul 2>&1
if not errorlevel 1 (echo ✓ App2: Running) else (echo ○ App2: Stopped)
netstat -an | findstr ":5103" >nul 2>&1
if not errorlevel 1 (echo ✓ App3: Running) else (echo ○ App3: Stopped)

echo.
echo Press any key to continue or Ctrl+C to cancel
pause >nul

call "D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\01-start-keycloak.bat"
call "D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\02-start-common-login.bat"
call "D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\03-start-app1.bat"
call "D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\04-start-app2.bat"
call "D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\05-start-app3.bat"

echo.
echo ========================================
echo FINAL STATUS CHECK
echo ========================================
netstat -an | findstr ":808" >nul 2>&1
if not errorlevel 1 (echo ✓ Keycloak: Running) else (echo ✗ Keycloak: Failed)
netstat -an | findstr ":5000" >nul 2>&1
if not errorlevel 1 (echo ✓ CommonLogin: Running) else (echo ✗ CommonLogin: Failed)
netstat -an | findstr ":5101" >nul 2>&1
if not errorlevel 1 (echo ✓ App1: Running) else (echo ✗ App1: Failed)
netstat -an | findstr ":5102" >nul 2>&1
if not errorlevel 1 (echo ✓ App2: Running) else (echo ✗ App2: Failed)
netstat -an | findstr ":5103" >nul 2>&1
if not errorlevel 1 (echo ✓ App3: Running) else (echo ✗ App3: Failed)
echo ========================================
echo Test SSO by visiting any application URL
pause