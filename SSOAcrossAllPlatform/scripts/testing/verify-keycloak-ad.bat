@echo off
echo ========================================
echo Keycloak AD Integration Verification
echo ========================================

echo Step 1: Testing Keycloak availability...
curl -s http://localhost:8080/realms/sso-realm/.well-known/openid-configuration > nul
if %errorlevel% equ 0 (
    echo ✓ Keycloak is running
) else (
    echo ✗ Keycloak not responding
    goto :error
)

echo Step 2: Testing realm configuration...
curl -s "http://localhost:8080/realms/sso-realm" > nul
if %errorlevel% equ 0 (
    echo ✓ sso-realm exists
) else (
    echo ✗ sso-realm not found
    goto :error
)

echo Step 3: Manual verification needed...
echo.
echo Please verify in Keycloak Admin Console:
echo 1. User Federation → LDAP provider configured
echo 2. Users → testuser exists
echo 3. Realm roles → app3-user exists
echo 4. Clients → app3-client configured
echo.
echo Opening Keycloak Admin Console...
start http://localhost:8080/admin
echo.
echo Opening App3 for testing...
start http://localhost:5103
echo.
echo Test credentials:
echo Username: testuser
echo Password: Test123!
echo.
goto :end

:error
echo.
echo ERROR: Please start Keycloak first
echo Run: start-keycloak.bat
echo.

:end
pause