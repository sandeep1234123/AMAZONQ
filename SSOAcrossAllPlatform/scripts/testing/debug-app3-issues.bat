@echo off
echo ========================================
echo App3 Troubleshooting Checklist
echo ========================================

echo Step 1: Check if Keycloak is running...
curl -s http://localhost:8080/realms/sso-realm/.well-known/openid-configuration > nul
if %errorlevel% equ 0 (
    echo ✓ Keycloak is running
) else (
    echo ✗ Keycloak not running - Start it first
    goto :end
)

echo Step 2: Check if App3 is running...
curl -s http://localhost:5103 > nul
if %errorlevel% equ 0 (
    echo ✓ App3 is running on port 5103
) else (
    echo ✗ App3 not running on port 5103
    echo Starting App3...
    start "App3" cmd /k "cd App3 && dotnet run --urls=http://localhost:5103"
    timeout /t 10
)

echo Step 3: Check app3-client exists...
echo Manual check required in Keycloak Admin Console

echo Step 4: Check testuser exists...
echo Manual check required in Keycloak Admin Console

echo ========================================
echo Manual Verification Steps:
echo ========================================
echo 1. Go to http://localhost:8080/admin
echo 2. Login: admin/admin
echo 3. Select sso-realm
echo 4. Check Clients → app3-client exists
echo 5. Check Users → testuser exists
echo 6. Check Realm roles → app3-user exists
echo 7. Check testuser has app3-user role assigned
echo ========================================

echo Opening required URLs...
start http://localhost:8080/admin
start http://localhost:5103

:end
pause