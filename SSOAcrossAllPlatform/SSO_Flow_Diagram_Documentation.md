# SSO Platform - Complete Flow Diagram & Documentation

## 1. System Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │ CommonLogin │    │  Keycloak   │    │ App1 / App2 │
│ (Browser)   │    │ Port 5000   │    │ Port 8080   │    │Port 5101/02 │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 2. Complete Authentication Flow

### Phase 1: Initial Login
```
User → CommonLogin → Keycloak → CommonLogin Dashboard
```

**Step-by-Step Process:**

1. **User Access**
   - User navigates to: `http://localhost:5000`
   - Sees login form requesting email/username

2. **Login Initiation**
   - User enters: `sandeepkumar1464@gmail.com`
   - Clicks "Login to SSO"
   - CommonLogin stores username in TempData

3. **Keycloak Redirect**
   - CommonLogin redirects to Keycloak authorization endpoint
   - URL: `http://localhost:8080/realms/sso-realm/protocol/openid-connect/auth`
   - Parameters: client_id, redirect_uri, response_type, scope

4. **Keycloak Authentication**
   - Keycloak displays login form
   - User enters password: `Admin_123`
   - Keycloak validates credentials against user database

5. **Authorization Code Return**
   - Keycloak redirects back to CommonLogin
   - URL: `http://localhost:5000/signin-oidc`
   - Includes authorization code

6. **Token Exchange**
   - CommonLogin exchanges code for tokens
   - Receives: access_token, id_token, refresh_token
   - Stores tokens securely in session

7. **Dashboard Display**
   - CommonLogin shows user dashboard
   - Displays user information and authorized applications

### Phase 2: SSO Token Generation & App Access

```
CommonLogin Dashboard → Generate SSO Token → Redirect to App → Auto-Login
```

**Process Flow:**

1. **Application Selection**
   - User clicks "Launch App" for App1 or App2
   - CommonLogin checks user roles against app requirements

2. **Role Validation**
   ```csharp
   var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
   var requiredRoles = appConfig.GetSection("RequiredRoles").Get<string[]>();
   
   if (requiredRoles.Any(role => userRoles.Contains(role)))
   {
       // User has access
   }
   ```

3. **SSO Token Creation**
   ```csharp
   var tokenData = new
   {
       UserId = User.FindFirst("sub")?.Value,
       Email = User.FindFirst("email")?.Value,
       Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray(),
       Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
       Expiry = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds()
   };
   
   var ssoToken = Convert.ToBase64String(JsonSerializer.SerializeToUtf8Bytes(tokenData));
   ```

4. **App Redirection**
   - CommonLogin redirects to target application
   - URL: `http://localhost:5101?ssoToken={token}` (for App1)
   - URL: `http://localhost:5102?ssoToken={token}` (for App2)

### Phase 3: Application SSO Validation

```
App Receives Token → Validates Token → Auto-Login → Show Dashboard
```

**App-Side Process:**

1. **Token Reception**
   ```csharp
   public IActionResult Index(string ssoToken)
   {
       if (!string.IsNullOrEmpty(ssoToken))
       {
           var userData = ValidateSSOToken(ssoToken);
           if (userData != null && !IsTokenExpired(userData))
           {
               // Auto-login successful
               return RedirectToAction("Dashboard");
           }
       }
       
       // Redirect to CommonLogin for authentication
       return Redirect("http://localhost:5000");
   }
   ```

2. **Token Validation**
   - Decode Base64 token
   - Parse JSON data
   - Verify timestamp and expiry
   - Check user roles against app requirements

3. **Session Creation**
   - Create local session for user
   - Store user information
   - Set authentication cookies

4. **Dashboard Access**
   - Show application-specific dashboard
   - Display user information
   - Provide application functionality

## 3. User Session Information Display

### CommonLogin Dashboard Shows:
```
Session Information:
├── User ID: [Keycloak sub claim]
├── Username: [preferred_username]
├── Email: [email claim]
├── First Name: [given_name]
├── Last Name: [family_name]
├── Roles: [role mappings]
└── Session Started: [current timestamp]

SSO Status:
├── Active Session ✓
├── Single Sign-On active across all applications
└── Keycloak Details:
    ├── Authority: http://localhost:8080/realms/sso-realm
    ├── Client ID: common-login
    ├── Token Issuer: [iss claim]
    ├── Audience: [aud claim]
    └── Auth Time: [auth_time claim]
```

## 4. Logout Process Flow

```
User Clicks Logout → Clear Local Session → Keycloak Logout → Redirect to Login
```

**Logout Steps:**

1. **Logout Initiation**
   - User clicks "Logout" button
   - CommonLogin HomeController.Logout() method called

2. **Local Session Cleanup**
   ```csharp
   // Clear all local cookies
   foreach (var cookie in Request.Cookies.Keys)
   {
       Response.Cookies.Delete(cookie);
   }
   ```

3. **Keycloak Logout**
   ```csharp
   return SignOut(new AuthenticationProperties
   {
       RedirectUri = Url.Action("Index", "Home")
   }, "Cookies", "OpenIdConnect");
   ```

4. **Global Session Termination**
   - Keycloak receives logout request with id_token_hint
   - Keycloak terminates SSO session
   - All application sessions become invalid

5. **Redirect to Login**
   - User redirected back to CommonLogin
   - Must re-authenticate for next access

## 5. Role-Based Access Control Matrix

| User Role | CommonLogin | App1 | App2 | Description |
|-----------|-------------|------|------|-------------|
| admin | ✓ | ✓ | ✓ | Full access to all applications |
| app1-user | ✓ | ✓ | ✗ | Access to App1 only |
| app2-user | ✓ | ✗ | ✓ | Access to App2 only |
| multi-user | ✓ | ✓ | ✓ | Access to App1 and App2 |

## 6. Security Features

### Token Security:
- **Expiry**: 5-minute token lifetime
- **Timestamp Validation**: Prevents replay attacks
- **Role Verification**: Each app validates user roles
- **Secure Transport**: HTTPS in production

### Session Management:
- **HttpOnly Cookies**: Prevent XSS attacks
- **SameSite Policy**: CSRF protection
- **Secure Flag**: HTTPS-only cookies in production
- **Session Timeout**: 8-hour sliding expiration

### Keycloak Integration:
- **OpenID Connect**: Industry standard protocol
- **PKCE**: Proof Key for Code Exchange
- **State Parameter**: CSRF protection
- **Nonce**: Replay attack prevention

## 7. Configuration Details

### Keycloak Setup:
```
Realm: sso-realm
Clients:
├── common-login (Port 5000)
├── app1-client (Port 5101)
└── app2-client (Port 5102)

Users:
└── sandeepkumar1464@gmail.com
    ├── Password: Admin_123
    └── Roles: admin, app1-user, app2-user
```

### Application Ports:
- **Keycloak**: 8080
- **CommonLogin**: 5000
- **App1**: 5101
- **App2**: 5102

## 8. Error Handling

### Authentication Failures:
- Invalid credentials → Redirect to Keycloak login
- Expired tokens → Redirect to CommonLogin
- Missing roles → Access denied message

### Network Issues:
- Keycloak unavailable → Error page with retry
- App unavailable → Service unavailable message
- Token validation failure → Re-authentication required

## 9. Production Considerations

### Security Enhancements:
- Use HTTPS for all communications
- Implement proper JWT signing
- Add rate limiting
- Enable audit logging

### Performance Optimizations:
- Redis for session storage
- Connection pooling
- Token caching
- Load balancing

### Monitoring:
- Application health checks
- Authentication metrics
- Error rate monitoring
- User session tracking

This SSO platform provides seamless single sign-on experience with centralized authentication, role-based access control, and secure session management across multiple applications.