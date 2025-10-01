# App3 Complete Setup with Active Directory

## Prerequisites
- Keycloak 23.0.7 installed
- Active Directory server running
- Admin access to both systems

## Setup Steps

### 1. Start Services
```batch
# Run complete setup
setup-app3-complete.bat
```

### 2. Configure Keycloak
```batch
# Configure Keycloak for App3
configure-keycloak-app3.bat
```

### 3. Access Application
- **App3 URL**: http://localhost:5103
- **Keycloak Admin**: http://localhost:8080

## Active Directory Users
- **Username**: app3user@company.com
- **Password**: App3Pass123!
- **Role**: app3-user

- **Username**: app3admin@company.com  
- **Password**: App3Admin123!
- **Role**: admin, app3-user

## Authentication Flow
1. User accesses http://localhost:5103
2. Clicks "Login with Active Directory"
3. Redirected to Keycloak
4. Keycloak authenticates via LDAP
5. User returned to App3 with session
6. Cross-app SSO enabled

## Troubleshooting
- **Keycloak not responding**: Check if running on port 8080
- **AD authentication fails**: Verify LDAP configuration
- **Role issues**: Check group mappings in Keycloak

## Manual Keycloak Configuration
If automated script fails:

1. **Create Client**:
   - Client ID: `app3-client`
   - Client Secret: `app3-client-secret-2025`
   - Valid Redirect URIs: `http://localhost:5103/*`

2. **Create Role**:
   - Name: `app3-user`
   - Description: Application 3 User Role

3. **LDAP Federation**:
   - Connection URL: `ldap://localhost:389`
   - Users DN: `CN=Users,DC=company,DC=com`
   - Bind DN: `CN=keycloak-service,CN=Users,DC=company,DC=com`

4. **Group Mapping**:
   - Map `App3Users` AD group to `app3-user` role