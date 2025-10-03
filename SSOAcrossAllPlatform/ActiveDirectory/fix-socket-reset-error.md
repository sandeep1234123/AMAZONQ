# Fix SocketReset Error - Local LDAP Testing

## Problem
Getting "SocketReset" error because there's no LDAP server running on localhost:10389.

## Quick Fix: Skip LDAP for Local Testing

### Step 1: Remove LDAP Provider
1. Go to User Federation → ldap
2. Click "Delete" to remove the LDAP provider

### Step 2: Create Test Users Directly in Keycloak

1. **Navigate to Users**
   - Left menu → Users → Add user

2. **Create Test Users:**

**User 1: app1-test**
```
Username: app1-test
Email: app1test@ssoplatform.com
First name: App1
Last name: Test
```

**User 2: app2-test**
```
Username: app2-test  
Email: app2test@ssoplatform.com
First name: App2
Last name: Test
```

**User 3: multi-user**
```
Username: multi-user
Email: multiuser@ssoplatform.com
First name: Multi
Last name: User
```

**User 4: manager**
```
Username: manager
Email: manager@ssoplatform.com
First name: Manager
Last name: User
```

**User 5: admin**
```
Username: admin
Email: admin@ssoplatform.com
First name: Admin
Last name: User
```

### Step 3: Set Passwords
For each user:
1. Click on username → Credentials tab
2. Set password: `Test123!`
3. Turn OFF "Temporary" toggle
4. Click "Set password"

### Step 4: Assign Roles
For each user:
1. Click username → Role mapping tab
2. Click "Assign role"
3. Assign appropriate roles:

- **app1-test**: `app1-user`
- **app2-test**: `app2-user`  
- **multi-user**: `multi-user`
- **manager**: `manager`
- **admin**: `admin`

### Step 5: Test Authentication
1. Go to http://localhost:5101
2. Login with: `app1-test` / `Test123!`
3. Should redirect to App1 Dashboard
4. Test other users and applications

## Alternative: Use Docker OpenLDAP (If You Want Real LDAP)

```bash
docker run -d \
  --name test-ldap \
  -p 10389:1389 \
  -e LDAP_ORGANISATION="Test Company" \
  -e LDAP_DOMAIN="example.org" \
  -e LDAP_ADMIN_PASSWORD="admin" \
  osixia/openldap:1.5.0
```

Then update Keycloak LDAP settings:
```
Connection URL: ldap://localhost:10389
Users DN: ou=people,dc=example,dc=org
Bind DN: cn=admin,dc=example,dc=org
Bind Credential: admin
Enable StartTLS: OFF
Use Truststore SPI: Never
```

## Recommended Approach
Use **Step 1-5** (Direct Keycloak users) for local development and testing. This avoids LDAP complexity and focuses on testing the SSO functionality between applications.