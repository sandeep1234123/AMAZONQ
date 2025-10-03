@echo off
title Verify Magic Link Setup
echo ========================================
echo MAGIC LINK SETUP VERIFICATION
echo ========================================

echo Checking Keycloak availability...
curl -s http://localhost:8081/realms/sso-realm/.well-known/openid-configuration >nul 2>&1
if errorlevel 1 (
    echo ❌ Keycloak not accessible on port 8081
    echo    Start Keycloak first: scripts\startup\01-start-keycloak.bat
    pause
    exit /b 1
) else (
    echo ✅ Keycloak is running
)

echo.
echo Checking Magic Link App...
netstat -an | findstr :5200 >nul 2>&1
if errorlevel 1 (
    echo ❌ Magic Link App not running on port 5200
    echo    Start app: MagicLinkApp\simple-magic-link-test.bat
) else (
    echo ✅ Magic Link App is running
)

echo.
echo ========================================
echo MANUAL VERIFICATION STEPS:
echo ========================================
echo.
echo 1. KEYCLOAK CLIENT CHECK:
echo    → Open: http://localhost:8081/admin
echo    → Login: Admin / Admin_123
echo    → Realm: sso-realm
echo    → Clients: Look for 'magic-user'
echo    → Status: Should exist with correct settings
echo.
echo 2. TEST USER CHECK:
echo    → Users: Look for 'magictest'
echo    → Email: sandeepkumar1464@gmail.com
echo    → Status: Should be enabled
echo.
echo 3. EMAIL SETTINGS CHECK:
echo    → Realm Settings → Email
echo    → Test connection: Should succeed
echo    → Send test email: Should work
echo.
echo 4. MAGIC LINK FLOW TEST:
echo    → Go to: http://localhost:5200
echo    → Enter: sandeepkumar1464@gmail.com
echo    → Send Magic Link
echo    → Check console for link
echo    → Click link → Should redirect to Keycloak
echo    → Login: magictest / Magic123!
echo    → Should reach Dashboard
echo.
echo 5. SSO VERIFICATION:
echo    → After magic link login
echo    → Open: http://localhost:5000
echo    → Should be auto-logged in
echo    → Test: App1, App2, App3
echo.
echo ========================================
echo TROUBLESHOOTING:
echo ========================================
echo.
echo If magic link fails:
echo → Check client secret in appsettings.json
echo → Verify redirect URIs: http://localhost:5200/*
echo → Ensure user exists in sso-realm
echo → Check TestMode is false for Keycloak integration
echo.
echo If email fails:
echo → Check SMTP settings in Keycloak
echo → Verify Gmail app password
echo → Look for magic link in console logs
echo.
echo ========================================
pause