# Keycloak 23.0.7 Authentication Issues & Solutions

## 🔍 Common Issues with Keycloak 23.0.7

### Issue 1: Client Secret Mismatch
**Problem**: Using wrong or outdated client secret
**Solution**:
1. Go to: http://localhost:8081/admin
2. Login: Admin / Admin_123
3. Navigate: sso-realm → Clients → magic-user → Credentials
4. Copy the actual Client Secret
5. Update appsettings.json

### Issue 2: Invalid Redirect URI
**Problem**: Keycloak rejects redirect from Magic Link app
**Solution**:
1. In Keycloak: Clients → magic-user → Settings
2. Valid redirect URIs: `http://localhost:5200/*`
3. Valid post logout redirect URIs: `http://localhost:5200/`
4. Web origins: `http://localhost:5200`

### Issue 3: User Not Found
**Problem**: magictest user doesn't exist in correct realm
**Solution**:
1. In Keycloak: Switch to sso-realm (not master)
2. Users → Add user
3. Username: `magictest`
4. Email: `sandeepkumar1464@gmail.com`
5. Email verified: ON
6. Credentials: `Magic123!` (temporary: OFF)

### Issue 4: Authentication Flow Configuration
**Problem**: Browser flow not properly configured
**Solution**:
1. Authentication → Flows → Browser
2. Verify flow structure:
   ```
   Browser Flow
   ├── Cookie (ALTERNATIVE)
   ├── Identity Provider Redirector (ALTERNATIVE)
   └── Browser Forms (ALTERNATIVE)
       ├── Username Password Form (REQUIRED)
       └── Browser Conditional OTP (CONDITIONAL)
   ```

## 🔧 Keycloak 23.0.7 Specific Configuration

### Client Settings (magic-user)
```
General:
- Client type: OpenID Connect
- Client ID: magic-user
- Name: Magic Link Application

Capability config:
- Client authentication: ON
- Authorization: OFF
- Standard flow: ON
- Direct access grants: ON
- Implicit flow: OFF
- Service accounts roles: OFF

Login settings:
- Root URL: http://localhost:5200
- Valid redirect URIs: http://localhost:5200/*
- Valid post logout redirect URIs: http://localhost:5200/
- Web origins: http://localhost:5200
```

### Realm Settings
```
General:
- Realm name: sso-realm
- Display name: SSO Realm
- Enabled: ON

Login:
- User registration: OFF
- Forgot password: ON
- Remember me: ON
- Email as username: OFF

Tokens:
- Access token lifespan: 5 minutes
- SSO session idle: 30 minutes
- SSO session max: 10 hours
```

## 🚀 Step-by-Step Fix

### 1. Verify Keycloak is Running
```bash
# Check if Keycloak is running
curl http://localhost:8081/admin

# If not running, start it
D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\01-start-keycloak.bat
```

### 2. Check Realm Configuration
```
URL: http://localhost:8081/admin
Login: Admin / Admin_123
Realm: sso-realm (switch from master)
```

### 3. Verify Client Configuration
```
Clients → magic-user → Settings:
- Client authentication: ON
- Standard flow: ON
- Valid redirect URIs: http://localhost:5200/*

Clients → magic-user → Credentials:
- Copy Client Secret
```

### 4. Update appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8081/realms/sso-realm",
    "ClientId": "magic-user",
    "ClientSecret": "[PASTE_ACTUAL_CLIENT_SECRET]",
    "RequireHttpsMetadata": false,
    "ResponseType": "code",
    "Scope": "openid profile email",
    "SaveTokens": true,
    "GetClaimsFromUserInfoEndpoint": true
  },
  "MagicLink": {
    "ExpiryMinutes": 15,
    "BaseUrl": "http://localhost:5200",
    "SecretKey": "ML_kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS_MagicLink_2024",
    "TestMode": "false"
  }
}
```

### 5. Create Test User
```
Users → Add user:
- Username: magictest
- Email: sandeepkumar1464@gmail.com
- Email verified: ON
- Enabled: ON

Credentials:
- Password: Magic123!
- Temporary: OFF
```

### 6. Test Authentication Flow
```
1. Start MagicLinkApp: dotnet run --urls="http://localhost:5200"
2. Go to: http://localhost:5200
3. Enter email: sandeepkumar1464@gmail.com
4. Send magic link
5. Click magic link (check console if email fails)
6. Should redirect to: http://localhost:8081/realms/sso-realm/protocol/openid-connect/auth
7. Login: magictest / Magic123!
8. Should redirect back to: http://localhost:5200/Home/Dashboard
```

## 🐛 Debugging Steps

### Check Keycloak Logs
```bash
# In Keycloak directory
tail -f data/log/keycloak.log
```

### Test Endpoints Manually
```bash
# Test realm discovery
curl http://localhost:8081/realms/sso-realm/.well-known/openid_configuration

# Test authorization endpoint
curl "http://localhost:8081/realms/sso-realm/protocol/openid-connect/auth?client_id=magic-user&response_type=code&redirect_uri=http://localhost:5200/signin-oidc&scope=openid%20profile%20email"
```

### Check Application Logs
```bash
# Run MagicLinkApp with detailed logging
dotnet run --urls="http://localhost:5200" --environment=Development
```

## ✅ Verification Checklist

- [ ] Keycloak 23.0.7 is running on port 8081
- [ ] sso-realm exists and is active
- [ ] magic-user client exists with correct settings
- [ ] Client secret matches appsettings.json
- [ ] magictest user exists in sso-realm
- [ ] Valid redirect URIs are configured
- [ ] MagicLink SecretKey is different from Keycloak ClientSecret
- [ ] Authentication flow redirects properly
- [ ] User can login and access dashboard

Run `batch/verify-keycloak-23-setup.bat` for automated verification.