# Local LDAP Testing Setup

## Problem
Getting "UnknownHost" error when testing LDAP connection locally because there's no actual Active Directory server.

## Solution Options

### Option 1: Use Apache Directory Studio (Recommended for Testing)

1. **Download Apache Directory Studio**
   - URL: https://directory.apache.org/studio/
   - Install and run Apache Directory Studio

2. **Create Local LDAP Server**
   - File → New → ApacheDS → ApacheDS Server
   - Server Name: `local-ldap`
   - Port: `10389`

3. **Configure Test Users**
   ```
   Base DN: dc=example,dc=org
   Users DN: ou=users,dc=example,dc=org
   Admin DN: cn=admin,dc=example,dc=org
   Admin Password: admin
   ```

4. **Keycloak Configuration**
   ```
   Connection URL: ldap://localhost:10389
   Users DN: ou=users,dc=example,dc=org
   Bind DN: cn=admin,dc=example,dc=org
   Bind Credential: admin
   Vendor: Other
   Username LDAP attribute: uid
   ```

### Option 2: Use Docker OpenLDAP (Quick Setup)

1. **Run OpenLDAP Container**
   ```bash
   docker run -d \
     --name openldap \
     -p 389:1389 \
     -p 636:1636 \
     -e LDAP_ORGANISATION="Test Company" \
     -e LDAP_DOMAIN="example.org" \
     -e LDAP_ADMIN_PASSWORD="admin" \
     osixia/openldap:1.5.0
   ```

2. **Keycloak Configuration**
   ```
   Connection URL: ldap://localhost:389
   Users DN: ou=people,dc=example,dc=org
   Bind DN: cn=admin,dc=example,dc=org
   Bind Credential: admin
   ```

### Option 3: Skip LDAP for Local Testing

1. **Create Test Users Directly in Keycloak**
   - Navigate to: Users → Add user
   - Create users with appropriate roles

2. **Test Users to Create**
   ```
   Username: testuser1
   Email: testuser1@company.com
   Roles: app1-user
   
   Username: testuser2  
   Email: testuser2@company.com
   Roles: app2-user
   
   Username: testadmin
   Email: admin@company.com
   Roles: admin
   ```

3. **Set Passwords**
   - Go to each user → Credentials tab
   - Set password and disable "Temporary"

## Recommended Approach for Development

### Use Option 3 (Direct Keycloak Users)

This is the simplest approach for testing the SSO functionality:

1. **Create Test Users in Keycloak**
2. **Test Application Authentication**
3. **Verify Role-Based Access**
4. **Test Cross-Application SSO**

### When to Use Real LDAP

- **Production deployment**
- **Integration testing with actual AD**
- **Testing LDAP-specific features**

## Testing the Fix

1. **Remove LDAP Provider** (if created)
   - User Federation → ldap → Delete

2. **Create Direct Users**
   - Users → Add user
   - Set username, email, roles
   - Set password in Credentials tab

3. **Test Authentication**
   - Try logging into applications
   - Verify SSO works across apps
   - Check role-based access

## Error Resolution

### "UnknownHost" Error
- **Cause:** No LDAP server at specified hostname
- **Solution:** Use one of the options above

### "Connection Refused" Error  
- **Cause:** LDAP server not running on specified port
- **Solution:** Check server status or use different port

### "Authentication Failed" Error
- **Cause:** Wrong bind credentials
- **Solution:** Verify admin username/password

## Next Steps

1. Choose testing approach (recommend Option 3 for development)
2. Create test users with appropriate roles
3. Test application authentication flow
4. Verify SSO functionality works
5. Plan production LDAP integration later