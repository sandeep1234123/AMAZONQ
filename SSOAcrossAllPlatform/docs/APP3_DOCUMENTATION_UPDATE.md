# Application 3 - SSO Platform Documentation Update

## New Application Added: App3

### Overview
Application 3 has been successfully integrated into the SSO platform with full Keycloak authentication support for Active Directory, Google, and Microsoft 365 identity providers.

### Technical Specifications

#### Port Configuration
- **Application 3**: http://localhost:5103
- **Keycloak Client ID**: app3-client
- **Authentication Method**: OpenID Connect
- **Required Roles**: app3-user, admin

#### Active Directory Integration

##### User Creation Commands
```batch
REM Create App3 Users Group
powershell -Command "New-ADGroup -Name 'App3Users' -GroupScope Global -GroupCategory Security -Path 'CN=Groups,DC=company,DC=com' -Description 'Users with access to Application 3'"

REM Create App3 Test User
powershell -Command "New-ADUser -Name 'App3 User' -SamAccountName 'app3user' -UserPrincipalName 'app3user@company.com' -Path 'CN=Users,DC=company,DC=com' -AccountPassword (ConvertTo-SecureString 'App3Pass123!' -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $true"

REM Add user to App3Users group
powershell -Command "Add-ADGroupMember -Identity 'App3Users' -Members 'app3user'"
```

##### LDAP Authentication Flow
1. **User Input**: app3user@company.com / App3Pass123!
2. **LDAP Bind**: CN=keycloak-service,CN=Users,DC=company,DC=com
3. **User Search**: (&(objectClass=person)(sAMAccountName=app3user))
4. **Password Validation**: Against Active Directory
5. **Group Query**: memberOf=CN=App3Users,CN=Groups,DC=company,DC=com
6. **Role Mapping**: App3Users → app3-user role

#### Keycloak Configuration

##### Client Settings
```json
{
  "clientId": "app3-client",
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "redirectUris": ["http://localhost:5103/*"],
  "webOrigins": ["http://localhost:5103"],
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true
}
```

##### LDAP Group Mapper
```json
{
  "name": "app3-group-mapper",
  "providerId": "group-ldap-mapper",
  "config": {
    "groups.dn": "CN=Groups,DC=company,DC=com",
    "group.name.ldap.attribute": "cn",
    "membership.ldap.attribute": "member",
    "groups.ldap.filter": "(cn=App3Users)"
  }
}
```

#### Application Architecture

##### Authentication Flow
```
User → App3:5103 → Silent Auth Check → Keycloak:8080
                                    ↓
                              Active Session?
                                    ↓
                    Yes → Return to App3 (Authenticated)
                                    ↓
                    No → Full Authentication Flow
                                    ↓
                         Keycloak Login Page
                                    ↓
                    IDP Selection (AD/Google/M365)
                                    ↓
                         Identity Provider Auth
                                    ↓
                         Return to Keycloak
                                    ↓
                         Token Generation
                                    ↓
                         Return to App3 (Authenticated)
```

##### Cross-Application SSO
```
App3 (Authenticated) → Click "Go to App1" → App1:5101
                                         ↓
                                   Silent Auth Check
                                         ↓
                                   Keycloak Session Found
                                         ↓
                                   Automatic Authentication
                                         ↓
                                   App1 Dashboard (No Login Required)
```

#### Session Management

##### Cookie Configuration
- **App3 Session**: App3.Auth (localhost:5103)
- **Keycloak Session**: KEYCLOAK_SESSION (localhost:8080)
- **Expiration**: 8 hours with sliding expiration
- **Security**: SameSite=Lax, Secure=SameAsRequest

##### Token Claims
```json
{
  "sub": "user-uuid",
  "preferred_username": "app3user",
  "email": "app3user@company.com",
  "given_name": "App3",
  "family_name": "User",
  "realm_access": {
    "roles": ["app3-user"]
  },
  "groups": ["App3Users"]
}
```

#### Security Features

##### Role-Based Access Control
```csharp
[Authorize(Policy = "App3Access")]
public IActionResult Dashboard()
{
    // Only users with app3-user or admin roles can access
}
```

##### Authorization Policy
```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("App3Access", policy =>
        policy.RequireRole("app3-user", "admin"));
});
```

#### Startup Commands

##### Development Environment
```batch
REM Start Keycloak
start-keycloak.bat

REM Start CommonLogin
cd CommonLogin && dotnet run --urls="http://localhost:5000"

REM Start App1
cd App1 && dotnet run --urls="http://localhost:5101"

REM Start App2  
cd App2 && dotnet run --urls="http://localhost:5102"

REM Start App3
start-app3.bat
```

##### Production Deployment
```bash
export KEYCLOAK_AUTHORITY="https://keycloak.company.com/realms/sso-realm"
export APP3_CLIENT_SECRET="production-app3-secret"
export ASPNETCORE_ENVIRONMENT="Production"
```

#### Testing Scenarios

##### Test User Credentials
- **Username**: app3user@company.com
- **Password**: App3Pass123!
- **Role**: app3-user
- **Access**: Application 3 only

##### SSO Test Flow
1. Login to App3 with AD credentials
2. Navigate to App1 - should auto-authenticate
3. Navigate to App2 - should auto-authenticate  
4. Return to App3 - should remain authenticated
5. Logout from any app - should logout from all

#### Troubleshooting

##### Common Issues
1. **LDAP Connection Failed**
   - Check AD server connectivity
   - Verify service account credentials
   - Confirm LDAP DN paths

2. **Role Mapping Issues**
   - Verify App3Users group exists
   - Check user group membership
   - Confirm Keycloak group mapper

3. **Cross-App SSO Not Working**
   - Check Keycloak session cookies
   - Verify client redirect URIs
   - Confirm same realm usage

##### Debug Commands
```bash
# Test Keycloak connectivity
curl http://localhost:8080/realms/sso-realm/.well-known/openid_configuration

# Check App3 health
curl http://localhost:5103/Home/Index

# Verify LDAP user
ldapsearch -x -H ldap://dc.company.com -D "CN=keycloak-service,CN=Users,DC=company,DC=com" -w "password" -b "CN=Users,DC=company,DC=com" "(sAMAccountName=app3user)"
```

### Integration Summary

Application 3 is now fully integrated with:
- ✅ Keycloak 23.0.7 authentication
- ✅ Active Directory LDAP integration  
- ✅ Google OAuth support
- ✅ Microsoft 365 integration
- ✅ Cross-application SSO
- ✅ Role-based access control
- ✅ Secure session management
- ✅ CommonLogin portal integration

The platform now supports seamless authentication across all three applications with centralized identity management through Keycloak.