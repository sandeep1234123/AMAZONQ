# Keycloak Access Guide

## URL: http://localhost:8080

### What You Should See:

#### First Time Access:
1. **Welcome to Keycloak** page
2. **Administration Console** link
3. **Create an admin user** form

#### After Admin Creation:
1. **Keycloak Login** page
2. Username/Password fields
3. **Sign In** button

#### After Login:
1. **Keycloak Admin Console**
2. **Master** realm selected
3. Left sidebar with admin options

### Troubleshooting:

#### If page doesn't load:
```cmd
# Check if Keycloak is running
netstat -an | findstr :8080

# If not running, start it
start-keycloak.bat
```

#### If connection refused:
1. Ensure Keycloak is started
2. Wait 30-60 seconds for full startup
3. Check Windows Firewall
4. Try: http://127.0.0.1:8080

#### If page loads but shows error:
1. Clear browser cache
2. Try incognito/private mode
3. Check console for errors (F12)

### Quick Actions:
- **Create Admin**: admin / Admin_123
- **Login**: Use same credentials
- **Next Step**: Create realm "sso-realm"