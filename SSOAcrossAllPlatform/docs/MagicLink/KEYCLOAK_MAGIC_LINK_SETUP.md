# Keycloak Magic Link Setup Guide

## Overview
Magic Link authentication provides passwordless login through Keycloak. Users receive a secure link via email that authenticates them directly through Keycloak's system.

## Keycloak Configuration Steps

### Step 1: Create Magic Link Client

1. **Login to Keycloak Admin Console**
   - URL: `http://localhost:8081`
   - Select realm: `sso-realm`
   - Navigate to: `Clients` → `Create client`

2. **Client Configuration**
   ```
   Client type: OpenID Connect
   Client ID: magic-user
   Name: Magic Link Application
   Description: Passwordless authentication app
   ```

3. **Capability Config**
   ```
   Client authentication: ON
   Authorization: OFF
   Standard flow: ON
   Direct access grants: ON
   Implicit flow: OFF
   Service accounts roles: OFF
   ```

4. **Login Settings**
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

### Step 2: Configure Client Secret

1. **Go to Credentials Tab**
   ```
   Client Authenticator: Client Id and Secret
   Client Secret: magic-link-secret-2025
   ```

### Step 3: Configure Authentication Flow

1. **Navigate to Authentication → Flows**
2. **Create Custom Flow for Magic Link**
   ```
   Flow Name: Magic Link Flow
   Description: Passwordless authentication via email
   ```

3. **Add Execution Steps**
   - Cookie (REQUIRED)
   - Identity Provider Redirector (ALTERNATIVE)
   - Username Password Form (ALTERNATIVE)
   - OTP Form (DISABLED)

### Step 4: Configure Email Settings

1. **Navigate to Realm Settings → Email**
   ```
   Host: smtp.gmail.com
   Port: 587
   From: noreply@magiclink.com
   From Display Name: Magic Link App
   Enable StartTLS: ON
   Enable Authentication: ON
   Username: your-email@gmail.com
   Password: your-app-password
   ```

2. **Test Email Configuration**
   - Click "Test connection"
   - Should show "Success"

### Step 5: Configure Magic Link Authentication

1. **Create Custom Authenticator (Optional)**
   - For advanced magic link validation
   - Custom SPI implementation

2. **Use Built-in Email Verification**
   ```
   Authentication → Required Actions
   Enable: Verify Email
   Set as Default Action: ON
   ```

## Application Integration

### Step 1: Update appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8081/realms/sso-realm",
    "ClientId": "magic-user",
    "ClientSecret": "magic-link-secret-2025",
    "RequireHttpsMetadata": false,
    "ResponseType": "code",
    "Scope": "openid profile email",
    "SaveTokens": true,
    "GetClaimsFromUserInfoEndpoint": true
  },
  "MagicLink": {
    "ExpiryMinutes": 15,
    "BaseUrl": "http://localhost:5200",
    "SecretKey": "your-secret-key-for-token-generation"
  }
}
```

### Step 2: Magic Link Flow Implementation

**Magic Link Generation:**
1. User enters email
2. App generates secure token
3. App creates magic link URL
4. App sends email with magic link

**Magic Link Verification:**
1. User clicks magic link
2. App validates token (expiry, usage)
3. App redirects to Keycloak with login_hint
4. Keycloak authenticates user
5. User redirected to dashboard

## Testing the Magic Link Flow

### Step 1: Start Application
```bash
cd MagicLinkApp
dotnet run --urls="http://localhost:5200"
```

### Step 2: Test Magic Link
1. Go to `http://localhost:5200`
2. Enter email: `sandeepkumar1464@gmail.com`
3. Click "Send Magic Link"
4. Check console logs for magic link URL
5. Copy and paste URL in browser
6. Should authenticate via Keycloak

### Step 3: Verify SSO
1. After magic link authentication
2. Visit other applications (App1, App2, App3)
3. Should have SSO session active
4. No additional login required

## Security Considerations

### Token Security
- **Expiry Time**: 15 minutes maximum
- **Single Use**: Token invalidated after use
- **Cryptographic Security**: Use RandomNumberGenerator
- **HTTPS Only**: Production must use HTTPS

### Email Security
- **Rate Limiting**: Prevent email spam
- **User Validation**: Verify user exists in Keycloak
- **Secure SMTP**: Use authenticated SMTP
- **Email Templates**: Professional email design

### Keycloak Security
- **Client Secret**: Secure storage
- **Redirect URIs**: Exact match validation
- **Session Management**: Proper logout handling
- **Token Validation**: Verify all claims

## Production Deployment

### Email Service Integration
```csharp
// Use SendGrid, AWS SES, or similar
services.AddTransient<IEmailService, SendGridEmailService>();
```

### Database Storage
```csharp
// Store magic tokens in database/Redis
services.AddDbContext<MagicLinkContext>();
services.AddStackExchangeRedisCache();
```

### Monitoring
- Track magic link usage
- Monitor failed attempts
- Log security events
- Set up alerts for anomalies

## Troubleshooting

### Common Issues

1. **Magic Link Not Working**
   - Check token expiry
   - Verify Keycloak client config
   - Check redirect URIs

2. **Email Not Sending**
   - Test SMTP configuration
   - Check email credentials
   - Verify firewall settings

3. **Keycloak Authentication Fails**
   - Check client secret
   - Verify user exists
   - Check realm configuration

### Debug Steps

1. **Enable Debug Logging**
   ```json
   "Logging": {
     "LogLevel": {
       "Microsoft.AspNetCore.Authentication": "Debug"
     }
   }
   ```

2. **Check Keycloak Logs**
   - Monitor authentication events
   - Check for error messages
   - Verify token validation

3. **Test Components Separately**
   - Test email sending
   - Test token generation
   - Test Keycloak authentication