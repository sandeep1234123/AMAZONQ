# Create Keycloak Admin Account - Step by Step

## Step 1: Start Keycloak
```cmd
start-keycloak.bat
```
Wait for message: "Keycloak 23.0.7 started"

## Step 2: Open Keycloak in Browser
1. Open browser
2. Go to: http://localhost:8080
3. You should see "Welcome to Keycloak" page

## Step 3: Create Admin Account
1. Click **Administration Console**
2. You'll see "Create an admin user" form
3. Fill in:
   - **Username**: `admin`
   - **Password**: `Admin_123`
   - **Password confirmation**: `Admin_123`
4. Click **Create**

## Step 4: Login to Admin Console
1. You'll be redirected to login page
2. Enter:
   - **Username**: `admin`
   - **Password**: `Admin_123`
3. Click **Sign In**

## Step 5: Verify Admin Access
1. You should see Keycloak Admin Console
2. Default realm: "Master"
3. Ready to create your SSO realm

## ✅ Success Indicators
- Keycloak Admin Console loads
- You can see "Master" realm
- Left sidebar shows admin options
- No error messages

## Next Step
Continue with **Step 4** in COMPLETE_SETUP_STEPS.md to create your SSO realm.