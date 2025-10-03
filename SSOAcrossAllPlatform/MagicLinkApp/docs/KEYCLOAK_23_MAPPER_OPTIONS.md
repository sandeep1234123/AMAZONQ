# Keycloak 23.0.7 Mapper Options

## 🔧 Two Ways to Add Mappers

When you go to **Clients → magic-user → Client scopes → magic-user-dedicated → Mappers → Add mapper**, you'll see:

### Option A: Add Predefined Mapper ⚡ (RECOMMENDED)
```
1. Click: Add predefined mapper
2. Select: realm roles
3. Click: Add selected
4. Done! ✅
```

**Benefits:**
- ✅ Pre-configured correctly
- ✅ No manual setup needed
- ✅ Standard Keycloak configuration

### Option B: Configure a New Mapper 🔧
```
1. Click: Configure a new mapper
2. Select: User Realm Role
3. Configure manually:
   - Name: realm-roles
   - Token Claim Name: realm_access.roles
   - Add to ID token: ON
   - Add to access token: ON
   - Multivalued: ON
4. Save
```

**When to use:**
- Custom token claim names
- Specific configuration needs
- Learning purposes

## 🎯 Recommended Approach

**Use Option A (Add predefined mapper)** because:
- Faster setup
- Less chance of errors
- Standard configuration
- Automatically includes all necessary settings

## ✅ Both Options Result In:
```json
JWT Token includes:
{
  "realm_access": {
    "roles": ["magic-user", "app-user"]
  }
}
```

## 🚀 Quick Steps for Magic Link App:
1. **Mappers tab** → **Add mapper**
2. **Add predefined mapper**
3. **Select**: realm roles
4. **Add selected**
5. **Done!** ✅