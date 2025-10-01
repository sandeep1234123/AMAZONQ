@echo off
echo Testing Keycloak Connection...

curl -s http://localhost:8080/realms/sso-realm/.well-known/openid-configuration
if %errorlevel% equ 0 (
    echo SUCCESS: Keycloak is running
) else (
    echo ERROR: Keycloak not responding
)

echo.
echo Testing realm configuration...
curl -s http://localhost:8080/realms/sso-realm/protocol/openid-connect/certs
if %errorlevel% equ 0 (
    echo SUCCESS: Realm sso-realm exists
) else (
    echo ERROR: Realm sso-realm not found
)

pause