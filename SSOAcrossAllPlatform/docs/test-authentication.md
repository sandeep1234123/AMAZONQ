# Authentication Test Cases

## Test Scenarios

### 1. app1-test User (app1-user role)
- **Expected Access**: App1 only
- **Test Steps**:
  1. Login via CommonLogin (http://localhost:5000) with app1-test user
  2. Should see App1 in authorized applications
  3. Click App1 - should access successfully
  4. Try App2 directly (http://localhost:5102) - should be denied
  5. Try App3 directly (http://localhost:5103) - should be denied

### 2. multi-user Role
- **Expected Access**: App1 and App2 only (NOT App3)
- **Test Steps**:
  1. Login via CommonLogin with multi-user credentials
  2. Should see App1 and App2 in authorized applications
  3. Should NOT see App3
  4. Access App1 and App2 successfully
  5. App3 should deny access

### 3. manager Role
- **Expected Access**: App1, App2, and App3
- **Test Steps**:
  1. Login via CommonLogin with manager credentials
  2. Should see all three applications
  3. Access all applications successfully

### 4. admin Role
- **Expected Access**: App1, App2, and App3
- **Test Steps**:
  1. Login via CommonLogin with admin credentials
  2. Should see all three applications
  3. Access all applications successfully

## Key Fixes Applied

1. **Shared Cookie Domain**: All applications now use `SSO.Auth` cookie with `localhost` domain
2. **Role Processing**: All applications properly extract roles from Keycloak `realm_access`
3. **Application Configuration**: All apps have complete application lists in appsettings.json
4. **Authorization Logic**: Consistent role-based access control across all applications
5. **Dashboard Updates**: App3 dashboard now shows authorized applications like App1/App2

## Expected Behavior

- Single sign-on should work across all applications on localhost
- Role-based access control should be enforced
- Users should only see applications they have access to
- Cross-application navigation should work seamlessly