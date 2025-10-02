@echo off
title Stop All SSO Applications
echo ========================================
echo STOPPING ALL SSO APPLICATIONS
echo ========================================

echo Stopping Keycloak...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":808"') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopping .NET Applications...
taskkill /F /IM dotnet.exe 2>nul

echo Stopping Command Windows...
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Common Login*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq App1*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq App2*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq App3*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Keycloak*" 2>nul

echo.
echo ✓ All applications stopped successfully!
pause