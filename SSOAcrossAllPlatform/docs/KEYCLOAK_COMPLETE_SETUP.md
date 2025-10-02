# Keycloak Complete Setup for SSO Platform

## Project Analysis
**Solution**: SSOPlatform.sln contains 4 ASP.NET Core applications:
- **CommonLogin** (Port 5000) - Central authentication hub
- **App1** (Port 5101) - Business application 1
- **App2** (Port 5102) - Business application 2  
- **App3** (Port 5103) - Business application 3

## Keycloak Configuration Required

### 1. Realm Setup
**Realm Name**: `sso-realm`
**Authority**: `http://localhost:8081/realms/sso-realm`

### 2. Clients Configuration

#### Client 1: common-login
- **Client ID**: `common-login`
- **Client Secret**: `HQnqI4kSVrlFodtgbk9K0Ahf1VZJhPvM`
- **Valid Redirect URIs**: `http://localhost:5000/*`
- **Web Origins**: `http://localhost:5000`

#### Client 2: app1-client
- **Client ID**: `app1-client`
- **Client Secret**: `TICJTUVDiAoxC4eHQqlLcGco9373TlU4`
- **Valid Redirect URIs**: `http://localhost:5101/*`
- **Web Origins**: `http://localhost:5101`

#### Client 3: app2-client
- **Client ID**: `app2-client`
- **Client Secret**: `ge17Xma0sgHJWSzwAP6wRQWci5uMXND6`
- **Valid Redirect URIs**: `http://localhost:5102/*`
- **Web Origins**: `http://localhost:5102`

#### Client 4: app3-client
- **Client ID**: `app3-client`
- **Client Secret**: `83l2IemK8nM3liRgXig57Sc8UkY9p0Oy`
- **Valid Redirect URIs**: `http://localhost:5103/*`
- **Web Origins**: `http://localhost:5103`

### 3. Client Scopes Configuration

#### Required Client Scopes
- **openid** - Standard OpenID Connect scope (default)
- **profile** - User profile information (default)
- **email** - User email address (default)
- **roles** - User roles for authorization (custom)

#### Create Custom Roles Scope:
1. Go to "Client scopes" → "Create client scope"
2. **Name**: `roles`
3. **Type**: Default
4. **Protocol**: openid-connect
5. Click "Save"
6. Go to "Mappers" tab → "Add mapper" → "By configuration"
7. Select "User Realm Role"
8. **Name**: `realm-roles`
9. **Token Claim Name**: `roles`
10. **Claim JSON Type**: String
11. **Add to ID token**: ON
12. **Add to access token**: ON
13. **Add to userinfo**: ON
14. Click "Save"

#### Assign Scopes to Clients:
For each client (common-login, app1-client, app2-client, app3-client):
1. Go to "Clients" → Select client
2. Go to "Client scopes" tab
3. Click "Add client scope"
4. Select: `openid`, `profile`, `email`, `roles`
5. Set all as "Default" type
6. Click "Add"

### 4. Roles Configuration

#### Realm Roles
- `admin` - Full access to all applications
- `app1-user` - Access to App1
- `app2-user` - Access to App2
- `app3-user` - Access to App3

### 5. Users Configuration

#### Master Realm (Already Created)
- **Username**: `Admin`
- **Password**: `Admin_123`
- **Purpose**: Keycloak administration only
- **Location**: Master realm

#### SSO-Realm Users (To Create in sso-realm)

**Admin User for Applications:**
- **Username**: `admin`
- **Password**: `Admin123!`
- **Email**: `admin@ssoplatform.com`
- **Roles**: `admin`, `app1-user`, `app2-user`, `app3-user`
- **Purpose**: Full access to all applications

**Test Users for Individual Apps:**
- **app1-test**
  - Password: `Test123!`
  - Email: `app1test@ssoplatform.com`
  - Roles: `app1-user`
  - Purpose: Access App1 only

- **app2-test**
  - Password: `Test123!`
  - Email: `app2test@ssoplatform.com`
  - Roles: `app2-user`
  - Purpose: Access App2 only

- **app3-test**
  - Password: `Test123!`
  - Email: `app3test@ssoplatform.com`
  - Roles: `app3-user`
  - Purpose: Access App3 only

**Multi-App User:**
- **multi-user**
  - Password: `Multi123!`
  - Email: `multiuser@ssoplatform.com`
  - Roles: `app1-user`, `app2-user`
  - Purpose: Access App1 and App2

**Manager User:**
- **manager**
  - Password: `Manager123!`
  - Email: `manager@ssoplatform.com`
  - Roles: `app1-user`, `app2-user`, `app3-user`
  - Purpose: Access all apps except admin functions

## Step-by-Step Setup Instructions

### Step 1: Access Keycloak Admin Console
1. Open: `http://localhost:8081/admin`
2. Login with Master Realm credentials:
   - **Username**: `Admin`
   - **Password**: `Admin_123`
   - **Realm**: `master` (default)

### Step 2: Create Realm
1. Click "Create Realm"
2. Name: `sso-realm`
3. Click "Create"

### Step 3: Create Clients
For each client, follow these steps:

1. Go to "Clients" → "Create client"
2. **Client type**: OpenID Connect
3. **Client ID**: [use values from above]
4. Click "Next"
5. **Client authentication**: ON
6. **Authorization**: OFF
7. **Authentication flow**: Standard flow, Direct access grants
8. Click "Next"
9. **Valid redirect URIs**: [use values from above]
10. **Web origins**: [use values from above]
11. Click "Save"
12. Go to "Credentials" tab
13. Copy the "Client secret" and update appsettings.json if needed

### Step 4: Configure Client Scopes
1. Go to "Client scopes" → "Create client scope"
2. **Name**: `roles`, **Type**: Default, **Protocol**: openid-connect
3. Click "Save" → "Mappers" tab → "Add mapper" → "By configuration"
4. Select "User Realm Role" → **Name**: `realm-roles`, **Token Claim Name**: `roles`
5. Enable: ID token, Access token, Userinfo → Click "Save"
6. For each client: "Clients" → Select client → "Client scopes" tab
7. "Add client scope" → Select: `openid`, `profile`, `email`, `roles` → "Add"

### Step 5: Create Roles
1. Go to "Realm roles" → "Create role"
2. Create each role: `admin`, `app1-user`, `app2-user`, `app3-user`

### Step 6: Switch to SSO-Realm
1. Click realm dropdown (top-left, shows "master")
2. Select "sso-realm"
3. You are now in the application realm

### Step 7: Create Application Users
**IMPORTANT**: Make sure you're in "sso-realm" not "master"

#### Create Admin User for Applications:
1. Go to "Users" → "Add user"
2. **Username**: `admin`
3. **Email**: `admin@ssoplatform.com`
4. **Email verified**: ON
5. **Enabled**: ON
6. Click "Create"
7. Go to "Credentials" tab
8. **Password**: `Admin123!`
9. **Temporary**: OFF
10. Click "Set password"
11. Go to "Role mapping" tab
12. Click "Assign role"
13. Select: `admin`, `app1-user`, `app2-user`, `app3-user`
14. Click "Assign"

#### Create Test Users:
For each test user (app1-test, app2-test, app3-test, multi-user, manager):

1. Go to "Users" → "Add user"
2. **Username**: [from list above]
3. **Email**: [from list above]
4. **Email verified**: ON
5. **Enabled**: ON
6. Click "Create"
7. Go to "Credentials" tab
8. **Password**: [from list above]
9. **Temporary**: OFF
10. Click "Set password"
11. Go to "Role mapping" tab
12. Click "Assign role"
13. Select appropriate roles for each user
14. Click "Assign"

### Step 8: Verify User Creation
1. Go to "Users" in sso-realm
2. Should see 5 users: admin, app1-test, app2-test, app3-test, multi-user, manager
3. Each user should have correct roles assigned

## Application URLs
- **Keycloak Admin**: http://localhost:8081/admin (Master: Admin/Admin_123)
- **Keycloak SSO**: http://localhost:8081/realms/sso-realm
- **CommonLogin**: http://localhost:5000
- **App1**: http://localhost:5101
- **App2**: http://localhost:5102
- **App3**: http://localhost:5103

## User Credentials Summary

### Master Realm (Keycloak Admin)
- **Admin**: Admin_123

### SSO-Realm (Application Users)
- **admin**: Admin123! (Full access)
- **app1-test**: Test123! (App1 only)
- **app2-test**: Test123! (App2 only)
- **app3-test**: Test123! (App3 only)
- **multi-user**: Multi123! (App1 + App2)
- **manager**: Manager123! (All apps, no admin)

## Testing SSO Flow

### Test Scenarios:

**Test 1: Admin User (Full Access)**
1. Login: `admin` / `Admin123!`
2. Should access: All apps (CommonLogin, App1, App2, App3)

**Test 2: Single App Users**
1. Login: `app1-test` / `Test123!` → Access App1 only
2. Login: `app2-test` / `Test123!` → Access App2 only
3. Login: `app3-test` / `Test123!` → Access App3 only

**Test 3: Multi-App User**
1. Login: `multi-user` / `Multi123!`
2. Should access: App1 and App2 (not App3)

**Test 4: Manager User**
1. Login: `manager` / `Manager123!`
2. Should access: App1, App2, App3 (no admin functions)

### SSO Flow Steps:
1. Start Keycloak on port 8081
2. Start all applications using `startup/00-start-all-sequential.bat`
3. Visit any app URL (e.g., http://localhost:5101)
4. Redirects: App → CommonLogin → Keycloak Login
5. Enter credentials from sso-realm users above
6. Redirects back: Keycloak → CommonLogin → App
7. Access other authorized apps without re-login

### Important Notes:
- **Master realm**: Only for Keycloak admin (Admin/Admin_123)
- **SSO-realm**: For application users (admin, app1-test, etc.)
- **Always verify**: You're in correct realm when creating users
- **Role-based access**: Users only see apps they have roles for