@echo off
echo Setting up Realm Roles for Magic Link Authentication
echo ====================================================
echo.

echo Opening Keycloak Admin Console...
start "" "http://localhost:8081/admin"
echo.

echo STEP 1: Create Realm Roles
echo ==========================
echo 1. Login: Admin / Admin_123
echo 2. Switch to: sso-realm
echo 3. Go to: Realm roles
echo 4. Click: Create role
echo 5. Create these roles:
echo    - Role name: magic-user
echo    - Description: Magic Link User Role
echo    - Click Save
echo.
echo    - Role name: app-user  
echo    - Description: Application User Role
echo    - Click Save
echo.

echo STEP 2: Assign Roles to User
echo ============================
echo 1. Go to: Users → magictest
echo 2. Click: Role mapping tab
echo 3. Click: Assign role
echo 4. Select: magic-user
echo 5. Select: app-user
echo 6. Click: Assign
echo.

echo STEP 3: Configure Client Role Mapping
echo =====================================
echo 1. Go to: Clients → magic-user
echo 2. Click: Client scopes tab
echo 3. Click: magic-user-dedicated
echo 4. Click: Mappers tab
echo 5. Click: Add mapper
echo 6. Choose option:
echo    OPTION A: Add predefined mapper → Select: realm roles → Add selected
echo    OPTION B: Configure a new mapper → Select: User Realm Role
echo 7. If Option B, configure:
echo    - Name: realm-roles
echo    - Mapper Type: User Realm Role
echo    - Token Claim Name: realm_access.roles
echo    - Claim JSON Type: String
echo    - Add to ID token: ON
echo    - Add to access token: ON
echo    - Add to userinfo: ON
echo    - Multivalued: ON
echo 8. Click: Save
echo.
echo This adds user roles to JWT tokens so your app can use them!
echo.

echo STEP 4: Verify Role Configuration
echo =================================
echo 1. Go to: Users → magictest → Role mapping
echo 2. Verify assigned roles:
echo    ✓ magic-user
echo    ✓ app-user
echo.
echo 3. Go to: Clients → magic-user → Client scopes
echo 4. Verify realm-roles mapper exists
echo.

echo Press any key after completing role setup...
pause

echo.
echo Testing role-based authentication...
call quick-magic-link-test.bat