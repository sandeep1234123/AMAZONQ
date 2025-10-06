@echo off
title Simple Magic Link Test
echo ========================================
echo SIMPLE MAGIC LINK TEST
echo ========================================
echo.
echo This will test magic link without Keycloak dependency
echo.

cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\MagicLinkApp"

echo Starting app...
start "MagicLinkApp" cmd /k "dotnet run --urls http://localhost:5200"

timeout /t 5 >nul

echo.
echo ========================================
echo TEST STEPS:
echo ========================================
echo 1. Go to: http://localhost:5200
echo 2. Enter email: sandeepkumar1464@gmail.com
echo 3. Click "Send Magic Link"
echo 4. Copy the magic link from console
echo 5. Test with: http://localhost:5200/Home/TestMagicLink?token=[TOKEN]
echo 6. If test passes, try the actual magic link
echo ========================================
pause