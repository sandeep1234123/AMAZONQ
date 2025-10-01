# App3 Step-by-Step Fix

## Check These Items in Order:

### 1. Keycloak Running?
- Go to: http://localhost:8080
- Should show Keycloak welcome page
- If not: Run `start-keycloak.bat`

### 2. App3 Running?
- Go to: http://localhost:5103
- Should show App3 welcome page
- If not: Run `cd App3 && dotnet run --urls=http://localhost:5103`

### 3. Keycloak Client Exists?
**Check in Keycloak Admin:**
- http://localhost:8080/admin
- Login: admin/admin
- Select: sso-realm
- Go to: Clients
- Find: app3-client
- **If missing**: Create new client with ID `app3-client`

### 4. Client Configuration Correct?
**In app3-client settings:**
```
Valid Redirect URIs: http://localhost:5103/*
Web Origins: http://localhost:5103
Client Authentication: ON
```

### 5. app3-user Role Exists?
**Check in Keycloak:**
- Go to: Realm roles
- Find: app3-user
- **If missing**: Create role named `app3-user`

### 6. Test User Exists?
**Check in Keycloak:**
- Go to: Users
- Find: testuser
- **If missing**: Create user:
  - Username: testuser
  - Password: Test123!
  - Email verified: ON

### 7. User Has Role?
**Check testuser:**
- Click testuser → Role mapping
- Should have: app3-user role assigned
- **If missing**: Assign app3-user role

### 8. App3 Configuration Correct?
**Check App3/appsettings.json:**
```json
{
  "Keycloak": {
    "ClientId": "app3-client",
    "ClientSecret": "gUC1umkBfIVixVZ4iBK5cBDSs8NLGt6q"
  }
}
```

### 9. Test Authentication
1. Go to: http://localhost:5103
2. Click: "Login with Active Directory"
3. Enter: testuser / Test123!
4. Should redirect to App3 dashboard

## Common Errors & Fixes:

**Error: "Invalid client"**
- Fix: Check client ID and secret match

**Error: "Access denied"**
- Fix: Assign app3-user role to testuser

**Error: "Connection refused"**
- Fix: Start Keycloak server

**Error: "User not found"**
- Fix: Create testuser in Keycloak Users