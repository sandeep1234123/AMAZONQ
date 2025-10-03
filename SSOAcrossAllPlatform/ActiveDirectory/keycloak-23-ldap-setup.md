# Keycloak 23.0.7 LDAP Setup with Docker OpenLDAP

## Step 1: Setup OpenLDAP Server with Docker

### Run OpenLDAP Container
```bash
docker run -d \
  --name keycloak-ldap \
  -p 10389:1389 \
  -p 10636:1636 \
  -e LDAP_ORGANISATION="SSO Platform" \
  -e LDAP_DOMAIN="ssoplatform.com" \
  -e LDAP_ADMIN_PASSWORD="admin123" \
  -e LDAP_CONFIG_PASSWORD="config123" \
  -e LDAP_READONLY_USER=true \
  -e LDAP_READONLY_USER_USERNAME="readonly" \
  -e LDAP_READONLY_USER_PASSWORD="readonly123" \
  osixia/openldap:1.5.0
```

### Verify Container is Running
```bash
docker ps | grep keycloak-ldap
docker logs keycloak-ldap
```

## Step 2: Configure LDAP in Keycloak 23.0.7

### Navigate to User Federation
1. Login to Keycloak Admin Console: `http://localhost:8081`
2. Select realm: `sso-realm`
3. Left menu → `User Federation`
4. Click `Add Ldap providers` dropdown
5. Select `ldap`

### LDAP Configuration Settings

**General Options:**
```
Console display name: SSO Platform LDAP
Priority: 0
```

**Connection and Authentication Settings:**
```
Connection URL: ldap://localhost:10389
Enable StartTLS: OFF
Use Truststore SPI: Never
Connection pooling: ON
Connection timeout: 10000
Bind type: simple
Bind DN: cn=admin,dc=ssoplatform,dc=com
Bind credentials: admin123
```

**LDAP Searching and Updating:**
```
Edit mode: READ_ONLY
Users DN: ou=people,dc=ssoplatform,dc=com
Username LDAP attribute: uid
RDN LDAP attribute: uid
UUID LDAP attribute: entryUUID
User object classes: inetOrgPerson, organizationalPerson
Search scope: Subtree
Read timeout: 10000
Pagination: ON
```

**Synchronization Settings:**
```
Import users: ON
Sync Registrations: OFF
Batch size: 1000
Periodic full sync: OFF
Periodic changed users sync: OFF
```

**Cache Settings:**
```
Cache policy: DEFAULT
```

**Advanced Settings:**
```
Enable LDAPv3 password modify: OFF
Validate password policy: OFF
Trust Email: OFF
```

### Click "Save"

## Step 3: Test Connection

1. After saving, scroll down to find action buttons
2. Click `Test connection` - should show "Success"
3. Click `Test authentication` - should show "Success"

## Step 4: Add Test Users to LDAP

### Install LDAP Utils (if needed)
```bash
# Windows (using Chocolatey)
choco install ldap-utils

# Or use Docker to run ldap commands
docker exec -it keycloak-ldap bash
```

### Create Test Users LDIF File
Create file `test-users.ldif`:
```ldif
# Create organizational unit for people
dn: ou=people,dc=ssoplatform,dc=com
objectClass: organizationalUnit
ou: people

# Create organizational unit for groups
dn: ou=groups,dc=ssoplatform,dc=com
objectClass: organizationalUnit
ou: groups

# User: app1-test
dn: uid=app1-test,ou=people,dc=ssoplatform,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
uid: app1-test
cn: App1 Test
sn: Test
givenName: App1
mail: app1test@ssoplatform.com
userPassword: Test123!

# User: app2-test
dn: uid=app2-test,ou=people,dc=ssoplatform,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
uid: app2-test
cn: App2 Test
sn: Test
givenName: App2
mail: app2test@ssoplatform.com
userPassword: Test123!

# User: multi-user
dn: uid=multi-user,ou=people,dc=ssoplatform,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
uid: multi-user
cn: Multi User
sn: User
givenName: Multi
mail: multiuser@ssoplatform.com
userPassword: Test123!

# User: manager
dn: uid=manager,ou=people,dc=ssoplatform,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
uid: manager
cn: Manager User
sn: User
givenName: Manager
mail: manager@ssoplatform.com
userPassword: Test123!

# User: admin
dn: uid=admin,ou=people,dc=ssoplatform,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
uid: admin
cn: Admin User
sn: User
givenName: Admin
mail: admin@ssoplatform.com
userPassword: Test123!

# Groups
dn: cn=app1-users,ou=groups,dc=ssoplatform,dc=com
objectClass: groupOfNames
cn: app1-users
member: uid=app1-test,ou=people,dc=ssoplatform,dc=com

dn: cn=app2-users,ou=groups,dc=ssoplatform,dc=com
objectClass: groupOfNames
cn: app2-users
member: uid=app2-test,ou=people,dc=ssoplatform,dc=com

dn: cn=multi-users,ou=groups,dc=ssoplatform,dc=com
objectClass: groupOfNames
cn: multi-users
member: uid=multi-user,ou=people,dc=ssoplatform,dc=com

dn: cn=managers,ou=groups,dc=ssoplatform,dc=com
objectClass: groupOfNames
cn: managers
member: uid=manager,ou=people,dc=ssoplatform,dc=com

dn: cn=admins,ou=groups,dc=ssoplatform,dc=com
objectClass: groupOfNames
cn: admins
member: uid=admin,ou=people,dc=ssoplatform,dc=com
```

### Import Users to LDAP
```bash
# Using Docker
docker cp test-users.ldif keycloak-ldap:/tmp/
docker exec keycloak-ldap ldapadd -x -D "cn=admin,dc=ssoplatform,dc=com" -w admin123 -f /tmp/test-users.ldif

# Or directly
ldapadd -x -H ldap://localhost:10389 -D "cn=admin,dc=ssoplatform,dc=com" -w admin123 -f test-users.ldif
```

## Step 5: Sync Users in Keycloak

1. Go to User Federation → ldap
2. Click `Sync all users` button
3. Should show "X users imported"
4. Go to Users menu to verify users are imported

## Step 6: Configure Attribute Mappers

### Navigate to Mappers
1. User Federation → ldap → Mappers tab
2. Default mappers should already exist, verify:

**Email Mapper:**
- Name: email
- Mapper type: user-attribute-ldap-mapper
- LDAP attribute: mail
- User model attribute: email

**First Name Mapper:**
- Name: first name  
- Mapper type: user-attribute-ldap-mapper
- LDAP attribute: givenName
- User model attribute: firstName

**Last Name Mapper:**
- Name: last name
- Mapper type: user-attribute-ldap-mapper
- LDAP attribute: sn
- User model attribute: lastName

## Step 7: Configure Group Mappings

### Add Group Mapper
1. User Federation → ldap → Mappers tab
2. Click `Add mapper`
3. Configure:
```
Name: group-mapper
Mapper type: group-ldap-mapper
LDAP Groups DN: ou=groups,dc=ssoplatform,dc=com
Group Name LDAP Attribute: cn
Group Object Classes: groupOfNames
Preserve Group Inheritance: ON
Membership LDAP Attribute: member
Membership Attribute Type: DN
User Groups Retrieve Strategy: LOAD_GROUPS_BY_MEMBER_ATTRIBUTE
```
4. Click Save

### Create Keycloak Groups and Role Mappings
1. Navigate to Groups (left menu)
2. Create groups and assign roles:

**Group: app1-users**
- Role mapping: app1-user

**Group: app2-users** 
- Role mapping: app2-user

**Group: multi-users**
- Role mapping: multi-user

**Group: managers**
- Role mapping: manager

**Group: admins**
- Role mapping: admin

## Step 8: Test Authentication

1. Go to `http://localhost:5101`
2. Should attempt silent SSO first
3. If fails, click "Login with Active Directory"
4. Login with: `app1-test` / `Test123!`
5. Should authenticate and redirect to Dashboard

## Troubleshooting

### Check LDAP Server
```bash
docker logs keycloak-ldap
ldapsearch -x -H ldap://localhost:10389 -D "cn=admin,dc=ssoplatform,dc=com" -w admin123 -b "dc=ssoplatform,dc=com"
```

### Check Keycloak Logs
- Enable debug logging for `org.keycloak.storage.ldap`
- Check server logs for LDAP connection issues

### Verify User Import
- Go to Users in Keycloak admin
- Check if LDAP users are visible
- Verify user attributes are populated