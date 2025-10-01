# Install Keycloak 23.0.7 - Quick Fix

## Option 1: Automated Download (Recommended)
```cmd
# Run this script to download automatically
download-keycloak.bat
```

## Option 2: Manual Download
1. **Download**: https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip
2. **Extract** to: `D:\AMAZONQ\SSOAcrossAllPlatform\keycloak-23.0.7`

## Option 3: PowerShell Commands
```powershell
# Download
Invoke-WebRequest -Uri "https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip" -OutFile "keycloak-23.0.7.zip"

# Extract
Expand-Archive -Path "keycloak-23.0.7.zip" -DestinationPath "." -Force
```

## Option 4: Using curl (if available)
```cmd
curl -L https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip -o keycloak-23.0.7.zip
```

## Verify Installation
After download, you should have:
```
D:\AMAZONQ\SSOAcrossAllPlatform\
├── keycloak-23.0.7/
│   ├── bin/
│   │   └── kc.bat
│   ├── lib/
│   └── conf/
```

## Next Steps
1. **Start Keycloak**: `start-keycloak.bat`
2. **Open**: http://localhost:8080
3. **Create admin account**: admin/admin123