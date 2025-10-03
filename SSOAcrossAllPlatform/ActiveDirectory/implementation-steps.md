# Active Directory Implementation Steps

## Current Status
When SSO is not active, users see the error: `http://localhost:5103/Home/Index?error=sso_not_active`

## Required Implementation Steps

### 1. Keycloak LDAP Configuration

**Step 1: Access Keycloak Admin Console**
- URL: `http://localhost:8081`
- Login with admin credentials
- Navigate to: `sso-realm` → `User Federation`

**Step 2: Add LDAP Provider**
- Click "Add provider" → Select "ldap"
- Use configuration from `keycloak-ldap-config.json`

**Step 3: Configure Connection**
```
Console Display Name: Active Directory
Vendor: Active Directory
Connection URL: ldap://your-ad-server:389
Users DN: CN=Users,DC=yourdomain,DC=com
Bind DN: CN=service-account,CN=Users,DC=yourdomain,DC=com
Bind Credential: [service-account-password]
```

**Step 4: Test Connection**
- Click "Test connection"
- Click "Test authentication"
- Click "Sync all users"

### 2. Application Code Updates

**Update Index Views to Show AD Login Button**

Add to all application Index.cshtml files when SSO is not active:

```html
@if (!string.IsNullOrEmpty(ViewBag.Error) && ViewBag.Error.Contains("sso_not_active"))
{
    <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i>
        SSO is not currently active. Please use Active Directory login.
    </div>
    
    <div class="text-center">
        <a href="@Url.Action("LoginWithAD")" class="btn btn-primary btn-lg">
            <i class="fas fa-building me-2"></i>Login with Active Directory
        </a>
    </div>
}
```

### 3. Update Program.cs Files

Add IDP hint handling to all applications:

```csharp
options.Events = new OpenIdConnectEvents
{
    OnRedirectToIdentityProvider = context =>
    {
        // Check if AD login is requested
        if (context.HttpContext.Request.Query.ContainsKey("kc_idp_hint"))
        {
            context.ProtocolMessage.SetParameter("kc_idp_hint", 
                context.HttpContext.Request.Query["kc_idp_hint"]);
        }
        return Task.CompletedTask;
    },
    // ... existing events
};
```

### 4. Role Mapping Configuration

**Create AD Groups in Keycloak:**
1. Navigate to: `Groups` in Keycloak admin
2. Create groups matching AD groups:
   - `AD-App1-Users` → Map to `app1-user` role
   - `AD-App2-Users` → Map to `app2-user` role  
   - `AD-App3-Users` → Map to `app3-user` role
   - `AD-Admins` → Map to `admin` role
   - `AD-Managers` → Map to `manager` role

**Configure Group-Role Mapping:**
1. Go to each group → Role Mappings
2. Assign appropriate realm roles

### 5. Testing Procedure

**Test LDAP Integration:**
1. Verify LDAP connection in Keycloak
2. Sync users from Active Directory
3. Check user attributes are mapped correctly

**Test Application Login:**
1. Visit application when SSO is not active
2. Click "Login with Active Directory"
3. Enter AD credentials
4. Verify successful authentication and role assignment

### 6. Error Handling

**Update Controllers to Handle AD Authentication Errors:**

```csharp
public async Task<IActionResult> Index(string? ssoToken, string? error)
{
    // ... existing code ...
    
    if (!string.IsNullOrEmpty(error))
    {
        if (error == "sso_not_active")
        {
            ViewBag.Error = "SSO is not currently active. Please use Active Directory login.";
            ViewBag.ShowADLogin = true;
        }
        else if (error == "ad_auth_failed")
        {
            ViewBag.Error = "Active Directory authentication failed. Please check your credentials.";
            ViewBag.ShowADLogin = true;
        }
    }
    
    return View();
}
```

### 7. Production Considerations

**Security:**
- Use LDAPS (port 636) instead of LDAP (port 389)
- Configure proper SSL certificates
- Use service account with minimal permissions

**Performance:**
- Enable connection pooling
- Configure appropriate timeouts
- Set up user sync scheduling

**Monitoring:**
- Monitor LDAP connection health
- Log authentication attempts
- Set up alerts for failures

## Files Modified

1. **Controllers:** Added `LoginWithAD()` method to all applications
2. **Views:** Need to update Index.cshtml files to show AD login button
3. **Program.cs:** Need to add IDP hint handling
4. **Keycloak:** Configure LDAP user federation

## Next Steps

1. Configure your Active Directory server details
2. Set up LDAP user federation in Keycloak
3. Update application views to show AD login button
4. Test the complete authentication flow