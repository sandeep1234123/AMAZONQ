# SSO Platform Setup Script for Windows 11
# Run as Administrator for best results

Write-Host "SSO Platform Setup for Windows 11" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Warning "For best results, run PowerShell as Administrator"
}

# Check prerequisites
Write-Host "`nChecking Prerequisites..." -ForegroundColor Yellow

# Check .NET 8
try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET Version: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ .NET 8 SDK not found. Please install from: https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
}

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java 11+ from: https://adoptium.net/" -ForegroundColor Red
    exit 1
}

# Download Keycloak if not exists
if (-not (Test-Path "keycloak-23.0.7")) {
    Write-Host "`nDownloading Keycloak 23.0.7..." -ForegroundColor Yellow
    
    if (-not (Test-Path "keycloak-23.0.7.zip")) {
        try {
            Invoke-WebRequest -Uri "https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip" -OutFile "keycloak-23.0.7.zip"
            Write-Host "✅ Keycloak downloaded successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to download Keycloak. Please download manually from:" -ForegroundColor Red
            Write-Host "https://github.com/keycloak/keycloak/releases/download/23.0.7/keycloak-23.0.7.zip" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Host "Extracting Keycloak..." -ForegroundColor Yellow
    try {
        Expand-Archive -Path "keycloak-23.0.7.zip" -DestinationPath "." -Force
        Write-Host "✅ Keycloak extracted successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to extract Keycloak" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Keycloak 23.0.7 already exists" -ForegroundColor Green
}

# Configure Windows Firewall
Write-Host "`nConfiguring Windows Firewall..." -ForegroundColor Yellow
try {
    netsh advfirewall firewall add rule name="Keycloak-8080" dir=in action=allow protocol=TCP localport=8080 | Out-Null
    netsh advfirewall firewall add rule name="CommonLogin-5000" dir=in action=allow protocol=TCP localport=5000 | Out-Null
    netsh advfirewall firewall add rule name="App1-5001" dir=in action=allow protocol=TCP localport=5001 | Out-Null
    netsh advfirewall firewall add rule name="App2-5002" dir=in action=allow protocol=TCP localport=5002 | Out-Null
    Write-Host "✅ Firewall rules added" -ForegroundColor Green
} catch {
    Write-Warning "Could not add firewall rules. You may need to run as Administrator"
}

# Build applications
Write-Host "`nBuilding .NET Applications..." -ForegroundColor Yellow
try {
    dotnet build --configuration Release | Out-Null
    Write-Host "✅ Applications built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build applications" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\start-keycloak.bat" -ForegroundColor White
Write-Host "2. Setup Keycloak at: http://localhost:8080" -ForegroundColor White
Write-Host "3. Run: .\start-applications.bat" -ForegroundColor White
Write-Host "4. Test SSO at: http://localhost:5000" -ForegroundColor White

Write-Host "`nTest Users:" -ForegroundColor Yellow
Write-Host "admin.user / Admin123! (All Apps)" -ForegroundColor White
Write-Host "app1.user / App1User123! (App1 Only)" -ForegroundColor White
Write-Host "app2.user / App2User123! (App2 Only)" -ForegroundColor White
Write-Host "multi.user / MultiUser123! (App1 & App2)" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")