# SSO Troubleshooting Analysis - Keycloak on Port 8081

## ✅ Current Status
- **Keycloak**: Running on port 8081
- **CommonLogin**: Working with SSO ✅
- **App1, App2, App3**: SSO not working ❌

## 🔍 Configuration Analysis

### Authority URLs (All Correct for 8081)
- **App1**: `http://localhost:8081/realms/sso-realm` ✅
- **App2**: `http://localhost:8081/realms/sso-realm` ✅  
- **App3**: `http://localhost:8081/realms/sso-realm` ✅
- **CommonLogin**: `http://localhost:8081/realms/sso-realm` ✅

### Client IDs & Secrets
- **App1**: `app1-client` / `TICJTUVDiAoxC4eHQqlLcGco9373TlU4`
- **App2**: `app2-client` / `ge17Xma0sgHJWSzwAP6wRQWci5uMXND6`
- **App3**: `app3-client` / `83l2IemK8nM3liRgXig57Sc8UkY9p0Oy`
- **CommonLogin**: `common-login` / `HQnqI4kSVrlFodtgbk9K0Ahf1VZJhPvM`

## 🚨 Issues Preventing SSO

### 1. Role Configuration Mismatches

**App2 Issues:**
```json
// SSOSettings (restrictive)
"RequiredRoles": ["app2-user", "admin"]

// Applications (permissive) 
"RequiredRoles": ["app2-user", "admin", "manager", "multi-user"]

// Program.cs Policy (restrictive)
policy.RequireRole("app2-user", "admin")
```

**App3 Issues:**
```json
// SSOSettings (missing manager)
"RequiredRoles": ["app3-user", "admin"]

// Applications (has manager, missing multi-user)
"RequiredRoles": ["app3-user", "admin", "manager"]
```

### 2. Missing Keycloak Client Configurations

**Required in Keycloak Admin Console:**

**For app1-client:**
- Valid Redirect URIs: `http://localhost:5101/*`
- Web Origins: `http://localhost:5101`

**For app2-client:**
- Valid Redirect URIs: `http://localhost:5102/*`
- Web Origins: `http://localhost:5102`

**For app3-client:**
- Valid Redirect URIs: `http://localhost:5103/*`
- Web Origins: `http://localhost:5103`

### 3. User Role Assignments

**Required Keycloak Roles:**
- `app1-user`
- `app2-user` 
- `app3-user`
- `admin`
- `manager`
- `multi-user`

**Test Users Need:**
- **sandeepkumar1464**: All roles for testing
- **multiuser**: `multi-user` role (App1 + App2 access)
- **manager**: `manager` role (All apps access)

## 🔧 Fix Steps

### Step 1: Fix App2 Configuration
```json
"SSOSettings": {
  "RequiredRoles": ["app2-user", "admin", "manager", "multi-user"]
}
```

### Step 2: Fix App3 Configuration  
```json
"SSOSettings": {
  "RequiredRoles": ["app3-user", "admin", "manager"]
}
```

### Step 3: Update Authorization Policies

**App2 Program.cs:**
```csharp
policy.RequireRole("app2-user", "admin", "manager", "multi-user")
```

**App3 Program.cs:** Add missing policy:
```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("App3Access", policy =>
        policy.RequireRole("app3-user", "admin", "manager"));
});
```

### Step 4: Verify Keycloak Client Settings
1. Check each client has correct redirect URIs
2. Verify client secrets match appsettings
3. Ensure clients are enabled

### Step 5: Test User Role Assignments
1. Verify user has required roles in Keycloak
2. Check role mappings are active
3. Test with different role combinations

## 🧪 Testing Matrix

| User | Roles | App1 | App2 | App3 | CommonLogin |
|------|-------|------|------|------|-------------|
| sandeepkumar1464 | All | ✅ | ✅ | ✅ | ✅ |
| multiuser | multi-user | ✅ | ✅ | ❌ | ✅ |
| manager | manager | ✅ | ✅ | ✅ | ✅ |
| app1user | app1-user | ✅ | ❌ | ❌ | ✅ |

## 🎯 Root Cause
**CommonLogin works because it has consistent role configurations and proper client setup. Individual apps fail due to:**
1. Inconsistent role validation logic
2. Missing/incorrect Keycloak client configurations  
3. Mismatched authorization policies