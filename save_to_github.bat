@echo off
cd /d "D:\AMAZONQ"

echo Adding all files to git...
git add .

echo Committing changes...
git commit -m "Auto-save: %date% %time%"

echo Pushing to GitHub...
git push origin main

echo.
echo Code successfully saved to GitHub!
pause