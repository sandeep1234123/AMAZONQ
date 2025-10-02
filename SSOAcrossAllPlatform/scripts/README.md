# Scripts Organization

## Folder Structure

### `/keycloak/` - Keycloak Management
- `start-keycloak.bat` - Start Keycloak with auto port detection
- `stop-keycloak.bat` - Stop Keycloak processes

### `/apps/` - Application Management  
- `start-all-apps.bat` - Start all SSO applications
- `start-app3.bat` - Start App3 only
- `setup-app3-*.bat` - App3 specific setup scripts

### `/setup/` - Installation & Setup
- `complete-setup.bat` - Master setup script
- `install-java.bat` - Install Java JDK
- `install-ad-module.bat` - Install AD module
- `download-keycloak.bat` - Download Keycloak

### `/deprecated/` - Old Scripts
- Legacy scripts moved here to avoid confusion

## Quick Start
1. Run: `setup/complete-setup.bat`
2. Configure Keycloak via admin console
3. Run: `apps/start-all-apps.bat`

## Removed Duplicates
- Consolidated 3 Keycloak start scripts into 1
- Merged client creation scripts
- Organized by functionality