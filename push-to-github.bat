@echo off
echo Pushing all changes to GitHub...
cd /d "D:\AMAZONQ"
git add .
git commit -m "Auto commit - %date% %time%"
git push origin main --force
echo.
echo ✅ Successfully pushed to GitHub!
echo Repository: https://github.com/sandeep1234123/AMAZONQ
pause