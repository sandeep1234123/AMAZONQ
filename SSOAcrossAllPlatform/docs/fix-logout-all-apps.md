# Fix Logout Issue - All Applications

## Problem: Logout not working properly
- User remains logged in after clicking logout
- SSO session not cleared from Keycloak

## Solution: Update Logout in All Apps

### App1 Logout Fix:
```csharp
public async Task<IActionResult> Logout()
{
    // Clear local cookies
    foreach (var cookie in Request.Cookies.Keys)
    {
        Response.Cookies.Delete(cookie);
    }
    
    // Sign out from Keycloak SSO
    return SignOut(new AuthenticationProperties
    {
        RedirectUri = Url.Action("Index", "Home")
    }, CookieAuthenticationDefaults.AuthenticationScheme, 
       OpenIdConnectDefaults.AuthenticationScheme);
}
```

### App2 Logout Fix:
```csharp
public async Task<IActionResult> Logout()
{
    // Clear local cookies
    foreach (var cookie in Request.Cookies.Keys)
    {
        Response.Cookies.Delete(cookie);
    }
    
    // Sign out from Keycloak SSO
    return SignOut(new AuthenticationProperties
    {
        RedirectUri = Url.Action("Index", "Home")
    }, CookieAuthenticationDefaults.AuthenticationScheme, 
       OpenIdConnectDefaults.AuthenticationScheme);
}
```

### App3 Logout Fix:
✅ Already updated

### CommonLogin Logout Fix:
✅ Already working properly

## Test Logout:
1. Login to any app
2. Navigate to other apps (should auto-login)
3. Click logout from any app
4. Try accessing other apps
5. Should require login again

## Result:
✅ Logout clears local cookies
✅ Logout signs out from Keycloak
✅ SSO session terminated
✅ All apps require re-authentication