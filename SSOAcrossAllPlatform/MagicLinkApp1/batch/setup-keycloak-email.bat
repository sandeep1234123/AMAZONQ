@echo off
echo Setting up Keycloak Email Configuration for Magic Link
echo =====================================================
echo.

echo Opening Keycloak Admin Console...
start "" "http://localhost:8081/admin"
echo.

echo STEP 1: Configure Email Settings
echo ================================
echo 1. Login: Admin / Admin_123
echo 2. Switch to: sso-realm
echo 3. Go to: Realm settings → Email
echo 4. Configure SMTP:
echo    - Host: smtp.gmail.com
echo    - Port: 587
echo    - From: sandeepkumar1464@gmail.com
echo    - Enable StartTLS: ON
echo    - Enable Authentication: ON
echo    - Username: sandeepkumar1464@gmail.com
echo    - Password: auwo ejto ieeb osda
echo 5. Click: Save
echo 6. Click: Test connection
echo.

echo STEP 2: Configure Login Settings
echo ================================
echo 1. Go to: Realm settings → Login
echo 2. Enable:
echo    ✓ Forgot password
echo    ✓ Remember me
echo    ✓ Email as username (optional)
echo 3. Click: Save
echo.

echo STEP 3: Test Email Functionality
echo ================================
echo 1. Go to: Users → magictest
echo 2. Click: Send email
echo 3. Select: Verify email
echo 4. Check: sandeepkumar1464@gmail.com
echo.

echo STEP 4: Verify Authentication Flow
echo ==================================
echo 1. Go to: Authentication → Flows
echo 2. Select: Browser flow
echo 3. Verify structure:
echo    - Cookie (ALTERNATIVE)
echo    - Identity Provider Redirector (ALTERNATIVE)
echo    - Browser Forms (ALTERNATIVE)
echo      - Username Password Form (REQUIRED)
echo      - Browser Conditional OTP (CONDITIONAL)
echo.

echo Press any key after completing email configuration...
pause

echo.
echo Testing Magic Link with Email...
call quick-magic-link-test.bat