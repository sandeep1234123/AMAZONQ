# App3 Active Directory User Information

## Test User Details
- **Username**: testuser
- **Email**: sandeepkumar1464don@gmail.com
- **Password**: Test123!
- **Role**: app3-user

## Keycloak Client Configuration
- **Client ID**: app3-client
- **Client Secret**: gUC1umkBfIVixVZ4iBK5cBDSs8NLGt6q
- **Realm**: sso-realm
- **Auth Server**: http://localhost:8080/

## Authentication Test
1. Access: http://localhost:5103
2. Click "Login with Active Directory"
3. Enter credentials:
   - Username: testuser
   - Password: Test123!
4. Should authenticate via Keycloak → AD → App3

## Expected Flow
- Keycloak redirects to LDAP/AD
- AD validates testuser credentials
- Returns to Keycloak with user info
- Keycloak maps to app3-user role
- User authenticated in App3 with SSO enabled