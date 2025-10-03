# App1-Client Configuration Checklist

## ✅ Client Exists - Now Check These Settings

### 1. **Valid Redirect URIs**
In Keycloak Admin → Clients → app1-client → Settings:
```
Valid Redirect URIs: http://localhost:5101/*
```
**Must include the wildcard `/*`**

### 2. **Web Origins**
```
Web Origins: http://localhost:5101
```

### 3. **Client Authentication**
```
Client Authentication: ON
```

### 4. **Client Secret**
In Credentials tab:
```
Client Secret: TICJTUVDiAoxC4eHQqlLcGco9373TlU4
```
**Must match exactly with appsettings.json**

### 5. **Standard Flow Enabled**
```
Standard Flow Enabled: ON
Direct Access Grants Enabled: ON
```

### 6. **Root URL**
```
Root URL: http://localhost:5101
```

## 🧪 Test Steps

### Step 1: Test Direct Login
1. Go to: `http://localhost:5101/Home/LoginWithKeycloak`
2. Should redirect to Keycloak login
3. Login with test user
4. Should redirect back to App1

### Step 2: Check Logs
Run App1 and check console for:
- Cookie information
- Claims count
- Authentication errors

### Step 3: Verify User Roles
In Keycloak → Users → [testuser] → Role Mappings:
- Must have one of: `app1-user`, `admin`, `manager`, `multi-user`

## 🔧 Common Issues

**Issue 1: Wrong Redirect URI**
- Missing `/*` wildcard
- HTTP vs HTTPS mismatch
- Port number wrong

**Issue 2: Client Secret Mismatch**
- Regenerated in Keycloak but not updated in app
- Copy/paste error

**Issue 3: User Has No Required Roles**
- User exists but lacks `app1-user`, `admin`, `manager`, or `multi-user` role