@echo off
echo Creating App3 Client in Keycloak...

echo.
echo Manual Steps:
echo 1. Go to http://localhost:8080
echo 2. Login as admin/admin
echo 3. Select "sso-realm"
echo 4. Go to Clients → Create Client
echo 5. Client ID: app3-client
echo 6. Client Type: OpenID Connect
echo 7. Click Save
echo 8. Set Client Secret: app3-client-secret-2025
echo 9. Valid Redirect URIs: http://localhost:5103/*
echo 10. Web Origins: http://localhost:5103
echo 11. Save
echo.
pause