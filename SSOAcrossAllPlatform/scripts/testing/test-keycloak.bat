@echo off
echo Testing Keycloak client configuration...
echo.

echo 1. Testing realm endpoint:
curl -s "http://localhost:8080/realms/sso-realm/.well-known/openid-configuration" | findstr "authorization_endpoint" || echo "REALM NOT FOUND"

echo.
echo 2. Testing client with token request:
curl -X POST "http://localhost:8080/realms/sso-realm/protocol/openid-connect/token" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "grant_type=client_credentials&client_id=common-login&client_secret=REPLACE_WITH_ACTUAL_SECRET_FROM_KEYCLOAK"

echo.
echo If you see "invalid_client" - the client secret is wrong
echo If you see "access_token" - the client is configured correctly
pause