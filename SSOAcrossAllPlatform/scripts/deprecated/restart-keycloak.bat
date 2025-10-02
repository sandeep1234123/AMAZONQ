@echo off
echo Stopping existing Keycloak...
taskkill /F /PID 5056 2>nul
timeout /t 3 >nul
echo Starting Keycloak...
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
cd ..\keycloak-23.0.7
call bin\kc.bat start-dev