@echo off
title Google OAuth 2.0 Setup Helper
echo ==========================================
echo Google OAuth 2.0 Setup for SSO Platform
echo ==========================================
echo.
echo Project: watchful-pier-167804
echo.
echo This script will help you set up Google OAuth 2.0 integration.
echo.
echo STEP 1: Configure OAuth Consent Screen
echo ----------------------------------------
echo 1. Open: https://console.cloud.google.com/auth/branding?project=watchful-pier-167804
echo 2. Select "External" user type
echo 3. Fill in the following details:
echo.
echo    App name: SSO Platform
echo    User support email: sandeepkumar1464@gmail.com
echo    Application home page: http://localhost:5000
echo    Authorized domains: localhost
echo.
pause
echo.
echo STEP 2: Create OAuth 2.0 Credentials
echo -------------------------------------
echo 1. Open: https://console.cloud.google.com/apis/credentials?project=watchful-pier-167804
echo 2. Click "CREATE CREDENTIALS" - "OAuth 2.0 Client IDs"
echo 3. Application type: Web application
echo 4. Name: Keycloak SSO Integration
echo 5. Authorized redirect URIs:
echo    http://localhost:8080/realms/sso-realm/broker/google/endpoint
echo.
pause
echo.
echo STEP 3: Copy Your Credentials
echo ------------------------------
echo After creating credentials, you will get:
echo.
echo Client ID: [COPY THIS VALUE]
echo Client Secret: [COPY THIS VALUE]
echo.
echo Write them down - you'll need them for Keycloak configuration!
echo.
pause
echo.
echo STEP 4: Configure Keycloak
echo ---------------------------
echo 1. Start Keycloak: start-keycloak.bat
echo 2. Open: http://localhost:8080
echo 3. Go to: Identity Providers - Add provider - Google
echo 4. Paste your Client ID and Client Secret
echo 5. Set Default Scopes: openid profile email
echo.
pause
echo.
echo STEP 5: Test Integration
echo ------------------------
echo 1. Start applications: start-applications.bat
echo 2. Go to: http://localhost:5000
echo 3. Click "Login with SSO"
echo 4. You should see Google login option
echo 5. Login with your Google account
echo.
echo ==========================================
echo Setup complete! Check GOOGLE_OAUTH_SETUP.md for detailed instructions.
echo ==========================================
echo.
echo Opening Google Cloud Console...
start https://console.cloud.google.com/auth/branding?project=watchful-pier-167804
echo.
pause