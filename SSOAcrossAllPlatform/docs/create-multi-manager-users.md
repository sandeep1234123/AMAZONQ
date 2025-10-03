# Create Multi-User and Manager Users in Keycloak

## Step 1: Create Roles in Keycloak
1. Go to: `http://localhost:8081/admin`
2. Login: admin/admin
3. Select: `sso-realm`
4. Left menu → **Realm roles**
5. Create these roles:
   - `multi-user` (Access to App1 and App2)
   - `manager` (Access to App1, App2, and App3)

## Step 2: Create Multi-User
1. **Users** → **Add user**
2. Username: `multiuser`
3. Email: `multiuser@company.com`
4. **Create**
5. **Credentials** → Set password: `Multi123!`
6. **Role mapping** → Assign: `multi-user`

## Step 3: Create Manager User
1. **Users** → **Add user**
2. Username: `manager`
3. Email: `manager@company.com`
4. **Create**
5. **Credentials** → Set password: `Manager123!`
6. **Role mapping** → Assign: `manager`

## Step 4: Test Access
**Multi-User (App1 + App2 only):**
- Username: `multiuser` / `Multi123!`
- Access: App1 ✅, App2 ✅, App3 ❌

**Manager (All Apps):**
- Username: `manager` / `Manager123!`
- Access: App1 ✅, App2 ✅, App3 ✅

**Existing User (All Apps):**
- Username: `sandeepkumar1464` / `Admin_123`
- Access: App1 ✅, App2 ✅, App3 ✅