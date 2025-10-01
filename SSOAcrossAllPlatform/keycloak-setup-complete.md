# Complete Keycloak SSO Setup Guide

## 1. Keycloak Realm Configuration

### Access Keycloak Admin Console
- URL: http://localhost:8080
- Login: admin / Admin_123

### Create Realm
1. Click "Create Realm"
2. Realm name: `sso-realm`
3. Click "Create"

## 2. Create Clients for Each Application

### Client 1: CommonLogin Portal
1. Go to Clients → Create client
2. Client ID: `common-login`
3. Client type: OpenID Connect
4. Next → Client authentication: ON
5. Valid redirect URIs: `http://localhost:5000/signin-oidc`
6. Valid post logout redirect URIs: `http://localhost:5000/*`
7. Web origins: `http://localhost:5000`
8. Save

### Client 2: Application 1
1. Go to Clients → Create client
2. Client ID: `app1-client`
3. Client type: OpenID Connect
4. Next → Client authentication: ON
5. Valid redirect URIs: `http://localhost:5101/signin-oidc`
6. Valid post logout redirect URIs: `http://localhost:5101/*`
7. Web origins: `http://localhost:5101`
8. Save

### Client 3: Application 2
1. Go to Clients → Create client
2. Client ID: `app2-client`
3. Client type: OpenID Connect
4. Next → Client authentication: ON
5. Valid redirect URIs: `http://localhost:5102/signin-oidc`
6. Valid post logout redirect URIs: `http://localhost:5102/*`
7. Web origins: `http://localhost:5102`
8. Save

## 3. Create Realm Roles
1. Go to Realm roles → Create role
2. Create these roles:
   - `admin`
   - `app1-user`
   - `app2-user`

## 4. Create User
1. Go to Users → Create new user
2. Username: `sandeepkumar1464@gmail.com`
3. Email: `sandeepkumar1464@gmail.com`
4. First name: `Sandeep`
5. Last name: `Kumar`
6. Email verified: ON
7. Save

### Set User Password
1. Go to Credentials tab
2. Set password: `Admin_123`
3. Temporary: OFF
4. Save

### Assign Roles to User
1. Go to Role mapping tab
2. Assign role → Select all roles:
   - admin
   - app1-user
   - app2-user
3. Assign

## 5. Configure Role Mappers for Clients

### For each client (common-login, app1-client, app2-client):
1. Go to Client → Client scopes
2. Click on `{client-name}-dedicated`
3. Go to Mappers tab
4. Add mapper → By configuration
5. Select "User Realm Role"
6. Configure:
   - Name: `roles`
   - Token Claim Name: `roles`
   - Claim JSON Type: `String`
   - Add to ID token: ON
   - Add to access token: ON
   - Add to userinfo: ON
7. Save

## 6. Get Client Secrets
For each client:
1. Go to Clients → Select client
2. Go to Credentials tab
3. Copy the Client secret
4. Update appsettings.json files

## 7. Test Configuration
1. Go to Clients → common-login → Settings tab
2. Scroll down to "Access settings" section
3. Verify all URLs are correct
4. Test by accessing: http://localhost:5000

## 8. Verify Keycloak Endpoints
1. Open browser: http://localhost:8080/realms/sso-realm/.well-known/openid_configuration
2. Verify JSON response shows all endpoints
3. Check authorization_endpoint and token_endpoint are accessible

## 9. Test SSO Flow
1. Start all applications:
   - CommonLogin: http://localhost:5000
   - App1: http://localhost:5101
   - App2: http://localhost:5102
2. Login via CommonLogin
3. Verify automatic access to App1 and App2 without re-authentication