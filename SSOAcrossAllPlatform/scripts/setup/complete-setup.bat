@echo off
title Complete SSO Platform Setup
echo ========================================
echo Complete SSO Platform Setup
echo ========================================

echo Step 1: Installing Java...
call install-java.bat

echo Step 2: Starting Keycloak...
call ..\keycloak\start-keycloak.bat

echo Step 3: Opening setup documentation...
start ..\docs\KEYCLOAK_COMPLETE_SETUP.md

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Configure Keycloak (see opened documentation)
echo 2. Run: apps\start-all-apps.bat
echo 3. Test SSO functionality
echo ========================================
pause