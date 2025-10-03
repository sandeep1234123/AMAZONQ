# Detailed Keycloak Magic Link Setup & Verification

## Prerequisites
- Keycloak running on http://localhost:8081
- Admin access to Keycloak (Admin / Admin_123)
- sso-realm already created

## Step 1: Access Keycloak Admin Console

1. **Open Browser**: http://localhost:8081/admin
2. **Login Credentials**:
   - Username: `Admin`
   - Password: `Admin_123`
3. **Select Realm**: Click dropdown (top-left) → Select `sso-realm`

## Step 2: Create Magic User Client

### 2.1 Navigate to Clients
1. In left sidebar → Click **"Clients"**
2. Click **"Create client"** button

### 2.2 General Settings
```
Client type: OpenID Connect
Client ID: magic-user
Name: Magic Link Application
Description: Passwordless authentication via email
```
Click **"Next"**

### 2.3 Capability Config
```
✅ Client authentication: ON
❌ Authorization: OFF
✅ Standard flow: ON
✅ Direct access grants: ON
❌ Implicit flow: OFF
❌ Service accounts roles: OFF
```
Click **"Next"**

### 2.4 Login Settings
```
Root URL: http://localhost:5200
Home URL: http://localhost:5200
Valid redirect URIs: 
  - http://localhost:5200/*
  - http://localhost:5200/signin-oidc
Valid post logout redirect URIs:
  - http://localhost:5200/*
Web origins: http://localhost:5200
```
Click **"Save"**

### 2.5 Get Client Secret
1. Go to **"Credentials"** tab
2. **Client Authenticator**: Client Id and Secret
3. **Copy the Client Secret** (e.g., `kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS`)

## Step 3: Update Application Configuration

### 3.1 Update appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8081/realms/sso-realm",
    "ClientId": "magic-user",
    "ClientSecret": "kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS",
    "RequireHttpsMetadata": false,
    "ResponseType": "code",
    "Scope": "openid profile email",
    "SaveTokens": true,
    "GetClaimsFromUserInfoEndpoint": true
  }
}
```

### 3.2 Disable Test Mode
```json
{
  "MagicLink": {
    "TestMode": "false"
  }
}
```

## Step 4: Create Test User in sso-realm

### 4.1 Navigate to Users
1. In left sidebar → Click **"Users"**
2. Click **"Add user"** button

### 4.2 User Details
```
Username: magictest
Email: sandeepkumar1464@gmail.com
First name: Magic
Last name: Test
Email verified: ✅ ON
Enabled: ✅ ON
```
Click **"Create"**

### 4.3 Set Password
1. Go to **"Credentials"** tab
2. **Password**: `Magic123!`
3. **Temporary**: ❌ OFF
4. Click **"Set password"**

### 4.4 Assign Roles (Optional)
1. Go to **"Role mapping"** tab
2. Click **"Assign role"**
3. Select: `app1-user`, `app2-user`, `app3-user`
4. Click **"Assign"**

## Step 5: Configure Email Settings in Keycloak

### 5.1 Navigate to Email Settings
1. In left sidebar → **"Realm settings"**
2. Click **"Email"** tab

### 5.2 SMTP Configuration
```
Host: smtp.gmail.com
Port: 587
From: sandeepkumar1464@gmail.com
From Display Name: SSO Platform
Enable StartTLS: ✅ ON
Enable Authentication: ✅ ON
Username: sandeepkumar1464@gmail.com
Password: auwo ejto ieeb osda
```

### 5.3 Test Email
1. Click **"Test connection"**
2. Enter: `sandeepkumar1464@gmail.com`
3. Click **"Send test email"**
4. Should show **"Success"**

## Step 6: Verification Steps

### 6.1 Start Applications
```bash
# Start Keycloak (if not running)
D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\01-start-keycloak.bat

# Start Magic Link App
D:\AMAZONQ\SSOAcrossAllPlatform\MagicLinkApp\simple-magic-link-test.bat
```

### 6.2 Test Magic Link Flow
1. **Open**: http://localhost:5200
2. **Enter Email**: `sandeepkumar1464@gmail.com`
3. **Click**: "Send Magic Link"
4. **Check Console** for magic link URL
5. **Click Magic Link** in email or console
6. **Should redirect** to Keycloak login
7. **Login with**:
   - Username: `magictest`
   - Password: `Magic123!`
8. **Should redirect** to Dashboard

### 6.3 Verify SSO Integration
1. **After Magic Link login**
2. **Open new tab**: http://localhost:5000 (CommonLogin)
3. **Should be automatically logged in**
4. **Test other apps**: App1, App2, App3
5. **Should have SSO session active**

## Step 7: Troubleshooting

### 7.1 Common Issues

**Magic Link Not Working:**
```
✅ Check: Client ID matches in appsettings.json
✅ Check: Client Secret is correct
✅ Check: Redirect URIs include http://localhost:5200/*
✅ Check: User exists in sso-realm (not master)
```

**Email Not Sending:**
```
✅ Check: SMTP settings in Keycloak
✅ Check: Test email works in Keycloak
✅ Check: Gmail app password is correct
✅ Check: Console logs for magic link URL
```

**Keycloak Authentication Fails:**
```
✅ Check: User credentials (magictest / Magic123!)
✅ Check: User is in sso-realm
✅ Check: Standard flow is enabled
✅ Check: Client authentication is ON
```

### 7.2 Debug Commands

**Check Client Configuration:**
```
GET http://localhost:8081/realms/sso-realm/.well-known/openid-configuration
```

**Test Token Endpoint:**
```
POST http://localhost:8081/realms/sso-realm/protocol/openid-connect/token
```

**Verify User Exists:**
1. Keycloak Admin → sso-realm → Users
2. Search for: `magictest`
3. Should show user details

### 7.3 Logs to Check

**Application Logs:**
- Magic Link generation
- Token validation
- Keycloak challenge
- Authentication success/failure

**Keycloak Logs:**
- Client authentication
- User login attempts
- Token exchanges
- Redirect validations

## Step 8: Production Considerations

### 8.1 Security Settings
```json
{
  "Keycloak": {
    "RequireHttpsMetadata": true
  },
  "MagicLink": {
    "ExpiryMinutes": 5,
    "TestMode": "false"
  }
}
```

### 8.2 Email Service
- Use SendGrid/AWS SES instead of Gmail SMTP
- Implement proper email templates
- Add rate limiting for magic link requests

### 8.3 Token Storage
- Use Redis/Database instead of in-memory storage
- Implement token cleanup for expired tokens
- Add audit logging for security

## Verification Checklist

- [ ] Keycloak running on port 8081
- [ ] sso-realm exists
- [ ] magic-user client created
- [ ] Client secret updated in appsettings.json
- [ ] Test user created in sso-realm
- [ ] Email settings configured in Keycloak
- [ ] Test email works
- [ ] Magic Link App starts on port 5200
- [ ] Magic link generates successfully
- [ ] Magic link redirects to Keycloak
- [ ] User can login with test credentials
- [ ] Dashboard loads after authentication
- [ ] SSO works with other applications