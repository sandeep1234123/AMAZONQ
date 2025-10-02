@echo off
echo ========================================
echo Manual AD User Creation Commands
echo ========================================
echo.
echo Run these commands in Active Directory Users and Computers:
echo.
echo 1. Create Security Group:
echo    - Name: App3Users
echo    - Scope: Global
echo    - Type: Security
echo.
echo 2. Create Users:
echo    - Username: app3user
echo    - Full Name: App3 User  
echo    - Email: app3user@company.com
echo    - Password: App3Pass123!
echo.
echo    - Username: app3admin
echo    - Full Name: App3 Admin
echo    - Email: app3admin@company.com  
echo    - Password: App3Admin123!
echo.
echo 3. Add Users to Groups:
echo    - Add app3user to App3Users
echo    - Add app3admin to App3Users
echo    - Add app3admin to Domain Admins
echo.
echo ========================================
echo Alternative: Use LDAP Browser or phpLDAPadmin
echo ========================================
pause