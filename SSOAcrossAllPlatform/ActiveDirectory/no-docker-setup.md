# No Docker Setup - Direct Keycloak Users

## Skip LDAP - Create Users Directly in Keycloak

### Step 1: Remove LDAP Provider (if exists)
1. Go to Keycloak Admin Console: `http://localhost:8081`
2. Select realm: `sso-realm`
3. User Federation → Delete any existing LDAP provider

### Step 2: Create Test Users Manually

**Navigate to Users:**
- Left menu → Users → Add user

**Create User 1:**
```
Username: app1-test
Email: app1test@ssoplatform.com
First name: App1
Last name: Test
Email verified: ON
Enabled: ON
```
Click "Create"

**Set Password:**
- Credentials tab → Set password: `Test123!`
- Temporary: OFF
- Click "Set password"

**Assign Role:**
- Role mapping tab → Assign role → Select `app1-user`

**Create User 2:**
```
Username: app2-test
Email: app2test@ssoplatform.com
First name: App2
Last name: Test
```
- Password: `Test123!`
- Role: `app2-user`

**Create User 3:**
```
Username: multi-user
Email: multiuser@ssoplatform.com
First name: Multi
Last name: User
```
- Password: `Test123!`
- Role: `multi-user`

**Create User 4:**
```
Username: manager
Email: manager@ssoplatform.com
First name: Manager
Last name: User
```
- Password: `Test123!`
- Role: `manager`

**Create User 5:**
```
Username: admin
Email: admin@ssoplatform.com
First name: Admin
Last name: User
```
- Password: `Test123!`
- Role: `admin`

### Step 3: Test Authentication

1. Go to `http://localhost:5101`
2. Login with: `app1-test` / `Test123!`
3. Should authenticate and redirect to Dashboard

### Step 4: Test Other Users

- **App2:** `app2-test` / `Test123!` → http://localhost:5102
- **Multi-user:** `multi-user` / `Test123!` → Should access App1 and App2
- **Manager:** `manager` / `Test123!` → Should access all apps
- **Admin:** `admin` / `Test123!` → Should access all apps

## This approach works immediately without Docker or LDAP setup.