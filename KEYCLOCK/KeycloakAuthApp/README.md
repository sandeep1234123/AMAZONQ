# Keycloak Authentication Application with .NET Core

## Overview
This comprehensive application demonstrates advanced Keycloak integration with .NET Core, featuring SSO setups, magic link authentication, user management, and data migration capabilities.

## Features

### 🔐 Authentication & Authorization
- **JWT Bearer Authentication** with Keycloak
- **Role-based Authorization** (admin, user roles)
- **Magic Link Login** for passwordless authentication
- **Multi-client SSO** support

### 🌐 SSO Integration
- **Azure AD** integration
- **Okta** integration  
- **Google** integration
- Custom IDP configuration support

### 👥 User Management
- User registration and profile management
- Role assignment and management
- User migration from external IDPs
- Bulk user operations

### 🔄 Data Migration
- Automated user migration from Azure AD
- Automated user migration from Okta
- Automated user migration from Google
- Migration logging and status tracking

### 🎯 Auto-Login Features
- Single realm, multiple client support
- Session management across applications
- Seamless user experience

## Architecture

### Database Schema (PostgreSQL)
```sql
-- Magic Link Tokens
CREATE TABLE MagicLinkTokens (
    Id SERIAL PRIMARY KEY,
    Token VARCHAR(255) UNIQUE NOT NULL,
    Email VARCHAR(255) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    IsUsed BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- User Sessions
CREATE TABLE UserSessions (
    Id SERIAL PRIMARY KEY,
    UserId VARCHAR(255) NOT NULL,
    SessionId VARCHAR(255) UNIQUE NOT NULL,
    ClientId VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    LastAccessedAt TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);

-- Migration Logs
CREATE TABLE MigrationLogs (
    Id SERIAL PRIMARY KEY,
    UserId VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    SourceIdp VARCHAR(100) NOT NULL,
    MigratedAt TIMESTAMP DEFAULT NOW(),
    Status VARCHAR(50) NOT NULL,
    ErrorMessage TEXT
);
```

## Configuration

### Keycloak Setup
1. **Install Keycloak**:
   ```bash
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```

2. **Create Realm**: Create a new realm or use 'master'

3. **Create Client**: 
   - Client ID: `keycloak-auth-app`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`

4. **Create Roles**:
   - `admin` - Full access to user management
   - `user` - Basic user access

### Application Configuration
Update `appsettings.json`:
```json
{
  "Keycloak": {
    "BaseUrl": "http://localhost:8080",
    "Realm": "your-realm",
    "Authority": "http://localhost:8080/realms/your-realm",
    "ClientId": "keycloak-auth-app",
    "ClientSecret": "your-client-secret",
    "AdminUsername": "admin",
    "AdminPassword": "admin"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=KeycloakAuthApp;Username=postgres;Password=root"
  }
}
```

## API Endpoints

### Authentication Endpoints
```http
POST /api/auth/register
POST /api/auth/magic-link
GET  /api/auth/magic-link/validate
GET  /api/auth/profile
```

### User Management (Admin Only)
```http
GET  /api/usermanagement/users
GET  /api/usermanagement/users/{email}
POST /api/usermanagement/users/{userId}/roles/{roleName}
GET  /api/usermanagement/users/{userId}/roles
POST /api/usermanagement/migrate
```

### SSO Configuration (Admin Only)
```http
POST /api/sso/configure/azure
POST /api/sso/configure/okta
POST /api/sso/configure/google
```

### SSO Login Credentials
```http
GET  /api/ssologin/credentials
POST /api/ssologin/update-credentials
POST /api/ssologin/validate
```

## Usage Examples

### 1. User Registration
```bash
curl -X POST "https://localhost:5001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123!",
    "roles": ["user"]
  }'
```

### 2. Generate Magic Link
```bash
curl -X POST "https://localhost:5001/api/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "redirectUri": "https://myapp.com/auth/callback"
  }'
```

### 3. Configure Azure AD SSO
```bash
curl -X POST "https://localhost:5001/api/sso/configure/azure" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your-azure-client-id",
    "clientSecret": "your-azure-client-secret",
    "tenantId": "your-tenant-id"
  }'
```

## Magic Link Implementation

### Flow Diagram
```
1. User requests magic link → API generates secure token
2. Token stored in database with expiration
3. Email sent with magic link URL
4. User clicks link → Token validated
5. If valid → User authenticated & redirected
```

### Security Features
- **Time-based expiration** (configurable)
- **Single-use tokens** (marked as used after validation)
- **Secure token generation** using cryptographic methods
- **Email verification** before token generation

## SSO Implementation Details

### Azure AD Integration
```csharp
var config = new SSOConfiguration
{
    ProviderName = "Azure AD",
    ProviderType = "oidc",
    AuthorizationUrl = $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize",
    TokenUrl = $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token",
    UserInfoUrl = "https://graph.microsoft.com/v1.0/me"
};
```

### Okta Integration
```csharp
var config = new SSOConfiguration
{
    ProviderName = "Okta",
    ProviderType = "oidc",
    AuthorizationUrl = $"{oktaDomain}/oauth2/default/v1/authorize",
    TokenUrl = $"{oktaDomain}/oauth2/default/v1/token",
    UserInfoUrl = $"{oktaDomain}/oauth2/default/v1/userinfo"
};
```

### Google Integration
```csharp
var config = new SSOConfiguration
{
    ProviderName = "Google",
    ProviderType = "oidc",
    AuthorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth",
    TokenUrl = "https://oauth2.googleapis.com/token",
    UserInfoUrl = "https://openidconnect.googleapis.com/v1/userinfo"
};
```

## Data Migration Process

### Migration Steps
1. **Extract users** from source IDP
2. **Transform user data** to Keycloak format
3. **Create users** in Keycloak realm
4. **Map roles** and attributes
5. **Log migration** status and results

### Migration Logging
All migrations are tracked in the database:
- Source IDP information
- Migration timestamp
- Success/failure status
- Error details (if any)

## Auto-Login Implementation

### Multi-Client SSO
```javascript
// Client-side implementation
const checkAutoLogin = async () => {
    const keycloakConfig = {
        url: 'http://localhost:8080',
        realm: 'your-realm',
        clientId: 'client-app-1'
    };
    
    const keycloak = new Keycloak(keycloakConfig);
    
    try {
        const authenticated = await keycloak.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
        });
        
        if (authenticated) {
            // User is already logged in
            console.log('Auto-login successful');
        }
    } catch (error) {
        console.log('Auto-login failed');
    }
};
```

## Running the Application

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 12+
- Keycloak 20+

### Steps
1. **Clone and setup**:
   ```bash
   cd D:\AMAZONQ\KEYCLOCK\KeycloakAuthApp
   dotnet restore
   ```

2. **Update configuration** in `appsettings.json`

3. **Create database**:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

4. **Run application**:
   ```bash
   dotnet run
   ```

5. **Access Swagger UI**: Navigate to `https://localhost:5001`

## Security Considerations

### JWT Token Validation
- **Issuer validation** against Keycloak realm
- **Audience validation** for client applications
- **Signature verification** using Keycloak public keys
- **Token expiration** enforcement

### Magic Link Security
- **Short expiration times** (15 minutes default)
- **Single-use tokens** to prevent replay attacks
- **Secure token generation** using cryptographic randomness
- **Rate limiting** on magic link requests

### Database Security
- **Connection string encryption** in production
- **Parameterized queries** to prevent SQL injection
- **Audit logging** for sensitive operations
- **Data encryption** for sensitive fields

## Monitoring & Logging

### Application Logs
- Authentication attempts
- Magic link generation/validation
- SSO configuration changes
- Migration operations
- Error tracking

### Metrics
- User registration rates
- Magic link success rates
- SSO login statistics
- Migration success rates

## Troubleshooting

### Common Issues
1. **Keycloak Connection**: Verify Keycloak is running and accessible
2. **Database Connection**: Check PostgreSQL connection string
3. **JWT Validation**: Ensure realm and client configuration match
4. **CORS Issues**: Configure CORS for frontend applications

### Debug Mode
Enable detailed logging in `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "KeycloakAuthApp": "Debug"
    }
  }
}
```

## Production Deployment

### Environment Variables
```bash
export KEYCLOAK__CLIENTSECRET="production-secret"
export CONNECTIONSTRINGS__DEFAULTCONNECTION="production-db-connection"
export ASPNETCORE_ENVIRONMENT="Production"
```

### Docker Deployment
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "KeycloakAuthApp.dll"]
```

This application provides a complete foundation for enterprise-grade authentication and authorization using Keycloak with .NET Core.