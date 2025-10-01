@echo off
echo ========================================
echo GitHub Repository Setup Script
echo ========================================
echo.

echo Step 1: Create a new repository on GitHub
echo - Go to https://github.com/new
echo - Repository name: SSO-Platform-Keycloak
echo - Description: Complete SSO Platform with Keycloak integration
echo - Make it Public or Private (your choice)
echo - DO NOT initialize with README, .gitignore, or license
echo - Click "Create repository"
echo.

echo Step 2: Copy the repository URL from GitHub
echo Example: https://github.com/yourusername/SSO-Platform-Keycloak.git
echo.

set /p REPO_URL="Enter your GitHub repository URL: "

echo.
echo Step 3: Adding remote origin and pushing...
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ========================================
echo Repository successfully pushed to GitHub!
echo ========================================
echo.
echo Your SSO Platform is now available at:
echo %REPO_URL%
echo.
pause