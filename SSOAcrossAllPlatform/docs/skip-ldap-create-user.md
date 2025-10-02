# Skip LDAP - Create Local User in Keycloak

## Step 1: Delete LDAP Configuration
1. Go to Keycloak Admin → User Federation
2. If LDAP provider exists, click **Delete**
3. Confirm deletion

## Step 2: Create Local User
1. Left menu → **Users**
2. Click **Add user**
3. Fill details:
```
Username: testuser
Email: sandeepkumar1464don@gmail.com
First name: Test
Last name: User
Email verified: ON
Enabled: ON
```
4. Click **Create**

## Step 3: Set Password
1. Click **Credentials** tab
2. Click **Set password**
3. Enter:
```
Password: Test123!
Temporary: OFF
```
4. Click **Save**

## Step 4: Assign Role
1. Click **Role mapping** tab
2. Click **Assign role**
3. Select **app3-user**
4. Click **Assign**

## Step 5: Test App3
1. Go to: http://localhost:5103
2. Click "Login with Active Directory"
3. Enter: testuser / Test123!
4. Should authenticate successfully

## Result
✅ No LDAP server needed
✅ User stored in Keycloak database
✅ Same SSO functionality
✅ Works across all applications