@echo off
title Download Keycloak 23.0.7
echo ==========================================
echo Downloading Keycloak 23.0.7 for Windows 11
echo ==========================================
echo.

echo Downloading Keycloak 23.0.7...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip' -OutFile 'keycloak-23.0.7.zip'"

if not exist "keycloak-23.0.7.zip" (
    echo ERROR: Download failed!
    echo Please download manually from:
    echo https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip
    pause
    exit /b 1
)

echo Extracting Keycloak...
powershell -Command "Expand-Archive -Path 'keycloak-23.0.7.zip' -DestinationPath '.' -Force"

if exist "keycloak-23.0.7" (
    echo ✅ Keycloak 23.0.7 downloaded and extracted successfully!
    echo.
    echo You can now run: start-keycloak.bat
    del keycloak-23.0.7.zip
) else (
    echo ERROR: Extraction failed!
)

echo.
pause