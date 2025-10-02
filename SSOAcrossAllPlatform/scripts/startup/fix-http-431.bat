@echo off
title Fix HTTP 431 Error - Restart All Applications
echo ========================================
echo FIXING HTTP 431 ERROR - RESTARTING APPS
echo ========================================

echo Stopping all .NET applications...
taskkill /F /IM dotnet.exe 2>nul

echo Waiting for processes to stop...
timeout /t 3 >nul

echo Restarting applications with increased header limits...
echo.

echo [1/4] Starting Keycloak...
call 01-start-keycloak.bat

echo [2/4] Starting CommonLogin...
call 02-start-common-login.bat

echo [3/4] Starting App1...
call 03-start-app1.bat

echo [4/4] Starting App2...
call 04-start-app2.bat

echo [5/4] Starting App3...
call 05-start-app3.bat

echo.
echo ========================================
echo HTTP 431 FIX APPLIED - ALL APPS RESTARTED
echo ========================================
echo All applications now have increased header limits:
echo - MaxRequestHeadersTotalSize: 64KB
echo - MaxRequestHeaderCount: 200
echo - MaxRequestLineSize: 16KB
echo - MaxRequestBufferSize: 1MB
pause