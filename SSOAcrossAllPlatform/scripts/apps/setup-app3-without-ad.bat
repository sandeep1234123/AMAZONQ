@echo off
echo ========================================
echo App3 Setup WITHOUT Active Directory
echo ========================================

echo Step 1: Starting Keycloak...
cd keycloak-23.0.7
start "Keycloak Server" cmd /k "bin\kc.bat start-dev --http-port=8080"
cd ..

echo Waiting for Keycloak to start...
timeout /t 30

echo Step 2: Testing Keycloak connection...
curl -s http://localhost:8080/realms/sso-realm/.well-known/openid-configuration > nul
if %errorlevel% neq 0 (
    echo ERROR: Keycloak not responding. Please start manually.
    pause
    exit /b 1
)

echo Step 3: Starting App3...
start "App3" cmd /k "cd App3 && dotnet run --urls=http://localhost:5103"

echo ========================================
echo Setup Complete!
echo ========================================
echo App3 URL: http://localhost:5103
echo Keycloak Admin: http://localhost:8080
echo.
echo Test Credentials (Local Auth):
echo Username: app3user
echo Password: App3Pass123
echo.
echo Next Steps:
echo 1. Access http://localhost:5103
echo 2. Use "Local Login (Fallback)" option
echo 3. Configure AD later using manual steps
echo ========================================
pause