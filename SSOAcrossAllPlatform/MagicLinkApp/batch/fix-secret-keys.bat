@echo off
echo Fixing Secret Key Configuration...
echo.

echo Step 1: Get Keycloak Client Secret
echo ================================
echo 1. Open: http://localhost:8081/admin
echo 2. Login: Admin / Admin_123  
echo 3. Go to: sso-realm ^> Clients ^> magic-user ^> Credentials
echo 4. Copy the Client Secret
echo.

echo Step 2: Update appsettings.json
echo ===============================
echo Edit: appsettings.json
echo.
echo Update these sections:
echo "Keycloak": {
echo   "ClientSecret": "[PASTE_KEYCLOAK_SECRET_HERE]"
echo }
echo "MagicLink": {
echo   "SecretKey": "ML_kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS_2024"
echo }
echo.

echo Step 3: Test Configuration
echo ==========================
echo After updating appsettings.json:
echo 1. Run: simple-magic-link-test.bat
echo 2. Test magic link generation
echo 3. Verify Keycloak authentication
echo.

echo Opening Keycloak Admin Console...
start "" "http://localhost:8081/admin"

echo.
echo Opening appsettings.json for editing...
start "" "notepad" "appsettings.json"

echo.
echo Press any key after updating the configuration...
pause

echo.
echo Testing updated configuration...
call simple-magic-link-test.bat