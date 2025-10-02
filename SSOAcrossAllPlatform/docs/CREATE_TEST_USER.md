# Create Test User in Keycloak

## User Details
- **Username**: `sandeepkumar1464@gmail.com`
- **Password**: `Admin_123`
- **Email**: `sandeepkumar1464@gmail.com`
- **Roles**: `admin`, `app1-user`, `app2-user`

## Step-by-Step Instructions

### Step 1: Access Keycloak Admin
1. **Start Keycloak**: `start-keycloak.bat`
2. **Open**: http://localhost:8080
3. **Login** with admin credentials
4. **Select realm**: `sso-realm`

### Step 2: Create User
1. **Go to**: Users → **Create new user**
2. **Fill in**:
   ```
   Username: sandeepkumar1464@gmail.com
   Email: sandeepkumar1464@gmail.com
   First name: Sandeep
   Last name: Kumar
   Email verified: ON
   Enabled: ON
   ```
3. **Click**: Create

### Step 3: Set Password
1. **Go to**: Credentials tab
2. **Click**: Set password
3. **Enter**:
   ```
   Password: Admin_123
   Password confirmation: Admin_123
   Temporary: OFF
   ```
4. **Click**: Save

### Step 4: Assign Roles
1. **Go to**: Role mapping tab
2. **Click**: Assign role
3. **Select**:
   - ✅ admin
   - ✅ app1-user
   - ✅ app2-user
4. **Click**: Assign

## Test Login
1. **Go to**: http://localhost:5000
2. **Enter**: `sandeepkumar1464@gmail.com`
3. **Password**: `Admin_123`
4. **Should see**: Dashboard with all applications

## User Access
- ✅ **CommonLogin**: Full access
- ✅ **App1**: Full access (admin + app1-user roles)
- ✅ **App2**: Full access (admin + app2-user roles)
- ✅ **Google OAuth**: Can also login via Google with same email