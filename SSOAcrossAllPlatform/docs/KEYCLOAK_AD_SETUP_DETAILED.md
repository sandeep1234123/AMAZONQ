# Keycloak → AD → App3 Authentication Setup

## Step 1: Configure LDAP User Federation in Keycloak

### 1.1 Access Keycloak Admin Console
- Go to: `http://localhost:8080/admin`
- Login: `admin` / `admin`
- Select realm: `sso-realm`

### 1.2 Create LDAP User Federation
1. Left menu → **User Federation**
2. Click **Add LDAP provider**
3. Configure settings:

**Required Settings:**
```
Console Display Name: Active Directory
Vendor: Active Directory
Connection URL: ldap://localhost:389
Users DN: CN=Users,DC=company,DC=com
Bind Type: simple
Bind DN: CN=Administrator,CN=Users,DC=company,DC=com
Bind Credential: [AD Admin Password]
```

**User Attributes:**
```
Username LDAP Attribute: sAMAccountName
RDN LDAP Attribute: cn
UUID LDAP Attribute: objectGUID
User Object Classes: person, organizationalPerson, user
```

4. Click **Test Connection** → Should show "Success"
5. Click **Test Authentication** → Should show "Success"
6. Click **Save**

### 1.3 Sync Users from AD
1. Scroll down to **Synchronization Settings**
2. Click **Sync all users** → Should import AD users
3. Verify: Go to **Users** → Should see `testuser`

## Step 2: Create app3-user Role

### 2.1 Create Realm Role
1. Left menu → **Realm roles**
2. Click **Create role**
3. Role name: `app3-user`
4. Description: `Application 3 User Access`
5. Click **Save**

## Step 3: Configure Role Mapping

### 3.1 Create LDAP Group Mapper
1. Go to **User Federation** → **Active Directory**
2. Click **Mappers** tab
3. Click **Add mapper**
4. Configure:

```
Name: group-ldap-mapper
Mapper Type: group-ldap-mapper
LDAP Groups DN: CN=Groups,DC=company,DC=com
Group Name LDAP Attribute: cn
Group Object Classes: group
Membership LDAP Attribute: member
Membership Attribute Type: DN
Groups Path: /
```

5. Click **Save**

### 3.2 Assign Role to User
1. Go to **Users** → Find `testuser`
2. Click **Role mapping** tab
3. Click **Assign role**
4. Select `app3-user`
5. Click **Assign**

## Step 4: Configure app3-client

### 4.1 Update Client Settings
1. Go to **Clients** → **app3-client**
2. **Settings** tab:

```
Valid Redirect URIs: http://localhost:5103/*
Web Origins: http://localhost:5103
```

3. **Advanced** tab:
```
Proof Key for Code Exchange Code Challenge Method: S256
```

4. Click **Save**

## Step 5: Test Authentication Flow

### 5.1 Manual Test
1. Access: `http://localhost:5103`
2. Click "Login with Active Directory"
3. Enter credentials:
   - Username: `testuser`
   - Password: `Test123!`

### 5.2 Expected Flow
```
1. Browser → App3: http://localhost:5103
2. App3 → Keycloak: /auth?client_id=app3-client&kc_idp_hint=ldap
3. Keycloak → AD: LDAP bind and search for testuser
4. AD → Keycloak: User authenticated, return attributes
5. Keycloak → App3: /signin-oidc?code=authorization_code
6. App3 → Keycloak: Exchange code for tokens
7. Keycloak → App3: Return JWT tokens with user claims
8. App3: Validate tokens, create session, redirect to dashboard
```

## Step 6: Troubleshooting

### 6.1 Check LDAP Connection
```bash
# Test LDAP connection
ldapsearch -x -H ldap://localhost:389 -D "CN=Administrator,CN=Users,DC=company,DC=com" -w [password] -b "CN=Users,DC=company,DC=com" "(sAMAccountName=testuser)"
```

### 6.2 Keycloak Logs
1. Check Keycloak server logs for LDAP errors
2. Enable debug logging: **Realm Settings** → **Events** → **Admin Events** → ON

### 6.3 Common Issues
- **LDAP Connection Failed**: Check AD server running, credentials correct
- **User Not Found**: Verify Users DN path, username attribute
- **Role Not Assigned**: Check role mapping, group membership
- **Redirect URI Mismatch**: Verify client redirect URIs include App3 URL

## Step 7: Verify Success

### 7.1 Successful Authentication Shows:
- User redirected to App3 Dashboard
- User info displayed with AD attributes
- SSO session active across applications
- Authentication method shows "Keycloak SSO"
- Identity Provider shows "Active Directory"

### 7.2 Test Cross-App SSO
1. After App3 login, access App1: `http://localhost:5101`
2. Should auto-authenticate without login prompt
3. Same for App2: `http://localhost:5102`