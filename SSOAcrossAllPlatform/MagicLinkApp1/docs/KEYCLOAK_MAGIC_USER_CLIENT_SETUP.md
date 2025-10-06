# Keycloak Magic-User Client Configuration Guide

## 📋 Client Overview
- **Client ID**: `magic-user`
- **Client Secret**: `kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS`
- **Realm**: `sso-realm`
- **Purpose**: Magic Link authentication with SSO integration

## 🔧 Step-by-Step Client Setup

### 1. Access Keycloak Admin Console
```
URL: http://localhost:8081/admin
Login: Admin / Admin_123
Realm: sso-realm (switch from master)
```

### 2. Create Client
1. **Clients** → **Create client**
2. **General Settings**:
   - Client type: `OpenID Connect`
   - Client ID: `magic-user`
   - Name: `Magic Link Application`
   - Description: `Magic Link authentication with SSO`

## ⚙️ Client Configuration Details

### Access Settings
```
Client authentication: ON
Authorization: OFF
Standard flow: ON
Direct access grants: ON
Implicit flow: OFF
Service accounts roles: OFF
OAuth 2.0 Device Authorization Grant: OFF
OIDC CIBA Grant: OFF
```

### Capability Config
```
Client authentication: ON (Required for confidential client)
Authorization: OFF (No fine-grained authorization needed)
Standard flow: ON (Authorization Code Flow)
Direct access grants: ON (Resource Owner Password Credentials)
Implicit flow: OFF (Not recommended for security)
Service accounts roles: OFF (Not using service account)
OAuth 2.0 Device Authorization Grant: OFF
OIDC CIBA Grant: OFF
```

### Login Settings
```
Root URL: http://localhost:5200
Home URL: http://localhost:5200
Valid redirect URIs: 
  - http://localhost:5200/*
  - http://localhost:5200/signin-oidc
  - http://localhost:5200/auth/callback
Valid post logout redirect URIs:
  - http://localhost:5200/
  - http://localhost:5200/logout
Web origins: 
  - http://localhost:5200
  - +
Admin URL: (empty)
```

### Logout Settings
```
Backchannel logout URL: (empty)
Backchannel logout session required: OFF
Backchannel logout revoke offline sessions: OFF
Front channel logout: OFF
```

## 🔐 Authentication Flow Configuration

### 1. Standard Flow (Authorization Code)
**Enabled**: ✅ ON
```
Flow: Authorization Code Flow
Usage: Primary authentication method
Steps:
1. User clicks magic link
2. Redirects to Keycloak authorization endpoint
3. User authenticates (if not already logged in)
4. Keycloak returns authorization code
5. App exchanges code for tokens
```

### 2. Direct Access Grants
**Enabled**: ✅ ON
```
Flow: Resource Owner Password Credentials
Usage: Direct token exchange (if needed)
Steps:
1. App sends username/password directly to Keycloak
2. Keycloak returns tokens directly
```

### 3. Client Credentials (Service Account)
**Enabled**: ❌ OFF
```
Reason: Not needed for user authentication
```

## 🔑 Client Credentials

### Credentials Tab
```
Client Authenticator: Client Id and Secret
Client Secret: kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS
```

### Advanced Settings
```
Access Token Lifespan: (use realm default - 5 minutes)
Client Session Idle: (use realm default - 30 minutes)
Client Session Max: (use realm default - 10 hours)
Client Offline Session Idle: (use realm default - 30 days)
Client Offline Session Max: (use realm default - 60 days)
```

## 🎯 Scope Configuration

### Client Scopes (Default)
```
✅ email
✅ profile  
✅ roles
✅ web-origins
```

### Client Scopes (Optional)
```
⚪ address
⚪ microprofile-jwt
⚪ offline_access
⚪ phone
```

## 👤 Test User Setup

### Create Magic Test User
1. **Users** → **Add user**
2. **Details**:
   ```
   Username: magictest
   Email: sandeepkumar1464@gmail.com
   First name: Magic
   Last name: Test
   Email verified: ON
   Enabled: ON
   ```
3. **Credentials**:
   ```
   Password: Magic123!
   Temporary: OFF
   ```

## 🔄 Authentication Flow Details

### Magic Link Flow
```
1. User enters email → MagicLinkApp
2. App generates magic link token
3. App sends email with magic link
4. User clicks link → App validates token
5. App redirects to Keycloak authorization endpoint:
   http://localhost:8081/realms/sso-realm/protocol/openid-connect/auth
6. User authenticates in Keycloak
7. Keycloak redirects back with authorization code
8. App exchanges code for access/ID tokens
9. User is logged in with SSO session
```

### Keycloak Endpoints
```
Authorization: http://localhost:8081/realms/sso-realm/protocol/openid-connect/auth
Token: http://localhost:8081/realms/sso-realm/protocol/openid-connect/token
UserInfo: http://localhost:8081/realms/sso-realm/protocol/openid-connect/userinfo
Logout: http://localhost:8081/realms/sso-realm/protocol/openid-connect/logout
JWKS: http://localhost:8081/realms/sso-realm/protocol/openid-connect/certs
```

## ✅ Verification Steps

### 1. Test Client Configuration
```bash
# Run verification script
D:\AMAZONQ\SSOAcrossAllPlatform\scripts\configuration\verify-magic-link-setup.bat
```

### 2. Manual Verification
1. **Check Client**: Clients → magic-user → Settings
2. **Test Authentication**: 
   ```
   URL: http://localhost:8081/realms/sso-realm/protocol/openid-connect/auth?client_id=magic-user&response_type=code&redirect_uri=http://localhost:5200/signin-oidc&scope=openid%20profile%20email
   ```
3. **Verify User**: Users → magictest → Details

### 3. Application Test
```bash
# Start MagicLinkApp
D:\AMAZONQ\SSOAcrossAllPlatform\MagicLinkApp\simple-magic-link-test.bat

# Test flow
1. Go to: http://localhost:5200
2. Enter: sandeepkumar1464@gmail.com
3. Click magic link in email
4. Login: magictest / Magic123!
```

## 🐛 Troubleshooting

### Common Issues
```
❌ Invalid redirect URI
   → Check Valid redirect URIs: http://localhost:5200/*

❌ Client secret mismatch
   → Copy from Credentials tab to appsettings.json

❌ User not found
   → Verify user exists in sso-realm (not master)

❌ Authentication failed
   → Check user credentials: magictest / Magic123!
```

### Debug URLs
```
Keycloak Admin: http://localhost:8081/admin
Realm Settings: http://localhost:8081/admin/master/console/#/sso-realm
Client Settings: http://localhost:8081/admin/master/console/#/sso-realm/clients
User Management: http://localhost:8081/admin/master/console/#/sso-realm/users
```

## 📝 Configuration Summary

### appsettings.json Mapping
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

### Key Settings Verification
- ✅ Client authentication: ON
- ✅ Standard flow: ON  
- ✅ Direct access grants: ON
- ✅ Valid redirect URIs: http://localhost:5200/*
- ✅ Client secret matches appsettings.json
- ✅ Test user exists with correct credentials