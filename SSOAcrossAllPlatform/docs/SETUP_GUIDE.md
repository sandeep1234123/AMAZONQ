# Complete SSO Platform Setup Guide

## Step 1: Install and Setup Keycloak 23.0.7

### Download and Install Keycloak
```bash
# Download Keycloak 23.0.7
curl -L https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip -o keycloak-23.0.7.zip

# Extract
unzip keycloak-23.0.7.zip
cd keycloak-23.0.7
```

### Start Keycloak
```bash
# Windows
bin\kc.bat start-dev --http-port=8080

# Linux/Mac
bin/kc.sh start-dev --http-port=8080
```

### Initial Admin Setup
1. Open browser: `http://localhost:8080`
2. Create admin account:
   - **Username**: `admin`
   - **Password**: `Admin_123`

## Step 2: Configure Keycloak Realm

### Create New Realm
1. Login to Keycloak Admin Console
2. Click "Create Realm"
3. **Realm name**: `sso-realm`
4. Click "Create"

### Configure Realm Settings
1. Go to **Realm Settings** → **Login**
2. Enable:
   - ✅ User registration
   - ✅ Forgot password
   - ✅ Remember me
   - ✅ Login with email

## Step 3: Create Clients

### 1. CommonLogin Client
1. Go to **Clients** → **Create client**
2. **Client ID**: `common-login`
3. **Client type**: `OpenID Connect`
4. Click **Next**
5. **Client authentication**: `ON`
6. **Authorization**: `OFF`
7. **Standard flow**: `ON`
8. **Direct access grants**: `ON`
9. Click **Save**

#### Configure CommonLogin Client
1. **Settings** tab:
   - **Valid redirect URIs**: `http://localhost:5000/*`
   - **Valid post logout redirect URIs**: `http://localhost:5000/*`
   - **Web origins**: `http://localhost:5000`
2. **Credentials** tab:
   - Copy **Client secret**: `your-client-secret`

### 2. App1 Client
1. **Client ID**: `app1-client`
2. Same configuration as CommonLogin
3. **Valid redirect URIs**: `http://localhost:5001/*`
4. **Web origins**: `http://localhost:5001`
5. **Client secret**: `app1-client-secret`

### 3. App2 Client
1. **Client ID**: `app2-client`
2. Same configuration as CommonLogin
3. **Valid redirect URIs**: `http://localhost:5002/*`
4. **Web origins**: `http://localhost:5002`
5. **Client secret**: `app2-client-secret`

## Step 4: Create Roles

### Realm Roles
1. Go to **Realm roles** → **Create role**
2. Create these roles:
   - **Role name**: `admin`
     - **Description**: `Full access to all applications`
   - **Role name**: `app1-user`
     - **Description**: `Access to Application 1`
   - **Role name**: `app2-user`
     - **Description**: `Access to Application 2`

## Step 5: Create Test Users

### User 1: Primary Admin User
1. Go to **Users** → **Create new user**
2. **Username**: `sandeepkumar1464@gmail.com`
3. **Email**: `sandeepkumar1464@gmail.com`
4. **First name**: `Sandeep`
5. **Last name**: `Kumar`
6. **Email verified**: `ON`
7. Click **Create**

#### Set Password
1. Go to **Credentials** tab
2. Click **Set password**
3. **Password**: `Admin_123`
4. **Temporary**: `OFF`
5. Click **Save**

#### Assign Roles
1. Go to **Role mapping** tab
2. Click **Assign role**
3. Select: `admin`, `app1-user`, `app2-user`
4. Click **Assign**

### User 2: App1 User
1. **Username**: `app1.user`
2. **Email**: `app1@company.com`
3. **First name**: `App1`
4. **Last name**: `User`
5. **Password**: `Admin_123`
6. **Roles**: `app1-user`

### User 3: App2 User
1. **Username**: `app2.user`
2. **Email**: `app2@company.com`
3. **First name**: `App2`
4. **Last name**: `User`
5. **Password**: `Admin_123`
6. **Roles**: `app2-user`

### User 4: Multi-App User
1. **Username**: `multi.user`
2. **Email**: `multi@company.com`
3. **First name**: `Multi`
4. **Last name**: `User`
5. **Password**: `Admin_123`
6. **Roles**: `app1-user`, `app2-user`

## Step 6: Configure Identity Providers (Optional)

### Google Identity Provider
1. Go to **Identity providers** → **Add provider** → **Google**
2. **Client ID**: `your-google-oauth-client-id`
3. **Client Secret**: `your-google-oauth-client-secret`
4. **Default Scopes**: `openid profile email`
5. Click **Add**

### Microsoft Azure AD
1. Go to **Identity providers** → **Add provider** → **Microsoft**
2. **Client ID**: `your-azure-app-id`
3. **Client Secret**: `your-azure-client-secret`
4. **Tenant ID**: `your-tenant-id`
5. Click **Add**

### Active Directory (LDAP)
1. Go to **User federation** → **Add Ldap providers**
2. **Vendor**: `Active Directory`
3. **Connection URL**: `ldap://your-ad-server:389`
4. **Users DN**: `CN=Users,DC=company,DC=com`
5. **Bind DN**: `CN=service-account,CN=Users,DC=company,DC=com`
6. **Bind Credential**: `service-password`
7. Click **Save**

## Step 7: Update Application Configuration

### Update Client Secrets
Replace the client secrets in configuration files:

#### CommonLogin/appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8080/realms/sso-realm",
    "ClientId": "common-login",
    "ClientSecret": "COPY_FROM_KEYCLOAK_CREDENTIALS_TAB",
    "RequireHttpsMetadata": false
  }
}
```

#### App1/appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8080/realms/sso-realm",
    "ClientId": "app1-client",
    "ClientSecret": "COPY_FROM_KEYCLOAK_CREDENTIALS_TAB",
    "RequireHttpsMetadata": false
  }
}
```

#### App2/appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8080/realms/sso-realm",
    "ClientId": "app2-client",
    "ClientSecret": "COPY_FROM_KEYCLOAK_CREDENTIALS_TAB",
    "RequireHttpsMetadata": false
  }
}
```

## Step 8: Run the Applications

### Terminal 1: Start Keycloak
```bash
cd keycloak-23.0.7
bin/kc.sh start-dev --http-port=8080
# Wait for "Keycloak 23.0.7 started" message
```

### Terminal 2: Start CommonLogin
```bash
cd D:\AMAZONQ\SSOAcrossAllPlatform\CommonLogin
dotnet run --urls="http://localhost:5000"
```

### Terminal 3: Start App1
```bash
cd D:\AMAZONQ\SSOAcrossAllPlatform\App1
dotnet run --urls="http://localhost:5001"
```

### Terminal 4: Start App2
```bash
cd D:\AMAZONQ\SSOAcrossAllPlatform\App2
dotnet run --urls="http://localhost:5002"
```

## Step 9: Test the SSO Flow

### Test Scenario 1: Admin User
1. Open browser: `http://localhost:5000`
2. Enter username: `admin.user`
3. Click "Login with SSO"
4. Enter password: `Admin123!`
5. Should see dashboard with both App1 and App2 available
6. Click "Launch App" for App1 → Should auto-login to App1
7. Open new tab: `http://localhost:5002` → Should auto-login to App2

### Test Scenario 2: App1 User
1. Open browser: `http://localhost:5001`
2. Click "Login with SSO"
3. Enter username: `app1.user`
4. Enter password: `App1User123!`
5. Should access App1 successfully
6. Try accessing `http://localhost:5002` → Should be denied

### Test Scenario 3: Multi-App User
1. Open browser: `http://localhost:5000`
2. Enter username: `multi.user`
3. Enter password: `MultiUser123!`
4. Should see dashboard with both applications
5. Test seamless switching between apps

## Step 10: Verify SSO Configuration

### Check Keycloak Configuration
```bash
# Test Keycloak endpoint
curl http://localhost:8080/realms/sso-realm/.well-known/openid-configuration
```

### Check Application Health
```bash
# CommonLogin
curl http://localhost:5000

# App1
curl http://localhost:5001

# App2
curl http://localhost:5002
```

## Troubleshooting

### Issue: Connection Refused (Port 8080)
**Solution**: Ensure Keycloak is running
```bash
# Check if Keycloak is running
netstat -an | findstr :8080

# If not running, start Keycloak
cd keycloak-23.0.7
bin/kc.sh start-dev --http-port=8080
```

### Issue: Invalid Client Credentials
**Solution**: Copy correct client secrets from Keycloak
1. Go to Keycloak Admin → Clients → [client-name] → Credentials
2. Copy the secret to appsettings.json

### Issue: User Not Found
**Solution**: Verify user creation in Keycloak
1. Go to Users → View all users
2. Check user exists and has correct roles

### Issue: Access Denied
**Solution**: Check role assignments
1. Go to Users → [username] → Role mapping
2. Ensure user has required roles

## Test User Credentials Summary

| Username | Password | Email | Roles | Access |
|----------|----------|-------|-------|---------|
| sandeepkumar1464@gmail.com | Admin_123 | sandeepkumar1464@gmail.com | admin, app1-user, app2-user | All Apps |
| admin.user | Admin_123 | admin@company.com | admin, app1-user, app2-user | All Apps |
| app1.user | Admin_123 | app1@company.com | app1-user | App1 Only |
| app2.user | Admin_123 | app2@company.com | app2-user | App2 Only |
| multi.user | Admin_123 | multi@company.com | app1-user, app2-user | App1 & App2 |

## Production Considerations

### Security
- Use HTTPS in production
- Strong client secrets (32+ characters)
- Enable CSRF protection
- Configure session timeouts

### Performance
- Use Redis for session storage
- Configure connection pooling
- Enable caching for Keycloak responses

### Monitoring
- Enable Keycloak event logging
- Monitor application performance
- Set up health checks

This setup provides a complete SSO solution with role-based access control across multiple applications.