# Fix SocketReset Error - Command Line Setup

## Step 1: Stop and Remove Existing Container (if any)
```bash
docker stop keycloak-ldap
docker rm keycloak-ldap
```

## Step 2: Run OpenLDAP Container with Correct Configuration
```bash
docker run -d \
  --name keycloak-ldap \
  -p 10389:1389 \
  -p 10636:1636 \
  -e LDAP_ORGANISATION="SSO Platform" \
  -e LDAP_DOMAIN="ssoplatform.com" \
  -e LDAP_ADMIN_PASSWORD="admin123" \
  -e LDAP_CONFIG_PASSWORD="config123" \
  -e LDAP_READONLY_USER=false \
  -e LDAP_RFC2307BIS_SCHEMA=false \
  -e LDAP_BACKEND=mdb \
  -e LDAP_TLS=false \
  -e LDAP_TLS_CRT_FILENAME=ldap.crt \
  -e LDAP_TLS_KEY_FILENAME=ldap.key \
  -e LDAP_TLS_DH_PARAM_FILENAME=dhparam.pem \
  -e LDAP_TLS_CA_CRT_FILENAME=ca.crt \
  -e LDAP_TLS_ENFORCE=false \
  -e LDAP_TLS_CIPHER_SUITE=SECURE256:-VERS-SSL3.0 \
  -e LDAP_TLS_VERIFY_CLIENT=demand \
  -e LDAP_REPLICATION=false \
  -e KEEP_EXISTING_CONFIG=false \
  -e LDAP_REMOVE_CONFIG_AFTER_SETUP=true \
  -e LDAP_SSL_HELPER_PREFIX=ldap \
  osixia/openldap:1.5.0
```

## Step 3: Wait and Verify Container
```bash
# Wait 30 seconds for container to fully start
timeout 30

# Check if container is running
docker ps | findstr keycloak-ldap

# Check container logs
docker logs keycloak-ldap
```

## Step 4: Test LDAP Connection
```bash
# Test basic connection
docker exec keycloak-ldap ldapsearch -x -H ldap://localhost:1389 -b "dc=ssoplatform,dc=com" -D "cn=admin,dc=ssoplatform,dc=com" -w admin123
```

## Step 5: Create LDIF File for Test Users
Create file `test-users.ldif` in your current directory:
```ldif
# Create organizational unit for people
dn: ou=people,dc=ssoplatform,dc=com
objectClass: organizationalUnit
ou: people

# User: app1-test
dn: cn=app1-test,ou=people,dc=ssoplatform,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
cn: app1-test
sn: Test
givenName: App1
mail: app1test@ssoplatform.com
userPassword: admin123

# User: admin
dn: cn=admin-user,ou=people,dc=ssoplatform,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
cn: admin-user
sn: User
givenName: Admin
mail: admin@ssoplatform.com
userPassword: admin123
```

## Step 6: Import Users to LDAP
```bash
# Copy LDIF file to container
docker cp test-users.ldif keycloak-ldap:/tmp/

# Import users
docker exec keycloak-ldap ldapadd -x -D "cn=admin,dc=ssoplatform,dc=com" -w admin123 -f /tmp/test-users.ldif
```

## Step 7: Update Keycloak LDAP Configuration

Use these EXACT settings in Keycloak:

**General Options:**
```
UI display name: ldap
Vendor: Other (NOT Active Directory)
```

**Connection and Authentication:**
```
Connection URL: ldap://localhost:10389
Enable StartTLS: OFF
Use Truststore SPI: Never (NOT Always)
Connection pooling: OFF
Bind type: simple
Bind DN: cn=admin,dc=ssoplatform,dc=com
Bind credentials: admin123
```

**LDAP Searching and Updating:**
```
Edit mode: READ_ONLY
Users DN: ou=people,dc=ssoplatform,dc=com
Username LDAP attribute: cn (NOT uid)
RDN LDAP attribute: cn
UUID LDAP attribute: entryUUID (NOT objectGUID)
User object classes: inetOrgPerson, organizationalPerson, person
Search scope: Subtree (NOT One Level)
Pagination: OFF
```

**Synchronization:**
```
Import users: ON
Sync Registrations: OFF (NOT ON)
```

## Step 8: Test Connection in Keycloak
1. Click "Save" in Keycloak
2. Click "Test connection" - should show SUCCESS
3. Click "Test authentication" - should show SUCCESS
4. Click "Sync all users" - should import users

## Step 9: Verify Users Imported
```bash
# Check users in LDAP
docker exec keycloak-ldap ldapsearch -x -H ldap://localhost:1389 -b "ou=people,dc=ssoplatform,dc=com" -D "cn=admin,dc=ssoplatform,dc=com" -w admin123

# In Keycloak Admin Console
# Go to Users menu - should see imported users
```

## Troubleshooting Commands

### Check if Docker is running
```bash
docker --version
docker ps
```

### Check container status
```bash
docker logs keycloak-ldap --tail 50
docker exec keycloak-ldap ps aux
```

### Test LDAP manually
```bash
# Test from outside container
telnet localhost 10389

# Test LDAP search
docker exec keycloak-ldap ldapsearch -x -H ldap://localhost:1389 -b "dc=ssoplatform,dc=com"
```

### Restart container if needed
```bash
docker restart keycloak-ldap
# Wait 30 seconds
docker logs keycloak-ldap
```