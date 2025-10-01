@echo off
echo Creating Active Directory Users for App3...

REM Create App3 Users Group
powershell -Command "New-ADGroup -Name 'App3Users' -GroupScope Global -GroupCategory Security -Path 'CN=Groups,DC=company,DC=com' -Description 'Users with access to Application 3'"

REM Create App3 Test User
powershell -Command "New-ADUser -Name 'App3 User' -SamAccountName 'app3user' -UserPrincipalName 'app3user@company.com' -Path 'CN=Users,DC=company,DC=com' -AccountPassword (ConvertTo-SecureString 'App3Pass123!' -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $true -Description 'Test user for Application 3'"

REM Add user to App3Users group
powershell -Command "Add-ADGroupMember -Identity 'App3Users' -Members 'app3user'"

REM Create App3 Admin User
powershell -Command "New-ADUser -Name 'App3 Admin' -SamAccountName 'app3admin' -UserPrincipalName 'app3admin@company.com' -Path 'CN=Users,DC=company,DC=com' -AccountPassword (ConvertTo-SecureString 'App3Admin123!' -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $true -Description 'Admin user for Application 3'"

REM Add admin to both App3Users and Domain Admins
powershell -Command "Add-ADGroupMember -Identity 'App3Users' -Members 'app3admin'"
powershell -Command "Add-ADGroupMember -Identity 'Domain Admins' -Members 'app3admin'"

echo.
echo Users created successfully:
echo - app3user@company.com (Password: App3Pass123!)
echo - app3admin@company.com (Password: App3Admin123!)
echo.
echo Group created: App3Users
echo.
pause