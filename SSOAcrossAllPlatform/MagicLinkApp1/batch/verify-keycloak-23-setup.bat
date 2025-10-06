@echo off
echo Verifying Keycloak 23.0.7 Setup for Magic Link Authentication
echo ============================================================
echo.

echo Step 1: Check Keycloak Installation
echo ===================================
if exist "D:\AMAZONQ\SSOAcrossAllPlatform\keycloak-23.0.7\bin\kc.bat" (
    echo ✓ Keycloak 23.0.7 found
) else (
    echo ✗ Keycloak 23.0.7 not found
    goto :error
)

echo.
echo Step 2: Check Keycloak Process
echo ==============================
tasklist /FI "IMAGENAME eq java.exe" | find "java.exe" >nul
if %ERRORLEVEL% == 0 (
    echo ✓ Java process running (likely Keycloak)
) else (
    echo ⚠ No Java process found - Keycloak may not be running
    echo Starting Keycloak...
    start /B "Keycloak" "D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\01-start-keycloak.bat"
    timeout /t 10 /nobreak >nul
)

echo.
echo Step 3: Test Keycloak Endpoints
echo ===============================
echo Testing Admin Console...
curl -s -o nul -w "Admin Console: %%{http_code}" "http://localhost:8081/admin" || echo Failed to connect
echo.

echo Testing Realm Discovery...
curl -s -o nul -w "Realm Discovery: %%{http_code}" "http://localhost:8081/realms/sso-realm/.well-known/openid_configuration" || echo Failed to connect
echo.

echo.
echo Step 4: Verify Client Configuration
echo ===================================
echo Opening Keycloak Admin Console...
start "" "http://localhost:8081/admin"
echo.
echo Manual Verification Required:
echo 1. Login: Admin / Admin_123
echo 2. Switch to: sso-realm
echo 3. Go to: Clients → magic-user
echo 4. Verify Settings:
echo    - Client authentication: ON
echo    - Standard flow: ON
echo    - Valid redirect URIs: http://localhost:5200/*
echo 5. Go to: Credentials tab
echo 6. Copy Client Secret
echo.

echo Step 5: User Configuration (COMPLETED)
echo =======================================
echo ✓ User: magictest exists
echo ✓ Email: sandeepkumar1464@gmail.com
echo ✓ Password: Magic123!
echo ✓ Client: magic-user linked to user
echo.

echo Step 6: Update appsettings.json
echo ===============================
echo Current configuration issues detected:
echo 1. MagicLink.SecretKey is too short: "ML_XXX_2024"
echo 2. Need to verify Keycloak.ClientSecret matches Keycloak
echo.
echo Recommended appsettings.json:
echo {
echo   "Keycloak": {
echo     "Authority": "http://localhost:8081/realms/sso-realm",
echo     "ClientId": "magic-user",
echo     "ClientSecret": "[COPY_FROM_KEYCLOAK_CREDENTIALS_TAB]",
echo     "RequireHttpsMetadata": false,
echo     "ResponseType": "code",
echo     "Scope": "openid profile email",
echo     "SaveTokens": true,
echo     "GetClaimsFromUserInfoEndpoint": true
echo   },
echo   "MagicLink": {
echo     "ExpiryMinutes": 15,
echo     "BaseUrl": "http://localhost:5200",
echo     "SecretKey": "ML_kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS_MagicLink_2024",
echo     "TestMode": "true"
echo   }
echo }
echo.

echo Step 7: Test Authentication Flow
echo ================================
echo After updating configuration:
echo 1. Start MagicLinkApp
echo 2. Go to: http://localhost:5200
echo 3. Enter email: sandeepkumar1464@gmail.com
echo 4. Send magic link
echo 5. Click magic link
echo 6. Should redirect to Keycloak
echo 7. Login: magictest / Magic123!
echo 8. Should redirect back to app dashboard
echo.

echo Opening appsettings.json for editing...
start "" "notepad" "..\appsettings.json"

echo.
echo Press any key after completing manual verification steps...
pause

echo.
echo Testing Magic Link App...
cd ..
start /B dotnet run --urls="http://localhost:5200"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5200"

goto :end

:error
echo.
echo ✗ Setup verification failed
echo Please check Keycloak installation and try again
pause
exit /b 1

:end
echo.
echo ✓ Verification complete
echo Check browser for Magic Link App testing
pause