# AMAZONQ - SSO Platform

Complete Single Sign-On (SSO) platform with Keycloak integration for multiple .NET applications.

## 🚀 Quick Start

1. **Run Setup**: `push-to-github.bat` (first time)
2. **Start Platform**: `SSOAcrossAllPlatform\scripts\startup\00-start-all-sequential.bat`
3. **Access Apps**: http://localhost:5000 (CommonLogin)

## 📁 Project Structure

```
AMAZONQ/
├── SSOAcrossAllPlatform/          # Main SSO Platform
│   ├── CommonLogin/               # Central SSO Hub (Port 5000)
│   ├── App1/                      # Business App 1 (Port 5101)
│   ├── App2/                      # Business App 2 (Port 5102)
│   ├── App3/                      # Business App 3 (Port 5103)
│   ├── keycloak-23.0.7/          # Keycloak Server
│   ├── scripts/                   # Automation Scripts
│   │   ├── startup/               # Application startup scripts
│   │   ├── setup/                 # Installation scripts
│   │   └── configuration/         # Keycloak config scripts
│   └── docs/                      # Documentation
└── push-to-github.bat            # GitHub deployment script
```

## 🔧 Applications

| Application | Port | Purpose | Required Roles |
|-------------|------|---------|----------------|
| **Keycloak** | 8080/8081 | Identity Provider | - |
| **CommonLogin** | 5000 | SSO Hub | - |
| **App1** | 5101 | Business App 1 | app1-user, admin |
| **App2** | 5102 | Business App 2 | app2-user, admin |
| **App3** | 5103 | Business App 3 | app3-user, admin |

## 👥 Test Users

| Username | Password | Access |
|----------|----------|--------|
| `admin` | `Admin123!` | All applications |
| `app1-test` | `Test123!` | App1 only |
| `app2-test` | `Test123!` | App2 only |
| `app3-test` | `Test123!` | App3 only |
| `multi-user` | `Multi123!` | App1 + App2 |
| `manager` | `Manager123!` | All apps (no admin) |

## 🛠️ Setup Instructions

### Prerequisites
- .NET 6+ SDK
- Java 17+ (for Keycloak)
- Windows 10/11

### Installation
1. **Clone Repository**:
   ```bash
   git clone https://github.com/sandeep1234123/AMAZONQ.git
   cd AMAZONQ
   ```

2. **Install Java** (if needed):
   ```bash
   SSOAcrossAllPlatform\scripts\setup\install-java.bat
   ```

3. **Start All Applications**:
   ```bash
   SSOAcrossAllPlatform\scripts\startup\00-start-all-sequential.bat
   ```

4. **Configure Keycloak**:
   - Open: http://localhost:8081/admin
   - Login: Admin / Admin_123
   - Follow: `docs\KEYCLOAK_COMPLETE_SETUP.md`

## 🔐 SSO Flow

1. **User visits App** → Redirects to CommonLogin
2. **CommonLogin** → Redirects to Keycloak
3. **Keycloak authenticates** → Returns to CommonLogin
4. **CommonLogin** → Redirects back to App
5. **User accesses other apps** → No re-login required

## 📚 Documentation

- **Complete Setup**: `SSOAcrossAllPlatform\docs\KEYCLOAK_COMPLETE_SETUP.md`
- **User Guide**: `SSOAcrossAllPlatform\docs\USER_SETUP_GUIDE.md`
- **Scripts Guide**: `SSOAcrossAllPlatform\scripts\DIRECTORY_STRUCTURE.md`

## 🚦 Status Check

Run `00-start-all-sequential.bat` to see current application status:
- ✓ Running
- ○ Stopped
- ✗ Failed

## 🔄 Updates

To push changes to GitHub:
```bash
push-to-github.bat
```

## 🏗️ Architecture

- **Identity Provider**: Keycloak 23.0.7
- **Applications**: ASP.NET Core 6+
- **Authentication**: OpenID Connect (OIDC)
- **Authorization**: Role-based access control
- **Session Management**: Distributed SSO sessions

## 📞 Support

For issues or questions, check the documentation in the `docs/` folder or review the setup scripts in `scripts/` directory.