@echo off
echo Testing organized token system...
echo.

echo Starting MagicLinkApp...
start /B dotnet run --urls="http://localhost:5200"

timeout /t 3 /nobreak >nul

echo.
echo Testing token generation...
curl -X POST -d "email=sandeepkumar1464@gmail.com" -H "Content-Type: application/x-www-form-urlencoded" http://localhost:5200/Home/SendMagicLink

echo.
echo Opening app in browser...
start "" "http://localhost:5200"

echo.
echo Token system organized with:
echo - MagicLinkTokenService for token management
echo - URL-safe Base64 encoding
echo - Proper validation and expiry
echo - Debug endpoint for testing

pause