# Create Sandeep User in Keycloak (All Apps Access)

## Create User with Access to All Applications

### Step 1: Access Keycloak Admin
- Go to: http://localhost:8080/admin
- Login: admin/admin
- Select: sso-realm

### Step 2: Create User
1. Left menu → **Users**
2. Click **Add user**
3. Fill details:
```
Username: sandeepkumar1464
Email: sandeepkumar1464@gmail.com
First name: Sandeep
Last name: Kumar
Email verified: ON
Enabled: ON
```
4. Click **Create**

### Step 3: Set Password
1. Click **Credentials** tab
2. Click **Set password**
3. Enter:
```
Password: Admin_123
Temporary: OFF
```
4. Click **Save**

### Step 4: Create Required Roles (if not exist)
1. Left menu → **Realm roles**
2. Create these roles:
   - `app1-user`
   - `app2-user` 
   - `app3-user`

### Step 5: Assign All Roles to User
1. Go to **Users** → Click **sandeepkumar1464**
2. Click **Role mapping** tab
3. Click **Assign role**
4. Select ALL roles:
   - ✅ **app1-user**
   - ✅ **app2-user**
   - ✅ **app3-user**
5. Click **Assign**

### Step 6: Test Login
**CommonLogin Portal:**
1. Go to: http://localhost:5000
2. Enter: **sandeepkumar1464**
3. Password: **Admin_123**
4. Should show all 3 applications

**Individual Apps:**
- App1: http://localhost:5101 → Login: sandeepkumar1464/Admin_123
- App2: http://localhost:5102 → Login: sandeepkumar1464/Admin_123  
- App3: http://localhost:5103 → Login: sandeepkumar1464/Admin_123

## Result:
✅ User: sandeepkumar1464/Admin_123
✅ Email: sandeepkumar1464@gmail.com
✅ Roles: app1-user, app2-user, app3-user
✅ Access: All applications via SSO