@echo off
title Magic Link App - Test Mode
echo ========================================
echo MAGIC LINK APP - TEST MODE
echo ========================================
echo.
echo Starting Magic Link App with console logging...
echo Watch for magic links in the console output below.
echo.
echo App URL: http://localhost:5200
echo.

cd /d "D:\AMAZONQ\SSOAcrossAllPlatform\MagicLinkApp"
dotnet run --urls http://localhost:5200