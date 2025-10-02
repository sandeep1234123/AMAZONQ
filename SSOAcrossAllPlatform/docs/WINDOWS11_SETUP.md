# Windows 11 Setup Guide - SSO Platform

## 🖥️ Windows 11 Specific Instructions

### Prerequisites Check
```cmd
# Check .NET 8 SDK
dotnet --version

# Check Java (required for Keycloak)
java -version

# Check PowerShell version
$PSVersionTable.PSVersion
```

### Install Missing Prerequisites

#### Install .NET 8 SDK
```cmd
# Download and install from:
# https://dotnet.microsoft.com/download/dotnet/8.0

# Or use winget (Windows 11)
winget install Microsoft.DotNet.SDK.8
```

#### Install Java 11+ (Required for Keycloak)
```cmd
# Option 1: Use winget
winget install Eclipse.Temurin.11.JDK

# Option 2: Download manually
# https://adoptium.net/temurin/releases/?version=11
```

## 🚀 Automated Setup (Recommended)

### Step 1: Run PowerShell Setup
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-windows11.ps1
```

### Step 2: Start Keycloak
```cmd
# Double-click or run:
start-keycloak.bat
```

### Step 3: Configure Keycloak (First Time)
1. Open: http://localhost:8080
2. Create admin account:
   - Username: `admin`
   - Password: `admin123`
3. Follow SETUP_GUIDE.md for realm configuration

### Step 4: Start Applications
```cmd
# Double-click or run:
start-applications.bat
```

## 🔧 Manual Setup (Alternative)

### Download Keycloak
```cmd
# Using PowerShell
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip' -OutFile 'keycloak-23.0.7.zip'"

# Extract
powershell -Command "Expand-Archive -Path 'keycloak-23.0.7.zip' -DestinationPath '.' -Force"
```

### Configure Windows Firewall
```cmd
# Run as Administrator
netsh advfirewall firewall add rule name="Keycloak-8080" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="CommonLogin-5000" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="App1-5001" dir=in action=allow protocol=TCP localport=5001
netsh advfirewall firewall add rule name="App2-5002" dir=in action=allow protocol=TCP localport=5002
```

### Build Applications
```cmd
# Build all projects
dotnet build --configuration Release

# Or build individually
cd CommonLogin && dotnet build
cd ..\App1 && dotnet build
cd ..\App2 && dotnet build
```

## 🧪 Testing on Windows 11

### Check Services Running
```cmd
# Check all ports
netstat -an | findstr "5000 5001 5002 8080"

# Check specific port
netstat -an | findstr :8080
```

### Test URLs
```cmd
# Open in default browser
start http://localhost:5000
start http://localhost:5001
start http://localhost:5002
start http://localhost:8080
```

### PowerShell Testing
```powershell
# Test HTTP endpoints
Invoke-WebRequest -Uri "http://localhost:8080" -Method GET
Invoke-WebRequest -Uri "http://localhost:5000" -Method GET
```

## 🔍 Windows 11 Troubleshooting

### Port Already in Use
```cmd
# Find process using port
netstat -ano | findstr :8080
tasklist /FI "PID eq [PID_NUMBER]"

# Kill process if needed
taskkill /PID [PID_NUMBER] /F
```

### Windows Defender/Firewall Issues
```cmd
# Temporarily disable Windows Defender Firewall (not recommended for production)
netsh advfirewall set allprofiles state off

# Re-enable after testing
netsh advfirewall set allprofiles state on

# Or add specific exceptions (recommended)
netsh advfirewall firewall add rule name="SSO Platform" dir=in action=allow program="java.exe"
```

### PowerShell Execution Policy
```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or bypass for single script
powershell -ExecutionPolicy Bypass -File .\setup-windows11.ps1
```

### Java Path Issues
```cmd
# Check Java installation
where java

# Set JAVA_HOME if needed
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.0.x.x-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
```

### .NET Issues
```cmd
# Check installed SDKs
dotnet --list-sdks

# Check runtime versions
dotnet --list-runtimes

# Clear NuGet cache if build issues
dotnet nuget locals all --clear
```

## 🎯 Windows 11 Specific Features

### Windows Terminal Integration
```json
// Add to Windows Terminal settings.json
{
    "name": "SSO Platform",
    "commandline": "cmd.exe /k \"cd /d D:\\AMAZONQ\\SSOAcrossAllPlatform && start-applications.bat\"",
    "startingDirectory": "D:\\AMAZONQ\\SSOAcrossAllPlatform",
    "icon": "🔐"
}
```

### Task Scheduler (Auto-start)
```cmd
# Create scheduled task to start Keycloak on boot
schtasks /create /tn "Keycloak SSO" /tr "D:\AMAZONQ\SSOAcrossAllPlatform\start-keycloak.bat" /sc onstart /ru SYSTEM
```

### Desktop Shortcuts
```cmd
# Create desktop shortcut for CommonLogin
echo @echo off > "%USERPROFILE%\Desktop\SSO Login.bat"
echo start http://localhost:5000 >> "%USERPROFILE%\Desktop\SSO Login.bat"
```

## 📊 Performance Optimization (Windows 11)

### Memory Settings
```cmd
# Increase Java heap for Keycloak (if needed)
set JAVA_OPTS=-Xms512m -Xmx2g
```

### Windows 11 WSL2 Alternative
```bash
# If you prefer Linux environment
wsl --install
wsl --set-default-version 2

# Then follow Linux setup instructions in WSL2
```

## ✅ Verification Checklist

- [ ] .NET 8 SDK installed and working
- [ ] Java 11+ installed and in PATH
- [ ] Keycloak 23.0.7 downloaded and extracted
- [ ] Windows Firewall configured
- [ ] All applications build successfully
- [ ] Keycloak starts on port 8080
- [ ] Applications start on ports 5000, 5001, 5002
- [ ] SSO login flow works end-to-end
- [ ] Test users can access appropriate applications

## 🎉 Success Indicators

When everything is working correctly on Windows 11:

1. **Keycloak Console**: http://localhost:8080 shows login page
2. **CommonLogin**: http://localhost:5000 shows SSO login form
3. **App1**: http://localhost:5001 shows application or redirects to login
4. **App2**: http://localhost:5002 shows application or redirects to login
5. **SSO Flow**: Login once, access all authorized applications

## 📞 Support

If you encounter Windows 11 specific issues:

1. Check Windows Event Viewer for application errors
2. Verify Windows Defender isn't blocking applications
3. Ensure all prerequisites are properly installed
4. Run applications as Administrator if permission issues occur
5. Check Windows 11 compatibility mode if using older Java versions