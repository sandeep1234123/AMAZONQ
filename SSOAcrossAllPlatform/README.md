# SSO Platform with Keycloak 23.0.7 Integration

## Overview
This solution demonstrates a comprehensive Single Sign-On (SSO) implementation using Keycloak 23.0.7 with .NET 8 applications. It provides seamless authentication across multiple applications with support for various Identity Providers (IDPs) including Active Directory, Google, and Microsoft 365.

## Architecture

### Components
1. **CommonLogin** - Unified login portal (Port 5000)
2. **App1** - Business Application 1 (Port 5001)
3. **App2** - Business Application 2 (Port 5002)
4. **Keycloak** - Identity Provider (Port 8080)

### SSO Flow
```
User → CommonLogin → Keycloak → IDP (AD/Google/M365) → Keycloak → Applications
```

## Keycloak 23.0.7 Setup

### 1. Install Keycloak
```bash
# Download Keycloak 23.0.7
wget https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip
unzip keycloak-23.0.7.zip
cd keycloak-23.0.7

# Start Keycloak
bin/kc.sh start-dev --http-port=8080
```

### 2. Initial Setup
- Access: `http://localhost:8080`
- Create admin user: `admin/admin`

### 3. Create Realm
1. Create new realm: `sso-realm`
2. Configure realm settings:
   - Login tab: Enable "User registration"
   - Login tab: Enable "Forgot password"
   - Login tab: Enable "Remember me"

### 4. Create Clients

#### CommonLogin Client
```json
{
  "clientId": "common-login",
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "secret": "your-client-secret",
  "redirectUris": ["http://localhost:5000/*"],
  "webOrigins": ["http://localhost:5000"],
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true
}
```

#### App1 Client
```json
{
  "clientId": "app1-client",
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "secret": "app1-client-secret",
  "redirectUris": ["http://localhost:5001/*"],
  "webOrigins": ["http://localhost:5001"],
  "standardFlowEnabled": true
}
```

#### App2 Client
```json
{
  "clientId": "app2-client",
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "secret": "app2-client-secret",
  "redirectUris": ["http://localhost:5002/*"],
  "webOrigins": ["http://localhost:5002"],
  "standardFlowEnabled": true
}
```

### 5. Create Roles
- `admin` - Full access to all applications
- `app1-user` - Access to Application 1
- `app2-user` - Access to Application 2

### 6. Configure Identity Providers

#### Active Directory (LDAP)
```json
{
  "providerId": "ldap",
  "config": {
    "connectionUrl": "ldap://your-ad-server:389",
    "usersDn": "CN=Users,DC=company,DC=com",
    "bindDn": "CN=service-account,CN=Users,DC=company,DC=com",
    "bindCredential": "service-password",
    "usernameLDAPAttribute": "sAMAccountName",
    "rdnLDAPAttribute": "cn",
    "uuidLDAPAttribute": "objectGUID"
  }
}
```

#### Google Identity Provider
```json
{
  "providerId": "google",
  "config": {
    "clientId": "your-google-client-id",
    "clientSecret": "your-google-client-secret",
    "defaultScope": "openid profile email"
  }
}
```

#### Microsoft 365 (Azure AD)
```json
{
  "providerId": "microsoft",
  "config": {
    "clientId": "your-azure-client-id",
    "clientSecret": "your-azure-client-secret",
    "tenantId": "your-tenant-id"
  }
}
```

## Application Configuration

### Port Configuration
Update `Properties/launchSettings.json` for each application:

#### CommonLogin (Port 5000)
```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5000"
    }
  }
}
```

#### App1 (Port 5001)
```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5001"
    }
  }
}
```

#### App2 (Port 5002)
```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5002"
    }
  }
}
```

## Running the Solution

### 1. Start Keycloak
```bash
cd keycloak-23.0.7
bin/kc.sh start-dev --http-port=8080
```

### 2. Start Applications
```bash
# Terminal 1 - CommonLogin
cd CommonLogin
dotnet run --urls="http://localhost:5000"

# Terminal 2 - App1
cd App1
dotnet run --urls="http://localhost:5001"

# Terminal 3 - App2
cd App2
dotnet run --urls="http://localhost:5002"
```

## SSO User Flow

### 1. Initial Login
1. User accesses any application (App1 or App2)
2. Redirected to CommonLogin (`http://localhost:5000`)
3. User enters username/email
4. Redirected to Keycloak for authentication
5. Keycloak redirects to configured IDP (AD/Google/M365)
6. After successful authentication, user returns to CommonLogin
7. Dashboard shows authorized applications based on roles

### 2. Application Access
1. User clicks on authorized application
2. SSO token generated and passed to target application
3. Application validates token and performs silent authentication
4. User automatically logged into application

### 3. Cross-Application SSO
1. User authenticated in App1
2. Accesses App2 directly
3. Keycloak recognizes existing session
4. User automatically authenticated in App2 (if authorized)

## Security Features

### Token Validation
- **Time-based expiration** (5 minutes)
- **Role-based authorization**
- **Secure token generation**
- **Cross-application validation**

### Session Management
- **Shared session across applications**
- **Automatic session extension**
- **Secure logout from all applications**

### Role-Based Access Control
```csharp
[Authorize(Policy = "App1Access")]
public IActionResult Dashboard()
{
    // Only users with app1-user or admin roles can access
}
```

## Identity Provider Integration

### Active Directory
- **LDAP connection** for user authentication
- **Automatic role mapping** from AD groups
- **Seamless Windows authentication**

### Google Workspace
- **OAuth 2.0 integration**
- **Google profile synchronization**
- **Domain-based access control**

### Microsoft 365
- **Azure AD integration**
- **Office 365 profile sync**
- **Conditional access policies**

## Monitoring & Logging

### Application Logs
```csharp
_logger.LogInformation("User {UserId} accessed {Application}", userId, applicationName);
```

### Keycloak Events
- Login/logout events
- Failed authentication attempts
- Role assignments
- IDP authentication events

## Troubleshooting

### Common Issues

#### 1. Keycloak Connection
```bash
# Check Keycloak status
curl http://localhost:8080/realms/sso-realm/.well-known/openid_configuration
```

#### 2. Application Ports
Ensure no port conflicts:
- CommonLogin: 5000
- App1: 5001
- App2: 5002
- Keycloak: 8080

#### 3. CORS Issues
Update Keycloak client settings:
- Valid Redirect URIs: `http://localhost:500*/*`
- Web Origins: `http://localhost:500*`

### Debug Mode
Enable detailed logging in `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore.Authentication": "Debug"
    }
  }
}
```

## Production Deployment

### Environment Variables
```bash
export KEYCLOAK_AUTHORITY="https://keycloak.company.com/realms/sso-realm"
export KEYCLOAK_CLIENT_SECRET="production-secret"
export ASPNETCORE_ENVIRONMENT="Production"
```

### HTTPS Configuration
```json
{
  "Keycloak": {
    "Authority": "https://keycloak.company.com/realms/sso-realm",
    "RequireHttpsMetadata": true
  }
}
```

### Load Balancing
- Configure sticky sessions for applications
- Use Redis for distributed session storage
- Implement health checks

## Testing

### Unit Tests
```csharp
[Test]
public async Task ValidateSSOToken_ValidToken_ReturnsTrue()
{
    // Test SSO token validation logic
}
```

### Integration Tests
```csharp
[Test]
public async Task Login_ValidUser_RedirectsToDashboard()
{
    // Test complete login flow
}
```

This solution provides a robust, scalable SSO platform that can be extended to support additional applications and identity providers as needed.