# Easy Active Directory Testing Setup

## Simple 3-Step Setup

### Step 1: Run OpenLDAP Container
```bash
docker run -d --name test-ad -p 10389:1389 -e LDAP_ORGANISATION="Test Company" -e LDAP_DOMAIN="test.local" -e LDAP_ADMIN_PASSWORD="admin" osixia/openldap:1.5.0
```

### Step 2: Configure Keycloak LDAP
**User Federation → Add Ldap providers → ldap**

```
UI display name: test-ad
Vendor: Other
Connection URL: ldap://localhost:10389
Enable StartTLS: OFF
Use Truststore SPI: Never
Bind DN: cn=admin,dc=test,dc=local
Bind credentials: admin
Users DN: ou=people,dc=test,dc=local
Username LDAP attribute: uid
RDN LDAP attribute: uid
UUID LDAP attribute: entryUUID
User object classes: inetOrgPerson, organizationalPerson, person
Search scope: Subtree
Import users: ON
Sync Registrations: OFF
```

### Step 3: Add Test Users via Docker
```bash
# Create users file
echo 'dn: ou=people,dc=test,dc=local
objectClass: organizationalUnit
ou: people

dn: uid=testuser,ou=people,dc=test,dc=local
objectClass: inetOrgPerson
uid: testuser
cn: Test User
sn: User
givenName: Test
mail: test@test.local
userPassword: password' > users.ldif

# Import users
docker cp users.ldif test-ad:/tmp/
docker exec test-ad ldapadd -x -D "cn=admin,dc=test,dc=local" -w admin -f /tmp/users.ldif
```

### Step 4: Test in Keycloak
1. Click "Test connection" - should work
2. Click "Sync all users" - imports testuser
3. Go to Users → testuser → Credentials → Set password: `password`
4. Assign role: `app1-user`

### Step 5: Test Login
- Go to http://localhost:5101
- Login with: `testuser` / `password`
- Should authenticate successfully

## Alternative: Skip LDAP Completely

**Just create users directly in Keycloak:**
1. Users → Add user
2. Set username: `testuser`
3. Credentials → Set password: `password`
4. Role mapping → Assign: `app1-user`
5. Test login immediately

**This is the fastest way for testing.**