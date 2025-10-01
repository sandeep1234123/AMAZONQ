# SSO Platform - Complete User Credentials

## Application 1 Users
- **Username**: app1user@company.com
- **Password**: App1Pass123!
- **Role**: app1-user

## Application 2 Users  
- **Username**: app2user@company.com
- **Password**: App2Pass123!
- **Role**: app2-user

## Application 3 Users
- **Username**: app3user@company.com
- **Password**: App3Pass123!
- **Role**: app3-user

- **Username**: app3admin@company.com
- **Password**: App3Admin123!
- **Role**: admin, app3-user

## Active Directory Groups
- **App1Users**: Members with app1-user role
- **App2Users**: Members with app2-user role  
- **App3Users**: Members with app3-user role

## Keycloak Clients
- **app1-client**: Port 5101
- **app2-client**: Port 5102
- **app3-client**: Port 5103
- **common-login**: Port 5000

## SSO Test Flow
1. Login with any user credentials
2. Access authorized applications seamlessly
3. Cross-application navigation without re-authentication