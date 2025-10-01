# Quick Start Guide - SSO Platform

## Prerequisites
- .NET 8 SDK installed
- Java 11+ installed (for Keycloak)
- Windows/Linux/Mac OS

## 🚀 Quick Setup (5 Minutes)

### Step 1: Download Keycloak (Windows 11)
```cmd
# Download Keycloak 23.0.7 using PowerShell
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip' -OutFile 'keycloak-23.0.7.zip'"

# Extract using PowerShell
powershell -Command "Expand-Archive -Path 'keycloak-23.0.7.zip' -DestinationPath '.' -Force"

# Or download manually from browser:
# https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip
# Extract to: D:\AMAZONQ\SSOAcrossAllPlatform\keycloak-23.0.7
```

### Step 2: Start Keycloak (Windows 11)
```cmd
# Option 1: Use provided batch script
start-keycloak.bat

# Option 2: Manual start
cd keycloak-23.0.7
bin\kc.bat start-dev --http-port=8080

# Option 3: PowerShell
Set-Location keycloak-23.0.7
.\bin\kc.bat start-dev --http-port=8080
```

### Step 3: Setup Keycloak (First Time Only)
1. Open: `http://localhost:8080`
2. Create admin account:
   - Username: `admin`
   - Password: `admin123`

### Step 4: Import Realm Configuration
1. Login to Keycloak Admin
2. Click "Create Realm"
3. **Realm name**: `sso-realm`
4. Create clients and users as per SETUP_GUIDE.md

### Step 5: Start Applications (Windows 11)
```cmd
# Option 1: Use provided batch script (Recommended)
start-applications.bat

# Option 2: Manual start in separate Command Prompts
# Terminal 1:
cd CommonLogin
dotnet run --urls=http://localhost:5000

# Terminal 2:
cd App1
dotnet run --urls=http://localhost:5001

# Terminal 3:
cd App2
dotnet run --urls=http://localhost:5002

# Option 3: PowerShell (all in one)
Start-Process cmd -ArgumentList '/k', 'cd CommonLogin && dotnet run --urls=http://localhost:5000'
Start-Process cmd -ArgumentList '/k', 'cd App1 && dotnet run --urls=http://localhost:5001'
Start-Process cmd -ArgumentList '/k', 'cd App2 && dotnet run --urls=http://localhost:5002'
```

## 🧪 Test Users (Ready to Use)

| Username | Password | Access |
|----------|----------|---------|
| admin.user | Admin123! | All Apps |
| app1.user | App1User123! | App1 Only |
| app2.user | App2User123! | App2 Only |
| multi.user | MultiUser123! | App1 & App2 |

## 🌐 Application URLs

- **CommonLogin**: http://localhost:5000
- **App1**: http://localhost:5001
- **App2**: http://localhost:5002
- **Keycloak Admin**: http://localhost:8080

## ✅ Test SSO Flow

1. Go to: http://localhost:5000
2. Enter: `admin.user`
3. Password: `Admin123!`
4. Click applications to test SSO

## 🔧 Troubleshooting

### Connection Refused Error (Windows 11)
```cmd
# Check if Keycloak is running
netstat -an | findstr :8080

# Or use PowerShell
Get-NetTCPConnection -LocalPort 8080

# Start Keycloak if not running
cd keycloak-23.0.7
bin\kc.bat start-dev --http-port=8080

# Check Windows Firewall if still issues
netsh advfirewall firewall add rule name="Keycloak" dir=in action=allow protocol=TCP localport=8080
```

### Invalid Client Error
- Check client secrets in appsettings.json match Keycloak
- Verify redirect URIs are correct

For detailed setup, see SETUP_GUIDE.md