# Application 3 Setup Guide

## Overview
Application 3 is integrated with the SSO platform using Keycloak 23.0.7 for authentication across Active Directory, Google, and Microsoft 365.

## Port Configuration
- **Application 3**: http://localhost:5103
- **Keycloak Client**: app3-client
- **Required Role**: app3-user or admin

## Active Directory Setup

### 1. Create AD Users and Groups
Run the batch script:
```bash
create-ad-users-app3.bat
```

This creates:
- **Group**: App3Users
- **User**: app3user@company.com (Password: App3Pass123!)
- **Admin**: app3admin@company.com (Password: App3Admin123!)

### 2. Manual AD User Creation
```powershell
# Create user
New-ADUser -Name "John Smith" -SamAccountName "jsmith" -UserPrincipalName "jsmith@company.com" -Path "CN=Users,DC=company,DC=com" -AccountPassword (ConvertTo-SecureString "Password123!" -AsPlainText -Force) -Enabled $true

# Add to App3 group
Add-ADGroupMember -Identity "App3Users" -Members "jsmith"
```

## Keycloak Configuration

### 1. Create App3 Client
- Client ID: `app3-client`
- Valid Redirect URIs: `http://localhost:5103/*`
- Web Origins: `http://localhost:5103`
- Client Secret: Generate and update in appsettings.json

### 2. Create app3-user Role
- Realm Roles → Add Role → `app3-user`

### 3. LDAP Group Mapping
- User Federation → LDAP → Mappers → Create
- Mapper Type: `group-ldap-mapper`
- LDAP Groups DN: `CN=Groups,DC=company,DC=com`
- Group Name LDAP Attribute: `cn`
- Group Object Classes: `group`

### 4. Role Mapping
- Client Roles → app3-client → Add role mapping
- Map AD group `App3Users` to role `app3-user`

## Application Startup

### 1. Start Applications
```bash
# Start Keycloak
start-keycloak.bat

# Start CommonLogin
cd CommonLogin && dotnet run --urls="http://localhost:5000"

# Start App3
start-app3.bat
```

### 2. Test Authentication
1. Access: http://localhost:5103
2. Login with: app3user@company.com / App3Pass123!
3. Verify SSO works across all applications

## SSO Flow for App3
1. User → http://localhost:5103
2. Silent auth check → Keycloak
3. If no session → Full authentication
4. LDAP validation → Active Directory
5. Group mapping → app3-user role
6. Return to App3 → Authenticated

## Cross-Application Navigation
- From App3 → App1/App2: Seamless SSO
- From CommonLogin → App3: Role-based access
- Session sharing via Keycloak cookies

## Troubleshooting
- Check Keycloak logs for LDAP connection
- Verify AD group membership
- Confirm client secret in appsettings.json
- Test with local user if LDAP fails