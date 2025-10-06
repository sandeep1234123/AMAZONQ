@echo off
echo Quick Magic Link Test (Existing Setup)
echo =====================================
echo.

echo User: magictest
echo Email: sandeepkumar1464@gmail.com  
echo Password: Magic123!
echo Client: magic-user
echo Roles: magic-user, app-user (SETUP REQUIRED)
echo.

echo Starting services...
cd ..

echo Starting MagicLinkApp...
start /B dotnet run --urls="http://localhost:5200"
timeout /t 3 /nobreak >nul

echo Opening app...
start "" "http://localhost:5200"

echo.
echo SETUP REALM ROLES FIRST:
echo Run: batch\setup-realm-roles.bat
echo.
echo QUICK TEST:
echo 1. Enter: sandeepkumar1464@gmail.com
echo 2. Send Magic Link
echo 3. Copy magic link from console (if email fails)
echo 4. Paste in browser
echo 5. Login: magictest / Magic123!
echo 6. Verify roles in dashboard
echo.

echo Press any key to stop...
pause

echo Stopping services...
taskkill /F /IM dotnet.exe >nul 2>&1