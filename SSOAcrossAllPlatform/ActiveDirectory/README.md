# Active Directory Integration with Keycloak 23.0.7

## Overview
When SSO is not active, users should be able to login using Active Directory credentials through Keycloak's LDAP integration.

**Keycloak Version:** 23.0.7
**Compatibility:** This guide is specifically tested with Keycloak 23.0.7

## Keycloak Configuration Steps

### 1. Add LDAP User Federation (Keycloak 23.0.7)

1. **Login to Keycloak Admin Console**
   - URL: `http://localhost:8081`
   - Navigate to: `Realms` → `sso-realm` → `User Federation`

2. **Add LDAP Provider**
   - Click "Add Ldap providers" button
   - Select "ldap" from the dropdown
   - Configure the following settings:

### 2. LDAP Connection Settings

**For Local Testing (No Real AD Server):**
```
Console Display Name: Local Test LDAP
Priority: 0
Import Users: ON
Edit Mode: READ_ONLY
Sync Registrations: OFF
Vendor: Other
Username LDAP attribute: uid
RDN LDAP attribute: uid
UUID LDAP attribute: entryUUID
User Object Classes: inetOrgPerson, organizationalPerson
Connection URL: ldap://localhost:10389
Users DN: ou=users,dc=example,dc=org
Bind Type: simple
Bind DN: cn=admin,dc=example,dc=org
Bind Credential: admin
```

**For Production Active Directory:**
```
Console Display Name: Active Directory
Priority: 0
Import Users: ON
Edit Mode: READ_ONLY
Sync Registrations: OFF
Vendor: Active Directory
Username LDAP attribute: sAMAccountName
RDN LDAP attribute: cn
UUID LDAP attribute: objectGUID
User Object Classes: person, organizationalPerson, user
Connection URL: ldap://your-ad-server:389
Users DN: CN=Users,DC=yourdomain,DC=com
Bind Type: simple
Bind DN: CN=service-account,CN=Users,DC=yourdomain,DC=com
Bind Credential: your-service-account-password
```

### 3. LDAP Attribute Mappings (Keycloak 23.0.7)

After saving the LDAP provider, configure attribute mappings:

1. **Navigate to Mappers Tab**
   - Go to User Federation → ldap → Mappers tab
   - Click "Add mapper" for each mapping

2. **Email Mapping**
   - Mapper type: user-attribute-ldap-mapper
   - Name: email
   - LDAP Attribute: mail
   - User Model Attribute: email
   - Read Only: ON

3. **First Name Mapping**
   - Mapper type: user-attribute-ldap-mapper
   - Name: first name
   - LDAP Attribute: givenName
   - User Model Attribute: firstName
   - Read Only: ON

4. **Last Name Mapping**
   - Mapper type: user-attribute-ldap-mapper
   - Name: last name
   - LDAP Attribute: sn
   - User Model Attribute: lastName
   - Read Only: ON

### 4. Role Mappings (Keycloak 23.0.7)

1. **Create Group-LDAP Mapper**
   - Go to User Federation → ldap → Mappers tab
   - Click "Add mapper"
   - Mapper type: group-ldap-mapper
   - Name: group-mapper
   - LDAP Groups DN: CN=Groups,DC=yourdomain,DC=com
   - Group Name LDAP Attribute: cn
   - Group Object Classes: group
   - Preserve Group Inheritance: ON
   - Drop non-existing groups during sync: OFF

2. **Map AD Groups to Keycloak Roles**
   - Navigate to Groups in left menu
   - Create groups that match AD groups
   - For each group: Groups → [group-name] → Role mapping
   - Assign appropriate realm roles to each group

## Application Code Changes

### 1. Update Program.cs for AD Authentication

Add IDP hint parameter for Active Directory authentication:

```csharp
// In all applications Program.cs
options.Events = new OpenIdConnectEvents
{
    OnRedirectToIdentityProvider = context =>
    {
        // Check if AD login is requested
        if (context.HttpContext.Request.Query.ContainsKey("idp"))
        {
            context.ProtocolMessage.SetParameter("kc_idp_hint", "ldap");
        }
        return Task.CompletedTask;
    },
    // ... existing events
};
```

### 2. Update Controllers for AD Login

Add AD login methods to all application controllers:

```csharp
public IActionResult LoginWithAD()
{
    return Challenge(new AuthenticationProperties
    {
        RedirectUri = Url.Action("Dashboard"),
        Parameters = 
        {
            { "kc_idp_hint", "ldap" },
            { "prompt", "login" }
        }
    }, OpenIdConnectDefaults.AuthenticationScheme);
}
```

### 3. Update Views for AD Login Button

Add Active Directory login button to Index views:

```html
<div class="text-center mt-3">
    <a href="@Url.Action("LoginWithAD")" class="btn btn-primary">
        <i class="fas fa-building me-2"></i>Login with Active Directory
    </a>
</div>
```

## Testing Steps

1. **Test LDAP Connection**
   - In Keycloak Admin Console, go to User Federation → ldap
   - Click "Test connection" and "Test authentication"

2. **Sync Users**
   - Click "Sync all users" to import AD users

3. **Test Authentication**
   - Try logging in with AD credentials
   - Verify user attributes are mapped correctly
   - Check role assignments

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check LDAP server connectivity
   - Verify bind credentials
   - Check firewall settings

2. **Authentication Failed**
   - Verify user DN structure
   - Check username attribute mapping
   - Ensure user exists in specified DN

3. **Missing Roles**
   - Check group mappings
   - Verify role assignments in Keycloak
   - Ensure group-to-role mapping is configured

### Debug Steps

1. **Enable LDAP Debug Logging (Keycloak 23.0.7)**
   - In Keycloak Admin Console: Realm Settings → Logging
   - Add logger: `org.keycloak.storage.ldap`
   - Set level to DEBUG
   - Or use Events → Config → Enable "Login" events

2. **Check Application Logs**
   - Monitor application logs for authentication events
   - Look for claim processing issues

3. **Verify Token Claims**
   - Use JWT decoder to inspect tokens
   - Check if AD attributes are included

## Security Considerations

1. **Service Account**
   - Use dedicated service account with minimal permissions
   - Regularly rotate service account password

2. **LDAP Connection**
   - Use LDAPS (secure LDAP) in production
   - Configure proper certificate validation

3. **User Permissions**
   - Map AD groups to appropriate application roles
   - Follow principle of least privilege

## Production Deployment

1. **LDAPS Configuration**
   ```
   Connection URL: ldaps://your-ad-server:636
   Use Truststore SPI: Only for ldaps
   Connection Pooling: ON
   ```

2. **Performance Tuning**
   ```
   Connection Timeout: 10000
   Read Timeout: 10000
   Pagination: ON
   ```

3. **Monitoring**
   - Monitor LDAP connection health
   - Set up alerts for authentication failures
   - Track user sync status