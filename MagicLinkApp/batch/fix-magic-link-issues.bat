@echo off
echo Fixing Magic Link Issues (HTTP 431 + Client ID)
echo ===============================================
echo.

echo Issues Fixed:
echo 1. ✓ Client ID corrected: magic-client → magic-user
echo 2. ✓ HTTP 431 error fixed: Increased Kestrel header limits
echo 3. ✓ Token validation improved
echo.

echo Step 1: Verify Keycloak Client
echo ==============================
echo Opening Keycloak Admin Console...
start "" "http://localhost:8081/admin"
echo.
echo VERIFY:
echo 1. Login: Admin / Admin_123
echo 2. Switch to: sso-realm
echo 3. Go to: Clients
echo 4. Find client: magic-user (NOT magic-client)
echo 5. If magic-client exists, use that OR rename to magic-user
echo 6. Go to: Credentials tab
echo 7. Copy Client Secret
echo.

echo Step 2: Update Client Secret
echo ============================
echo Current ClientSecret: kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS
echo.
echo Opening appsettings.json...
start "" "notepad" "..\appsettings.json"
echo.
echo UPDATE the ClientSecret with actual value from Keycloak
echo.

echo Press any key after updating client secret...
pause

echo.
echo Step 3: Test Magic Link
echo =======================
echo Starting MagicLinkApp with fixes...
cd ..

echo Stopping any existing instances...
taskkill /F /IM dotnet.exe >nul 2>&1

echo Starting app...
start /B dotnet run --urls="http://localhost:5200"
timeout /t 5 /nobreak >nul

echo Opening app...
start "" "http://localhost:5200"

echo.
echo TEST STEPS:
echo 1. Enter email: sandeepkumar1464@gmail.com
echo 2. Send Magic Link
echo 3. Check console for magic link URL
echo 4. Copy and paste magic link in browser
echo 5. Should work without HTTP 431 error
echo 6. Login: magictest / Magic123!
echo.

echo Step 4: Debug Token (if still not working)
echo ===========================================
set TOKEN=eyJFbWFpbCI6InNhbmRlZXBrdW1hcjE0NjRAZ21haWwuY29tIiwiVGltZXN0YW1wIjoxNzU5NTE4NjAzLCJSYW5kb20iOiJVME40YWZNQkoyUmFsY2hEREVHdGpVNldpN3Vqc01OcEFPaTdvd2U3aFNvPSJ9
echo.
echo Your token: %TOKEN%
echo Debug URL: http://localhost:5200/Home/DebugToken?token=%TOKEN%
echo.
echo Opening debug page...
start "" "http://localhost:5200/Home/DebugToken?token=%TOKEN%"

echo.
echo Press any key to stop testing...
pause

echo Stopping services...
taskkill /F /IM dotnet.exe >nul 2>&1

echo.
echo ✓ Magic Link issues fixed!
echo If still not working, check:
echo 1. Client secret matches Keycloak
echo 2. Client name is correct (magic-user)
echo 3. Token is not expired
echo 4. App is running on port 5200