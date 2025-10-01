@echo off
echo Creating App3 Client in Keycloak...

curl -X POST "http://localhost:8080/admin/realms/sso-realm/clients" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %KEYCLOAK_TOKEN%" ^
  -d "{\"clientId\":\"app3-client\",\"protocol\":\"openid-connect\",\"clientAuthenticatorType\":\"client-secret\",\"secret\":\"app3-client-secret\",\"redirectUris\":[\"http://localhost:5103/*\"],\"webOrigins\":[\"http://localhost:5103\"],\"standardFlowEnabled\":true}"

echo App3 client created successfully!
pause