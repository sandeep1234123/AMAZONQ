@echo off
echo ========================================
echo Keycloak Configuration for App3
echo ========================================

echo Step 1: Get Admin Token...
for /f "tokens=*" %%i in ('curl -s -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=admin&password=admin&grant_type=password&client_id=admin-cli" ^| jq -r .access_token') do set ADMIN_TOKEN=%%i

if "%ADMIN_TOKEN%"=="null" (
    echo ERROR: Failed to get admin token. Check Keycloak admin credentials.
    pause
    exit /b 1
)

echo Step 2: Create App3 Client...
curl -X POST "http://localhost:8080/admin/realms/sso-realm/clients" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"clientId\":\"app3-client\",\"protocol\":\"openid-connect\",\"clientAuthenticatorType\":\"client-secret\",\"secret\":\"app3-client-secret-2025\",\"redirectUris\":[\"http://localhost:5103/*\"],\"webOrigins\":[\"http://localhost:5103\"],\"standardFlowEnabled\":true,\"implicitFlowEnabled\":false,\"directAccessGrantsEnabled\":true}"

echo Step 3: Create app3-user Role...
curl -X POST "http://localhost:8080/admin/realms/sso-realm/roles" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"app3-user\",\"description\":\"Application 3 User Role\"}"

echo Step 4: Configure LDAP User Federation...
curl -X POST "http://localhost:8080/admin/realms/sso-realm/components" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"ldap-app3\",\"providerId\":\"ldap\",\"providerType\":\"org.keycloak.storage.UserStorageProvider\",\"config\":{\"connectionUrl\":[\"ldap://localhost:389\"],\"usersDn\":[\"CN=Users,DC=company,DC=com\"],\"bindDn\":[\"CN=keycloak-service,CN=Users,DC=company,DC=com\"],\"bindCredential\":[\"ServicePassword123\"],\"usernameLDAPAttribute\":[\"sAMAccountName\"],\"rdnLDAPAttribute\":[\"cn\"],\"uuidLDAPAttribute\":[\"objectGUID\"],\"userObjectClasses\":[\"person, organizationalPerson, user\"]}}"

echo ========================================
echo Configuration Complete!
echo ========================================
echo Client ID: app3-client
echo Client Secret: app3-client-secret-2025
echo Role Created: app3-user
echo LDAP Federation: Configured
echo ========================================
pause