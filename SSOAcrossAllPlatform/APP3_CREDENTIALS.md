# Application 3 - Active Directory Credentials

## Created AD Users

### Test User
- **Username**: app3user@company.com
- **Password**: App3Pass123!
- **Role**: app3-user
- **Group**: App3Users
- **Access**: Application 3

### Admin User  
- **Username**: app3admin@company.com
- **Password**: App3Admin123!
- **Role**: admin, app3-user
- **Groups**: App3Users, Domain Admins
- **Access**: All Applications

## AD Group
- **Group Name**: App3Users
- **Type**: Security Group
- **Scope**: Global
- **Members**: app3user, app3admin

## Keycloak Mapping
- **AD Group**: App3Users → **Keycloak Role**: app3-user
- **Client**: app3-client
- **Port**: 5103