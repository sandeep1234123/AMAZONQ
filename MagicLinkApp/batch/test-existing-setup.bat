@echo off
echo Testing Existing Keycloak Setup (magictest user + magic-user client)
echo ===================================================================
echo.

echo ✓ User: magictest exists
echo ✓ Client: magic-user exists
echo ✓ Email: sandeepkumar1464@gmail.com configured
echo.

echo Step 1: Verify Keycloak is Running
echo ==================================
curl -s -o nul -w "Keycloak Status: %%{http_code}" "http://localhost:8081/admin"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠ Starting Keycloak...
    start /B "Keycloak" "D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\01-start-keycloak.bat"
    timeout /t 15 /nobreak >nul
)
echo.

echo Step 2: Get Client Secret
echo =========================
echo Opening Keycloak Admin Console...
start "" "http://localhost:8081/admin"
echo.
echo REQUIRED ACTION:
echo 1. Login: Admin / Admin_123
echo 2. Switch to: sso-realm
echo 3. Go to: Clients → magic-user → Credentials tab
echo 4. Copy the Client Secret
echo 5. Update appsettings.json ClientSecret field
echo.

echo Current appsettings.json ClientSecret: kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS
echo Make sure this matches Keycloak!
echo.

echo Opening appsettings.json for editing...
start "" "notepad" "..\appsettings.json"
echo.

echo Press any key after updating ClientSecret...
pause

echo.
echo Step 3: Test Magic Link Flow
echo ============================
echo Starting MagicLinkApp...
cd ..
start /B dotnet run --urls="http://localhost:5200"
timeout /t 5 /nobreak >nul

echo Opening Magic Link App...
start "" "http://localhost:5200"
echo.

echo TEST STEPS:
echo 1. Enter email: sandeepkumar1464@gmail.com
echo 2. Click "Send Magic Link"
echo 3. Check console for magic link URL (if email fails)
echo 4. Click the magic link
echo 5. Should redirect to Keycloak login
echo 6. Login: magictest / Magic123!
echo 7. Should redirect to app dashboard
echo.

echo Step 4: Manual Test URLs
echo ========================
echo If magic link doesn't work, test these URLs:
echo.
echo Direct Keycloak Auth:
echo http://localhost:8081/realms/sso-realm/protocol/openid-connect/auth?client_id=magic-user^&response_type=code^&redirect_uri=http://localhost:5200/signin-oidc^&scope=openid%%20profile%%20email
echo.
echo Magic Link Debug:
echo http://localhost:5200/Home/DebugToken?token=[PASTE_TOKEN_HERE]
echo.

echo Press any key to finish testing...
pause

echo.
echo ✓ Testing complete
echo Check browser for results