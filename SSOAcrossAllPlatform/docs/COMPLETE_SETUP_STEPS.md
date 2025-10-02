# Complete SSO Platform Setup - Step by Step

## 🚀 PHASE 1: INITIAL SETUP

### Step 1: Download Keycloak
```cmd
# Run this command
download-keycloak.bat
```

### Step 2: Start Keycloak
```cmd
# Run this command
start-keycloak.bat
```

### Step 3: Create Keycloak Admin Account
1. Open: http://localhost:8080
2. Create admin account:
   - Username: `admin`
   - Password: `Admin_123`
3. Click **Create**

## 🔧 PHASE 2: KEYCLOAK CONFIGURATION

### Step 4: Create Realm
1. Login to Keycloak Admin Console
2. Click **Create Realm**
3. Realm name: `sso-realm`
4. Click **Create**

### Step 5: Configure Realm Settings
1. Go to **Realm Settings** → **Login**
2. Enable:
   - ✅ User registration
   - ✅ Forgot password
   - ✅ Remember me
   - ✅ Login with email
3. Click **Save**

### Step 6: Create Roles
1. Go to **Realm roles** → **Create role**
2. Create role: `admin` → **Save**
3. Create role: `app1-user` → **Save**
4. Create role: `app2-user` → **Save**

### Step 7: Create Clients

#### Step 7a: CommonLogin Client
1. Go to **Clients** → **Create client**
2. Client ID: `common-login`
3. Client type: `OpenID Connect` → **Next**
4. Client authentication: `ON`
5. Standard flow: `ON` → **Save**
6. **Settings** tab:
   - Valid redirect URIs: `http://localhost:5000/*`
   - Web origins: `http://localhost:5000`
   - Click **Save**
7. **Credentials** tab: Copy **Client secret**

#### Step 7b: App1 Client
1. **Clients** → **Create client**
2. Client ID: `app1-client`
3. Same settings as CommonLogin
4. Valid redirect URIs: `http://localhost:5001/*`
5. Web origins: `http://localhost:5001`
6. Copy **Client secret**

#### Step 7c: App2 Client
1. **Clients** → **Create client**
2. Client ID: `app2-client`
3. Same settings as CommonLogin
4. Valid redirect URIs: `http://localhost:5002/*`
5. Web origins: `http://localhost:5002`
6. Copy **Client secret**

### Step 8: Create Users

#### Step 8a: Primary Admin User (Your Account)
1. **Users** → **Create new user**
2. Username: `sandeepkumar1464@gmail.com`
3. Email: `sandeepkumar1464@gmail.com`
4. First name: `Sandeep`
5. Last name: `Kumar`
6. Email verified: `ON` → **Create**
7. **Credentials** tab → **Set password**
8. Password: `Admin_123`
9. Temporary: `OFF` → **Save**
10. **Role mapping** → **Assign role**
11. Select: `admin`, `app1-user`, `app2-user` → **Assign**

#### Step 8b: Test Users
Repeat for each user:

**App1 User:**
- Username: `app1.user`
- Email: `app1@company.com`
- Password: `Admin_123`
- Roles: `app1-user`

**App2 User:**
- Username: `app2.user`
- Email: `app2@company.com`
- Password: `Admin_123`
- Roles: `app2-user`

**Multi User:**
- Username: `multi.user`
- Email: `multi@company.com`
- Password: `Admin_123`
- Roles: `app1-user`, `app2-user`

**Admin User:**
- Username: `admin.user`
- Email: `admin@company.com`
- Password: `Admin_123`
- Roles: `admin`, `app1-user`, `app2-user`

## 🌐 PHASE 3: GOOGLE OAUTH SETUP (Optional)

### Step 9: Configure Google OAuth Consent Screen
1. Open: https://console.cloud.google.com/auth/branding?project=watchful-pier-167804
2. User Type: **External** → **CREATE**
3. Fill in:
   - App name: `SSO Platform`
   - User support email: `sandeepkumar1464@gmail.com`
   - Application home page: `http://localhost:5000`
   - Authorized domains: `localhost`
   - Developer contact: `sandeepkumar1464@gmail.com`
4. **SAVE AND CONTINUE**

### Step 10: Configure OAuth Scopes
1. **ADD OR REMOVE SCOPES**
2. Select:
   - ✅ `../auth/userinfo.email`
   - ✅ `../auth/userinfo.profile`
   - ✅ `openid`
3. **UPDATE** → **SAVE AND CONTINUE**

### Step 11: Add Test Users
1. **ADD USERS**
2. Add: `sandeepkumar1464@gmail.com`
3. **SAVE AND CONTINUE**

### Step 12: Create OAuth Credentials
1. Open: https://console.cloud.google.com/apis/credentials?project=watchful-pier-167804
2. **CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: `Keycloak SSO Integration`
5. Authorized redirect URIs: `http://localhost:8080/realms/sso-realm/broker/google/endpoint`
6. **CREATE**
7. Copy **Client ID** and **Client Secret**

### Step 13: Add Google Provider to Keycloak
1. In Keycloak: **Identity Providers** → **Add provider** → **Google**
2. Alias: `google`
3. Client ID: [Paste from Google]
4. Client Secret: [Paste from Google]
5. Default Scopes: `openid profile email`
6. **Add**

## 🔧 PHASE 4: APPLICATION CONFIGURATION

### Step 14: Update Client Secrets
Update these files with client secrets from Keycloak:

**CommonLogin/appsettings.json:**
```json
"ClientSecret": "PASTE_COMMON_LOGIN_CLIENT_SECRET_HERE"
```

**App1/appsettings.json:**
```json
"ClientSecret": "PASTE_APP1_CLIENT_SECRET_HERE"
```

**App2/appsettings.json:**
```json
"ClientSecret": "PASTE_APP2_CLIENT_SECRET_HERE"
```

### Step 15: Build Applications
```cmd
dotnet build --configuration Release
```

## 🚀 PHASE 5: START APPLICATIONS

### Step 16: Start All Applications
```cmd
# Run this command (starts all apps)
start-applications.bat
```

**Or start manually:**
```cmd
# Terminal 1: CommonLogin
cd CommonLogin
dotnet run --urls=http://localhost:5000

# Terminal 2: App1
cd App1
dotnet run --urls=http://localhost:5001

# Terminal 3: App2
cd App2
dotnet run --urls=http://localhost:5002
```

## ✅ PHASE 6: TESTING

### Step 17: Test Primary User (Your Account)
1. Open: http://localhost:5000
2. Enter: `sandeepkumar1464@gmail.com`
3. Click **Login with SSO**
4. Enter password: `Admin_123`
5. Should see dashboard with all apps
6. Test launching App1 and App2

### Step 18: Test Google OAuth (If Configured)
1. Open: http://localhost:5000
2. Enter any username
3. Click **Login with SSO**
4. Click **Google** button
5. Login with: `sandeepkumar1464@gmail.com`
6. Should redirect to dashboard

### Step 19: Test Role-Based Access
**App1 Only User:**
1. Login with: `app1.user` / `Admin_123`
2. Should only see App1 in dashboard

**App2 Only User:**
1. Login with: `app2.user` / `Admin_123`
2. Should only see App2 in dashboard

**Multi-App User:**
1. Login with: `multi.user` / `Admin_123`
2. Should see both App1 and App2

## 🔍 PHASE 7: VERIFICATION

### Step 20: Verify All Services
```cmd
# Check Keycloak
curl http://localhost:8080/realms/sso-realm/.well-known/openid-configuration

# Check CommonLogin
curl http://localhost:5000

# Check App1
curl http://localhost:5001

# Check App2
curl http://localhost:5002
```

### Step 21: Verify SSO Flow
1. Login to CommonLogin
2. Open new tab → App1 (should auto-login)
3. Open new tab → App2 (should auto-login)
4. Logout from one app → should logout from all

## 🎯 QUICK REFERENCE

### Application URLs
- **CommonLogin**: http://localhost:5000
- **App1**: http://localhost:5001
- **App2**: http://localhost:5002
- **Keycloak Admin**: http://localhost:8080

### Test Credentials
| Username | Password | Access |
|----------|----------|---------|
| sandeepkumar1464@gmail.com | Admin_123 | All Apps (Your Account) |
| admin.user | Admin_123 | All Apps |
| app1.user | Admin_123 | App1 Only |
| app2.user | Admin_123 | App2 Only |
| multi.user | Admin_123 | App1 & App2 |

### Keycloak Admin
- **Username**: `admin`
- **Password**: `Admin_123`

## 🚨 TROUBLESHOOTING

### If Keycloak won't start:
1. Check Java is installed: `java -version`
2. Check port 8080 is free: `netstat -an | findstr :8080`
3. Run as Administrator if needed

### If applications won't start:
1. Check .NET 8 is installed: `dotnet --version`
2. Build applications: `dotnet build`
3. Check ports are free: `netstat -an | findstr "5000 5001 5002"`

### If SSO doesn't work:
1. Verify client secrets match in appsettings.json
2. Check redirect URIs in Keycloak clients
3. Verify user has correct roles assigned

This completes the full SSO platform setup with IAM capabilities!