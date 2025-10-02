# Create testuser in Keycloak (Fix Login Issue)

## Problem: 
- App3 shows "app3user@company.com" but user doesn't exist
- Need to create actual working user

## Solution: Create testuser in Keycloak

### Step 1: Access Keycloak Admin
- Go to: http://localhost:8080/admin
- Login: admin/admin
- Select: sso-realm

### Step 2: Create User
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

### Step 3: Set Password
1. Click **Credentials** tab
2. Click **Set password**
3. Enter:
```
Password: Test123!
Temporary: OFF
```
4. Click **Save**

### Step 4: Create app3-user Role (if not exists)
1. Left menu → **Realm roles**
2. Click **Create role**
3. Role name: `app3-user`
4. Click **Save**

### Step 5: Assign Role to User
1. Go to **Users** → Click **testuser**
2. Click **Role mapping** tab
3. Click **Assign role**
4. Select **app3-user**
5. Click **Assign**

### Step 6: Test Login
1. Go to: http://localhost:5103
2. Click "Login with Active Directory"
3. Enter: **testuser** / **Test123!**
4. Should login successfully

## Result:
✅ Working user: testuser/Test123!
✅ Correct role: app3-user
✅ Can login to App3