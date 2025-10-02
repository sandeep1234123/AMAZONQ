# Create Local Keycloak User (No LDAP Required)

## Step 1: Create User in Keycloak
1. Go to: `http://localhost:8080/admin`
2. Login: admin/admin
3. Select realm: `sso-realm`
4. Left menu → **Users**
5. Click **Add user**

## Step 2: User Configuration
```
Username: testuser
Email: sandeepkumar1464don@gmail.com
First name: Test
Last name: User
Email verified: ON
Enabled: ON
```
6. Click **Create**

## Step 3: Set Password
1. Click **Credentials** tab
2. Click **Set password**
3. Password: `Test123!`
4. Temporary: **OFF**
5. Click **Save**

## Step 4: Assign Role
1. Click **Role mapping** tab
2. Click **Assign role**
3. Select **app3-user**
4. Click **Assign**

## Step 5: Test Authentication
1. Access: `http://localhost:5103`
2. Click "Login with Active Directory"
3. Enter: testuser / Test123!
4. Should authenticate successfully

## Result
- No LDAP/AD server required
- User stored directly in Keycloak
- Same SSO functionality
- Works across all applications