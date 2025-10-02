# SSO Platform Startup Order

## Application Analysis
- **Keycloak**: Identity Provider (Port 8080/8081/8082)
- **CommonLogin**: SSO Hub (Port 5000) - Central authentication
- **App1**: Business Application (Port 5101) - Requires app1-user/admin roles
- **App2**: Business Application (Port 5102) - Requires app2-user/admin roles  
- **App3**: Business Application (Port 5103) - Requires app3-user/admin roles

## Execution Order

### Option 1: Sequential Startup (Recommended)
```
00-start-all-sequential.bat
```
Runs all steps automatically with proper timing.

### Option 2: Manual Step-by-Step
```
01-start-keycloak.bat          # Start identity provider first
02-start-common-login.bat      # Start SSO hub
03-start-app1.bat             # Start business app 1
04-start-app2.bat             # Start business app 2
05-start-app3.bat             # Start business app 3
```

### Stop All Applications
```
99-stop-all-applications.bat   # Clean shutdown of all services
```

## Why This Order?

1. **Keycloak First**: Identity provider must be running before apps start
2. **CommonLogin Second**: Central SSO hub needs Keycloak available
3. **Apps Last**: Business applications depend on both Keycloak and CommonLogin

## Port Configuration
- **Keycloak**: Auto-detects available port (8080→8081→8082)
- **CommonLogin**: Fixed port 5000
- **App1**: Fixed port 5101
- **App2**: Fixed port 5102
- **App3**: Fixed port 5103

## Testing SSO Flow
1. Start all applications using scripts above
2. Visit any app URL (e.g., http://localhost:5101)
3. Should redirect to CommonLogin → Keycloak → back to app
4. Login once, access all authorized apps without re-login