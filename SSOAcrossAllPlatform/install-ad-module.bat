@echo off
echo Installing Active Directory PowerShell Module...

REM Install RSAT-AD-PowerShell feature
powershell -Command "Enable-WindowsOptionalFeature -Online -FeatureName RSATClient-Roles-AD-Powershell -All"

REM Alternative: Install via PowerShell Gallery
powershell -Command "Install-Module -Name ActiveDirectory -Force -AllowClobber"

echo AD PowerShell module installation complete.
echo Please restart PowerShell and run create-ad-users-app3.bat again.
pause