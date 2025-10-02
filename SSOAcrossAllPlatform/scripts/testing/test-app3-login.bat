@echo off
echo ========================================
echo App3 Authentication Test
echo ========================================
echo.
echo Test User Information:
echo Username: testuser
echo Email: sandeepkumar1464don@gmail.com
echo Password: Test123!
echo Role: app3-user
echo.
echo Client Configuration:
echo Client ID: app3-client
echo Client Secret: gUC1umkBfIVixVZ4iBK5cBDSs8NLGt6q
echo.
echo Test Steps:
echo 1. Access http://localhost:5103
echo 2. Click "Login with Active Directory"
echo 3. Enter testuser / Test123!
echo 4. Verify authentication success
echo.
echo Opening App3...
start http://localhost:5103
echo.
pause