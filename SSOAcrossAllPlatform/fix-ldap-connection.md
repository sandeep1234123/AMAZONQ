# Fix LDAP Connection Error

## Problem: SocketReset Error
**Cause**: No Active Directory server running on localhost:389

## Solution Options:

### Option 1: Use Demo LDAP Server (WORKING)
**In Keycloak LDAP Configuration, use:**

```
Connection URL: ldap://ldap.forumsys.com:389
Bind Type: simple
Bind DN: cn=read-only-admin,dc=example,dc=com
Bind Credential: password
Users DN: dc=example,dc=com
Username LDAP Attribute: uid
RDN LDAP Attribute: uid
UUID LDAP Attribute: entryUUID
User Object Classes: inetOrgPerson, organizationalPerson
Edit Mode: READ_ONLY
```

**Test Users Available:**
- Username: `tesla` / Password: `password`
- Username: `einstein` / Password: `password`
- Username: `newton` / Password: `password`

**After saving, click:**
1. **Test Connection** → Should show Success
2. **Test Authentication** → Should show Success
3. **Sync all users** → Should import users

### Option 2: Skip LDAP - Use Local Keycloak Users
1. **Don't configure LDAP**
2. **Create local user in Keycloak:**
   - Users → Add User
   - Username: testuser
   - Email: sandeepkumar1464don@gmail.com
   - Set Password: Test123!
   - Assign app3-user role

### Option 3: Install Local AD (Advanced)
```powershell
# Install AD Domain Services (Windows Server)
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
```

## Recommended: Use Option 2 (Local Keycloak User)

### Steps:
1. **Skip LDAP configuration**
2. **Go to Users → Add User**
3. **Create testuser with Test123! password**
4. **Assign app3-user role**
5. **Test App3 authentication**