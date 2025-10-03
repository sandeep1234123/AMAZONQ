@echo off
title Create Magic User Client in Keycloak
echo ========================================
echo CREATING MAGIC-USER CLIENT IN KEYCLOAK
echo ========================================
echo.
echo MANUAL STEPS REQUIRED:
echo.
echo 1. Open Keycloak Admin Console:
echo    URL: http://localhost:8081/admin
echo    Login: Admin / Admin_123
echo.
echo 2. Select Realm: sso-realm
echo.
echo 3. Go to Clients → Create client
echo.
echo 4. General Settings:
echo    Client type: OpenID Connect
echo    Client ID: magic-user
echo    Name: Magic Link Application
echo    Description: Passwordless authentication app
echo.
echo 5. Capability config:
echo    Client authentication: ON
echo    Authorization: OFF
echo    Standard flow: ON
echo    Direct access grants: ON
echo    Implicit flow: OFF
echo    Service accounts roles: OFF
echo.
echo 6. Login settings:
echo    Root URL: http://localhost:5200
echo    Home URL: http://localhost:5200
echo    Valid redirect URIs: http://localhost:5200/*
echo    Valid post logout redirect URIs: http://localhost:5200/*
echo    Web origins: http://localhost:5200
echo.
echo 7. Go to Credentials tab:
echo    Client Authenticator: Client Id and Secret
echo    Copy the Client Secret
echo.
echo 8. Update appsettings.json with the new Client Secret:
echo    "ClientSecret": "[paste-the-copied-secret]"
echo.
echo 9. Create a test user in sso-realm:
echo    Username: magictest
echo    Email: sandeepkumar1464@gmail.com
echo    Password: Magic123!
echo    Email verified: ON
echo.
echo ========================================
pause