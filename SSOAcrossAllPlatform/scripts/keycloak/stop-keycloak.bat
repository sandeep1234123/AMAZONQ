@echo off
echo Stopping Keycloak...

:: Kill Java processes on Keycloak ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":808"') do (
    taskkill /F /PID %%a 2>nul
)

echo Keycloak stopped.
pause