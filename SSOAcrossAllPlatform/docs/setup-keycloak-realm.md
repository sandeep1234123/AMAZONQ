# Quick Keycloak Setup for SSO

## 1. Access Keycloak Admin Console
- URL: http://localhost:8080
- Username: admin
- Password: Admin_123

## 2. Create Realm
1. Click "Create Realm"
2. Realm name: `sso-realm`
3. Click "Create"

## 3. Create Clients (Do this for each client)

### CommonLogin Client
1. Go to Clients → Create client
2. Client ID: `common-login`
3. Client type: OpenID Connect
4. Next → Client authentication: ON
5. Standard flow: ON, Direct access grants: ON
6. Save
7. Settings tab:
   - Valid redirect URIs: `http://localhost:5000/*`
   - Web origins: `http://localhost:5000`
8. Credentials tab: Copy the Client Secret

### App1 Client
- Client ID: `app1-client`
- Valid redirect URIs: `http://localhost:5001/*`
- Web origins: `http://localhost:5001`

### App2 Client
- Client ID: `app2-client`
- Valid redirect URIs: `http://localhost:5002/*`
- Web origins: `http://localhost:5002`

## 4. Create Test User
1. Go to Users → Create new user
2. Username: `sandeepkumar1464@gmail.com`
3. Email: `sandeepkumar1464@gmail.com`
4. Email verified: ON
5. Create
6. Credentials tab → Set password: `Admin_123` (Temporary: OFF)

## 5. Update Client Secrets in Apps
Copy the client secrets from Keycloak to your appsettings.json files.