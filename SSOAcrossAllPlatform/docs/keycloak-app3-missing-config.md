# Missing Keycloak Configuration for app3-client

## 1. Valid Redirect URIs
**Missing**: `http://localhost:5103/*`
**Add in**: Clients → app3-client → Settings → Valid Redirect URIs

## 2. Web Origins
**Missing**: `http://localhost:5103`
**Add in**: Clients → app3-client → Settings → Web Origins

## 3. Role Mappings
**Missing**: `app3-user` role
**Create**: Realm Roles → Add Role → Name: `app3-user`

## 4. User Assignment
**Missing**: Users with app3-user role
**Create**: Users → Add User → Assign app3-user role

## 5. Client Scopes
**Check**: Default Client Scopes include:
- openid
- profile  
- email
- roles

## Quick Fix Steps:
1. Go to http://localhost:8080/admin
2. Login: admin/admin
3. Select sso-realm
4. Clients → app3-client → Settings
5. Add Valid Redirect URIs: `http://localhost:5103/*`
6. Add Web Origins: `http://localhost:5103`
7. Save
8. Realm Roles → Add Role: `app3-user`
9. Users → Create test user → Assign app3-user role