@echo off
echo Testing Your Specific Magic Link Token
echo ======================================
echo.

set TOKEN=eyJFbWFpbCI6InNhbmRlZXBrdW1hcjE0NjRAZ21haWwuY29tIiwiVGltZXN0YW1wIjoxNzU5NTE4NjAzLCJSYW5kb20iOiJVME40YWZNQkoyUmFsY2hEREVHdGpVNldpN3Vqc01OcEFPaTdvd2U3aFNvPSJ9

echo Token: %TOKEN%
echo.

echo Starting MagicLinkApp...
cd ..
start /B dotnet run --urls="http://localhost:5200"
timeout /t 5 /nobreak >nul

echo Testing debug endpoint...
curl -s "http://localhost:5200/Home/DebugToken?token=%TOKEN%"
echo.

echo Testing magic link directly...
echo Opening: http://localhost:5200/Home/VerifyMagicLink?token=%TOKEN%
start "" "http://localhost:5200/Home/VerifyMagicLink?token=%TOKEN%"

echo.
echo If HTTP 431 error occurs:
echo 1. ✓ Kestrel limits increased
echo 2. ✓ Client ID fixed to magic-user
echo 3. Check if token is expired (timestamp: 1759518603)
echo.

pause

taskkill /F /IM dotnet.exe >nul 2>&1