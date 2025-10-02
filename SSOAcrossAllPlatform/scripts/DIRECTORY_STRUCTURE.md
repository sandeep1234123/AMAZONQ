# Scripts Directory Organization

## `/startup/` - Application Startup & Shutdown
- `00-start-all-sequential.bat` - Master startup script
- `01-start-keycloak.bat` - Start Keycloak server
- `02-start-common-login.bat` - Start SSO hub
- `03-start-app1.bat` - Start business app 1
- `04-start-app2.bat` - Start business app 2  
- `05-start-app3.bat` - Start business app 3
- `99-stop-all-applications.bat` - Stop all services
- `start-applications.bat` - Legacy startup script

## `/setup/` - Installation & Initial Setup
- `complete-setup.bat` - Master installation script
- `install-java.bat` - Install Java JDK
- `install-ad-module.bat` - Install Active Directory module
- `download-keycloak.bat` - Download Keycloak

## `/configuration/` - Keycloak Configuration
- `configure-keycloak-app3.bat` - Configure App3 in Keycloak
- `create-client.bat` - Create common-login client
- `create-app3-client.bat` - Create App3 client
- `create-app3-client-simple.bat` - Simple App3 client setup
- `create-ad-users-*.bat` - Create AD users
- `google-oauth-quick-setup.bat` - Google OAuth setup

## `/testing/` - Testing & Debugging
- `test-keycloak.bat` - Test Keycloak connection
- `test-keycloak-connection.bat` - Test connectivity
- `test-app3-login.bat` - Test App3 login flow
- `debug-app3-issues.bat` - Debug App3 problems
- `verify-keycloak-ad.bat` - Verify AD integration

## `/apps/` - Application Management
- `start-all-apps.bat` - Start all .NET applications
- `start-app3.bat` - Start App3 only
- `setup-app3-*.bat` - App3 specific setup

## `/keycloak/` - Keycloak Management
- `start-keycloak.bat` - Start Keycloak with port detection
- `stop-keycloak.bat` - Stop Keycloak processes

## `/deprecated/` - Legacy Scripts
- Old duplicate scripts moved here

## Root Files
- `README.md` - Main documentation
- `STARTUP_ORDER.md` - Execution order guide
- `DIRECTORY_STRUCTURE.md` - This file

## Usage Priority
1. **New Users**: `/startup/00-start-all-sequential.bat`
2. **Setup**: `/setup/complete-setup.bat`
3. **Configuration**: `/configuration/` scripts
4. **Testing**: `/testing/` scripts