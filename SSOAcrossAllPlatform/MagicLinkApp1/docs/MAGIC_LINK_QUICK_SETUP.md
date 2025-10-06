# Magic Link Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Keycloak
```bash
D:\AMAZONQ\SSOAcrossAllPlatform\scripts\startup\01-start-keycloak.bat
```

### Step 2: Create Magic User Client
1. **Open**: http://localhost:8081/admin
2. **Login**: Admin / Admin_123
3. **Realm**: sso-realm
4. **Clients** → **Create client**:
   - Client ID: `magic-user`
   - Client authentication: **ON**
   - Standard flow: **ON**
   - Valid redirect URIs: `http://localhost:5200/*`
5. **Credentials tab** → Copy Client Secret
6. **Update** `MagicLinkApp/appsettings.json`:
   ```json
   "ClientSecret": "[paste-copied-secret]"
   ```

### Step 3: Create Test User
1. **Users** → **Add user**:
   - Username: `magictest`
   - Email: `sandeepkumar1464@gmail.com`
   - Email verified: **ON**
2. **Credentials tab**:
   - Password: `Magic123!`
   - Temporary: **OFF**

### Step 4: Test Magic Link
1. **Start app**: `MagicLinkApp\simple-magic-link-test.bat`
2. **Go to**: http://localhost:5200
3. **Enter email**: sandeepkumar1464@gmail.com
4. **Send Magic Link**
5. **Click link** → Login: magictest / Magic123!

## ✅ Verification
Run: `scripts\configuration\verify-magic-link-setup.bat`

## 🔧 Settings Summary

### Keycloak Client (magic-user)
- Client authentication: ON
- Standard flow: ON
- Direct access grants: ON
- Valid redirect URIs: `http://localhost:5200/*`

### Test User (magictest)
- Email: sandeepkumar1464@gmail.com
- Password: Magic123!
- Realm: sso-realm

### App Configuration
- TestMode: false (for Keycloak integration)
- TestMode: true (for testing without Keycloak)

## 🐛 Quick Fixes

**Magic Link Not Working:**
- Check client secret matches
- Verify user exists in sso-realm
- Ensure redirect URIs are correct

**Email Not Sending:**
- Check console for magic link URL
- Verify SMTP settings in Keycloak
- Test email connection in Keycloak

**Authentication Fails:**
- Login: magictest / Magic123!
- Check user is in sso-realm (not master)
- Verify client settings in Keycloak