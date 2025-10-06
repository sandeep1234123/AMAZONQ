# Realm Roles Setup for Magic Link Authentication

## 🎯 Required Realm Roles

### Step 1: Create Realm Roles
1. **Open Keycloak Admin**: http://localhost:8081/admin
2. **Login**: Admin / Admin_123
3. **Switch to**: sso-realm
4. **Navigate**: Realm roles → Create role

**Create these roles**:
```
Role 1:
- Name: magic-user
- Description: Magic Link User Role

Role 2: 
- Name: app-user
- Description: Application User Role
```

### Step 2: Assign Roles to User
1. **Navigate**: Users → magictest
2. **Click**: Role mapping tab
3. **Click**: Assign role
4. **Select and assign**:
   - ✅ magic-user
   - ✅ app-user

### Step 3: Configure Client Role Mapping
1. **Navigate**: Clients → magic-user
2. **Click**: Client scopes tab
3. **Click**: magic-user-dedicated
4. **Click**: Mappers tab
5. **Add mapper**: By configuration → User Realm Role

**Mapper Configuration**:
```
Name: realm-roles
Token Claim Name: realm_access.roles
Claim JSON Type: String
Add to ID token: ON
Add to access token: ON  
Add to userinfo: ON
```

### Step 4: Update Application Code (Optional)
If you want role-based authorization in your app:

```csharp
[Authorize(Roles = "magic-user")]
public IActionResult Dashboard()
{
    // Dashboard code
}
```

## 🔍 Verification

### Check User Roles
1. **Users** → magictest → **Role mapping**
2. **Verify assigned roles**:
   - ✅ magic-user
   - ✅ app-user

### Check Client Scopes
1. **Clients** → magic-user → **Client scopes**
2. **Click**: magic-user-dedicated → **Mappers**
3. **Verify**: realm-roles mapper exists

### Test Token Claims
After authentication, check if roles appear in JWT token:
```json
{
  "realm_access": {
    "roles": ["magic-user", "app-user"]
  }
}
```

## 🚀 Quick Setup
Run: `batch/setup-realm-roles.bat` for guided setup

## ✅ Expected Result
After setup, the magictest user will have:
- ✅ magic-user role
- ✅ app-user role  
- ✅ Roles included in JWT tokens
- ✅ Role-based authorization available in app