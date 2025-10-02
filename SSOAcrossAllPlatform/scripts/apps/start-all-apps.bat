@echo off
title Starting All SSO Applications
echo ========================================
echo Starting All SSO Applications
echo ========================================

cd ..\..

echo Starting CommonLogin (Port 5000)...
start "CommonLogin" cmd /k "cd CommonLogin && dotnet run"

timeout /t 3 >nul

echo Starting App1 (Port 5101)...
start "App1" cmd /k "cd App1 && dotnet run"

timeout /t 2 >nul

echo Starting App2 (Port 5102)...
start "App2" cmd /k "cd App2 && dotnet run"

timeout /t 2 >nul

echo Starting App3 (Port 5103)...
start "App3" cmd /k "cd App3 && dotnet run"

echo.
echo All applications started!
echo - CommonLogin: http://localhost:5000
echo - App1: http://localhost:5101
echo - App2: http://localhost:5102
echo - App3: http://localhost:5103
pause