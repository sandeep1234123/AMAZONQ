# Fix Secret Key Issue - Step by Step

## 🔍 Problem
Using same secret key for MagicLink token signing and Keycloak client authentication causes conflicts.

## 🔧 Solution Steps

### Step 1: Get Correct Keycloak Client Secret
1. **Open Keycloak Admin Console**:
   ```
   http://localhost:8081/admin
   Login: Admin / Admin_123
   ```

2. **Navigate to Client**:
   ```
   Realm: sso-realm
   Clients → magic-user → Credentials tab
   ```

3. **Copy Client Secret**:
   - Click "Regenerate" if needed
   - Copy the new secret (example: `abc123def456ghi789`)

### Step 2: Generate New MagicLink Secret
1. **Generate Random Secret** (32+ characters):
   ```
   Option 1: Use online generator
   Option 2: PowerShell: [System.Web.Security.Membership]::GeneratePassword(32, 0)
   Option 3: Use: ML_kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS_2024
   ```

### Step 3: Update appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8081/realms/sso-realm",
    "ClientId": "magic-user",
    "ClientSecret": "[PASTE_KEYCLOAK_CLIENT_SECRET_HERE]",
    "RequireHttpsMetadata": false,
    "ResponseType": "code",
    "Scope": "openid profile email",
    "SaveTokens": true,
    "GetClaimsFromUserInfoEndpoint": true
  },
  "MagicLink": {
    "ExpiryMinutes": 15,
    "BaseUrl": "http://localhost:5200",
    "SecretKey": "ML_kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS_2024",
    "TestMode": "true"
  }
}
```

## ✅ Verification Steps

### 1. Test Keycloak Connection
```bash
# Test Keycloak discovery endpoint
curl http://localhost:8081/realms/sso-realm/.well-known/openid_configuration
```

### 2. Test Magic Link Generation
1. Start app: `batch\simple-magic-link-test.bat`
2. Go to: http://localhost:5200
3. Enter email: sandeepkumar1464@gmail.com
4. Click "Send Magic Link"
5. Check console for magic link URL

### 3. Test Token Validation
1. Copy magic link from console
2. Click the link or paste in browser
3. Should redirect to Keycloak login
4. Login: magictest / Magic123!

## 🐛 Common Issues

### Issue 1: "Invalid client credentials"
**Solution**: Check Keycloak client secret matches appsettings.json

### Issue 2: "Token validation failed"
**Solution**: Ensure MagicLink.SecretKey is different from Keycloak.ClientSecret

### Issue 3: "User not found"
**Solution**: Create user in Keycloak sso-realm (not master realm)

## 🔑 Key Points
- **Keycloak.ClientSecret**: Authenticates app to Keycloak
- **MagicLink.SecretKey**: Signs/validates magic link tokens
- **These MUST be different values**
- **TestMode: "true"** bypasses some Keycloak checks for testing