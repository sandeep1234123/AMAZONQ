@echo off
title Push AMAZONQ to GitHub - All-in-One
echo ========================================
echo AMAZONQ GITHUB DEPLOYMENT - ALL-IN-ONE
echo ========================================

cd /d "D:\AMAZONQ"

:: Initialize Git if needed
if not exist ".git" (
    echo [1/6] Initializing Git repository...
    git init
    git branch -M main
)

:: Setup Git credentials
echo [2/6] Configuring Git credentials...
git config --global user.name "sandeep1234123"
git config --global user.email "sandeepkumar1464@gmail.com"
git config --global credential.helper store

:: Setup remote repository
echo [3/6] Setting up GitHub remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/sandeep1234123/AMAZONQ.git

:: Determine commit mode
if "%1"=="auto" (
    set commit_msg=Auto-save: %date% %time%
    echo [4/6] Using auto-save mode...
) else if "%1"=="quick" (
    set commit_msg=Quick save: %date% %time%
    echo [4/6] Using quick save mode...
) else (
    echo [4/6] Commit message options:
    echo   1. Custom message
    echo   2. Auto-timestamp
    set /p mode="Choose (1-2, or Enter for auto): "
    if "!mode!"=="1" (
        set /p commit_msg="Enter commit message: "
        if "!commit_msg!"=="" set commit_msg=Updated SSO Platform - %date% %time%
    ) else (
        set commit_msg=Updated SSO Platform - %date% %time%
    )
)

:: Stage and commit
echo [5/6] Staging all files...
git add .

git diff --cached --quiet
if not errorlevel 1 (
    echo No changes to commit.
    goto SUCCESS
)

echo Committing changes...
git commit -m "!commit_msg!"

:: Push to GitHub with authentication guidance
echo [6/6] Pushing to GitHub...
echo.
echo AUTHENTICATION REQUIRED:
echo Username: sandeep1234123
echo Password: [Personal Access Token - NOT your GitHub password]
echo.
echo First time? Create token at: https://github.com/settings/tokens
echo Select 'repo' scope, copy token, use as password
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo AUTHENTICATION FAILED
    echo ========================================
    echo.
    echo QUICK FIX:
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Click 'Generate new token (classic)'
    echo 3. Select 'repo' scope
    echo 4. Copy the token
    echo 5. Run this script again
    echo 6. Use token as password when prompted
    echo.
    echo The token will be saved for future pushes.
    pause
    exit /b 1
)

:SUCCESS
echo.
echo ========================================
echo ✓ SUCCESS - CODE DEPLOYED TO GITHUB!
echo ========================================
echo Repository: https://github.com/sandeep1234123/AMAZONQ
echo Commit: !commit_msg!
echo.
echo USAGE:
echo   push-to-github.bat       - Interactive mode
echo   push-to-github.bat auto  - Auto-timestamp
echo   push-to-github.bat quick - Quick save
echo.
echo Your SSO Platform is now on GitHub!
pause