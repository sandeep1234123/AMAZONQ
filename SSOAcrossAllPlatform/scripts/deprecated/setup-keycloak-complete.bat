@echo off
title Complete Keycloak Setup for SSO Platform
echo ========================================
echo Keycloak Complete Setup Script
echo ========================================
echo.

echo Step 1: Starting Keycloak on port 8081...
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
cd ..\keycloak-23.0.7
start "Keycloak Server" cmd /k "bin\kc.bat start-dev --http-port=8081"

echo.
echo Step 2: Waiting for Keycloak to start...
timeout /t 30 /nobreak

echo.
echo Step 3: Opening Keycloak Admin Console...
start http://localhost:8081/admin

echo.
echo ========================================
echo MANUAL SETUP REQUIRED:
echo ========================================
echo 1. Login to Keycloak Admin Console:
echo    URL: http://localhost:8081/admin
echo    Username: Admin
echo    Password: Admin_123
echo.
echo 2. Create Realm: sso-realm
echo.
echo 3. Create 4 Clients:
echo    - common-login (Secret: b4tvl5GQRT9oiVOSpWnFf2uQHK07jJhF)
echo    - app1-client (Secret: 7xsGjfrgp4FjkKV0JcewMgECEKSXYft4)
echo    - app2-client (Secret: J5nyrCgOZQjqcWRSHIrlLDEHVXxZ3wSU)
echo    - app3-client (Secret: gUC1umkBfIVixVZ4iBK5cBDSs8NLGt6q)
echo.
echo 4. Create Roles: admin, app1-user, app2-user, app3-user
echo.
echo 5. Assign roles to Admin user
echo.
echo 6. Create test users with appropriate roles
echo.
echo See docs\KEYCLOAK_COMPLETE_SETUP.md for detailed steps
echo ========================================
pause