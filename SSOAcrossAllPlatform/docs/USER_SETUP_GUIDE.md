# User Setup Guide - Keycloak SSO Platform

## Realm Structure

### Master Realm
- **Purpose**: Keycloak administration only
- **User**: Admin / Admin_123
- **Access**: Keycloak admin console management

### SSO-Realm  
- **Purpose**: Application authentication
- **Users**: Application users (see below)
- **Access**: CommonLogin, App1, App2, App3

## Required Users in SSO-Realm

### 1. Admin User (Full Access)
```
Username: admin
Password: Admin123!
Email: admin@ssoplatform.com
Roles: admin, app1-user, app2-user, app3-user
Access: All applications + admin functions
```

### 2. Individual App Users
```
Username: app1-test
Password: Test123!
Email: app1test@ssoplatform.com
Roles: app1-user
Access: App1 only

Username: app2-test  
Password: Test123!
Email: app2test@ssoplatform.com
Roles: app2-user
Access: App2 only

Username: app3-test
Password: Test123!
Email: app3test@ssoplatform.com
Roles: app3-user
Access: App3 only
```

### 3. Multi-App User
```
Username: multi-user
Password: Multi123!
Email: multiuser@ssoplatform.com
Roles: app1-user, app2-user
Access: App1 and App2
```

### 4. Manager User
```
Username: manager
Password: Manager123!
Email: manager@ssoplatform.com
Roles: app1-user, app2-user, app3-user
Access: All apps (no admin functions)
```

## Quick Creation Steps

### Step 1: Switch to SSO-Realm
1. Login to Keycloak Admin: http://localhost:8081/admin
2. Use Master credentials: Admin / Admin_123
3. Click realm dropdown (top-left)
4. Select "sso-realm"

### Step 2: Create Each User
For each user above:
1. Users → Add user
2. Fill username, email, enable user
3. Create → Credentials tab
4. Set password (temporary: OFF)
5. Role mapping tab → Assign roles

### Step 3: Verify Setup
- Check Users list shows 5 users
- Verify each user has correct roles
- Test login with each user

## Testing Matrix

| User | App1 | App2 | App3 | Admin |
|------|------|------|------|-------|
| admin | ✓ | ✓ | ✓ | ✓ |
| app1-test | ✓ | ✗ | ✗ | ✗ |
| app2-test | ✗ | ✓ | ✗ | ✗ |
| app3-test | ✗ | ✗ | ✓ | ✗ |
| multi-user | ✓ | ✓ | ✗ | ✗ |
| manager | ✓ | ✓ | ✓ | ✗ |

## Common Issues

**Wrong Realm**: Always verify you're in "sso-realm" when creating application users

**Missing Roles**: Users won't see apps they don't have roles for

**Password Policy**: Ensure passwords meet Keycloak requirements