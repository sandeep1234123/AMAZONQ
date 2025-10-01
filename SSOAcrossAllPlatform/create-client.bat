@echo off
echo Creating common-login client in Keycloak...

curl -X POST "http://localhost:8080/admin/realms/sso-realm/clients" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" ^
  -d "{\"clientId\":\"common-login\",\"enabled\":true,\"clientAuthenticatorType\":\"client-secret\",\"redirectUris\":[\"http://localhost:5000/signin-oidc\"],\"webOrigins\":[\"http://localhost:5000\"],\"standardFlowEnabled\":true,\"directAccessGrantsEnabled\":true}"

echo.
echo Client created. Get the secret from Keycloak Admin Console.
pause