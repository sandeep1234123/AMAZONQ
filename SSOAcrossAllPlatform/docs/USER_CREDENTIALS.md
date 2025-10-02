# Complete User Credentials Setup

## Keycloak Admin Account
- **Username**: `admin`
- **Password**: `Admin_123`
- **URL**: http://localhost:8080

## Test Users for SSO Platform

### 1. Main Admin User
- **Username**: `sandeepkumar1464@gmail.com`
- **Password**: `Admin_123`
- **Email**: `sandeepkumar1464@gmail.com`
- **First Name**: `Sandeep`
- **Last Name**: `Kumar`
- **Roles**: `admin`, `app1-user`, `app2-user`
- **Access**: All Applications

### 2. App1 Only User
- **Username**: `app1.user`
- **Password**: `Admin_123`
- **Email**: `app1@company.com`
- **First Name**: `App1`
- **Last Name**: `User`
- **Roles**: `app1-user`
- **Access**: App1 Only

### 3. App2 Only User
- **Username**: `app2.user`
- **Password**: `Admin_123`
- **Email**: `app2@company.com`
- **First Name**: `App2`
- **Last Name**: `User`
- **Roles**: `app2-user`
- **Access**: App2 Only

### 4. Multi-App User
- **Username**: `multi.user`
- **Password**: `Admin_123`
- **Email**: `multi@company.com`
- **First Name**: `Multi`
- **Last Name**: `User`
- **Roles**: `app1-user`, `app2-user`
- **Access**: App1 & App2

### 5. Test Admin User
- **Username**: `admin.user`
- **Password**: `Admin_123`
- **Email**: `admin@company.com`
- **First Name**: `Admin`
- **Last Name**: `User`
- **Roles**: `admin`, `app1-user`, `app2-user`
- **Access**: All Applications

## Quick Test Summary
| Username | Password | Access |
|----------|----------|---------|
| sandeepkumar1464@gmail.com | Admin_123 | All Apps (Main Admin) |
| admin.user | Admin_123 | All Apps |
| app1.user | Admin_123 | App1 Only |
| app2.user | Admin_123 | App2 Only |
| multi.user | Admin_123 | App1 & App2 |

## Application URLs
- **CommonLogin**: http://localhost:5000
- **App1**: http://localhost:5001
- **App2**: http://localhost:5002
- **Keycloak Admin**: http://localhost:8080

All users use the same password: **Admin_123** for easy testing.