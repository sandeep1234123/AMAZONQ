# Client Scopes Configuration - magic-user-dedicated

## 🎯 Purpose
The **magic-user-dedicated** client scope controls what user information gets included in JWT tokens for your Magic Link app.

## 📋 What You'll Do in magic-user-dedicated

### Step 1: Access Client Scope
```
Path: sso-realm → Clients → magic-user → Client scopes → magic-user-dedicated
```

### Step 2: Add Role Mapper
1. **Click**: Mappers tab
2. **Click**: Add mapper
3. **Choose one option**:

**Option A: Add predefined mapper**
- Select: realm roles
- Click: Add selected

**Option B: Configure a new mapper**
- Click: Configure a new mapper
- Select: User Realm Role

### Step 3: Configure Role Mapper

**If you chose Option A (predefined mapper)**:
- The realm roles mapper is automatically configured
- No additional configuration needed

**If you chose Option B (configure new mapper)**:
```
Mapper Configuration:
- Name: realm-roles
- Mapper Type: User Realm Role
- Token Claim Name: realm_access.roles
- Claim JSON Type: String
- Add to ID token: ON
- Add to access token: ON
- Add to userinfo: ON
- Multivalued: ON
```

## 🔍 What This Does

### Before Configuration:
JWT token contains basic user info:
```json
{
  "sub": "user-id",
  "email": "sandeepkumar1464@gmail.com",
  "preferred_username": "magictest"
}
```

### After Configuration:
JWT token includes user roles:
```json
{
  "sub": "user-id", 
  "email": "sandeepkumar1464@gmail.com",
  "preferred_username": "magictest",
  "realm_access": {
    "roles": ["magic-user", "app-user"]
  }
}
```

## 🔧 Additional Mappers You Can Add

### User Attributes Mapper
```
Name: user-attributes
Mapper Type: User Attribute
User Attribute: department
Token Claim Name: department
Add to ID token: ON
```

### Group Membership Mapper
```
Name: groups
Mapper Type: Group Membership  
Token Claim Name: groups
Add to ID token: ON
Full group path: OFF
```

### Audience Mapper
```
Name: audience
Mapper Type: Audience
Included Client Audience: magic-user
Add to ID token: ON
Add to access token: ON
```

## ✅ Verification

### Check Mapper Exists
1. **Go to**: Clients → magic-user → Client scopes → magic-user-dedicated → Mappers
2. **Verify**: realm-roles mapper is listed

### Test Token Content
After authentication, your app will receive JWT tokens with roles:
```csharp
// In your Dashboard action
var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
// Should contain: ["magic-user", "app-user"]
```

## 🚀 Result
- ✅ User roles included in JWT tokens
- ✅ Role-based authorization available in app
- ✅ Dashboard shows user roles
- ✅ Can use `[Authorize(Roles = "magic-user")]` attributes