# Google OAuth 2.0 Setup Guide

## Project: watchful-pier-167804

### Step 1: Configure OAuth Consent Screen

1. **Go to**: https://console.cloud.google.com/auth/branding?project=watchful-pier-167804
2. **Select User Type**: 
   - Choose **External** (for testing with any Google account)
   - Click **CREATE**

3. **OAuth Consent Screen Configuration**:
   ```
   App name: SSO Platform
   User support email: sandeepkumar1464@gmail.com
   App logo: (Optional - upload your company logo)
   Application home page: http://localhost:5000
   Application privacy policy link: http://localhost:5000/privacy
   Application terms of service link: http://localhost:5000/terms
   Authorized domains: localhost
   Developer contact information: sandeepkumar1464@gmail.com
   ```
4. Click **SAVE AND CONTINUE**

### Step 2: Configure Scopes
1. Click **ADD OR REMOVE SCOPES**
2. Select these scopes:
   ```
   ✅ ../auth/userinfo.email
   ✅ ../auth/userinfo.profile
   ✅ openid
   ```
3. Click **UPDATE** → **SAVE AND CONTINUE**

### Step 3: Add Test Users (for External apps)
1. Click **ADD USERS**
2. Add test email addresses:
   ```
   sandeepkumar1464@gmail.com
   test-user@gmail.com
   admin@company.com
   ```
3. Click **SAVE AND CONTINUE**

### Step 4: Create OAuth 2.0 Credentials

1. **Go to**: https://console.cloud.google.com/apis/credentials?project=watchful-pier-167804
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. **Application type**: Web application
4. **Name**: `Keycloak SSO Integration`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:8080
   http://localhost:5000
   http://localhost:5001
   http://localhost:5002
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:8080/realms/sso-realm/broker/google/endpoint
   ```
7. Click **CREATE**

### Step 5: Copy Credentials
After creation, copy these values:
```
Client ID: [COPY_THIS_VALUE]
Client Secret: [COPY_THIS_VALUE]
```

## Keycloak Configuration

### Step 1: Add Google Identity Provider
1. **Login to Keycloak**: http://localhost:8080
2. **Go to**: Identity Providers → **Add provider** → **Google**
3. **Configure**:
   ```
   Alias: google
   Display Name: Google
   Client ID: [PASTE_FROM_GOOGLE_CONSOLE]
   Client Secret: [PASTE_FROM_GOOGLE_CONSOLE]
   Default Scopes: openid profile email
   ```
4. Click **Add**

### Step 2: Configure Mappers (Optional)
1. **Go to**: Identity Providers → **google** → **Mappers**
2. **Create mapper**:
   ```
   Name: email
   Mapper Type: Attribute Importer
   Claim: email
   User Attribute Name: email
   ```
3. **Create mapper**:
   ```
   Name: first_name
   Mapper Type: Attribute Importer
   Claim: given_name
   User Attribute Name: firstName
   ```
4. **Create mapper**:
   ```
   Name: last_name
   Mapper Type: Attribute Importer
   Claim: family_name
   User Attribute Name: lastName
   ```

## Test Google OAuth Integration

### Step 1: Update Login Page
The CommonLogin application will automatically show Google login option.

### Step 2: Test Login Flow
1. **Go to**: http://localhost:5000
2. **Enter any username** (will be ignored for Google login)
3. **Click "Login with SSO"**
4. **Should see Keycloak login page with Google option**
5. **Click Google button**
6. **Login with Google account**
7. **Should redirect back to SSO dashboard**

## Application Configuration Updates

### Update appsettings.json files
No changes needed - applications will automatically work with Google OAuth through Keycloak.

## Troubleshooting

### Error: redirect_uri_mismatch
**Solution**: Verify redirect URI in Google Console matches exactly:
```
http://localhost:8080/realms/sso-realm/broker/google/endpoint
```

### Error: access_denied
**Solution**: 
1. Check OAuth consent screen is configured
2. Add your email to test users
3. Verify scopes are properly configured

### Error: invalid_client
**Solution**: 
1. Verify Client ID and Secret are correct
2. Check they're properly pasted in Keycloak
3. Ensure no extra spaces or characters

## Production Configuration

### For Production Deployment:
1. **Change User Type** to **Internal** (if using Google Workspace)
2. **Update Authorized domains** to your production domain
3. **Update redirect URIs** to production URLs:
   ```
   https://your-domain.com/realms/sso-realm/broker/google/endpoint
   ```
4. **Submit app for verification** if using External user type

## Security Best Practices

### Client Secret Security
- Store Client Secret securely
- Use environment variables in production
- Rotate secrets regularly

### Scope Limitations
- Only request necessary scopes
- Review permissions regularly
- Monitor OAuth usage

## Testing Checklist

- [ ] OAuth consent screen configured
- [ ] Scopes properly set (openid, profile, email)
- [ ] Test users added
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URI matches exactly
- [ ] Google provider added to Keycloak
- [ ] Mappers configured for user attributes
- [ ] Login flow works end-to-end
- [ ] User profile data imported correctly

## Google OAuth URLs for Reference

- **Google Console**: https://console.cloud.google.com/apis/credentials?project=watchful-pier-167804
- **OAuth Consent**: https://console.cloud.google.com/auth/branding?project=watchful-pier-167804
- **Keycloak Redirect**: http://localhost:8080/realms/sso-realm/broker/google/endpoint
- **Test Login**: http://localhost:5000

After completing this setup, users can login to your SSO platform using their Google accounts!