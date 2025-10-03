# Magic Link Authentication Documentation

This directory contains comprehensive documentation for the Magic Link authentication system integrated with Keycloak SSO.

## Documentation Files

### 📋 [MAGIC_LINK_OVERVIEW.md](MAGIC_LINK_OVERVIEW.md)
Complete overview of Magic Link authentication including:
- Architecture diagrams
- Security features
- Flow details
- Production considerations

### ⚡ [QUICK_SETUP.md](QUICK_SETUP.md)
Quick start guide for setting up and testing Magic Link:
- Keycloak client configuration
- Application startup
- Testing steps
- Expected results

### 🔧 [KEYCLOAK_MAGIC_LINK_SETUP.md](KEYCLOAK_MAGIC_LINK_SETUP.md)
Detailed Keycloak configuration guide:
- Step-by-step client setup
- Authentication flow configuration
- Email settings
- Security considerations
- Troubleshooting

## Magic Link Application

**Location**: `D:\AMAZONQ\SSOAcrossAllPlatform\MagicLinkApp`
**Port**: 5200
**URL**: http://localhost:5200

## Key Features

✅ **Passwordless Authentication** - Users login via email magic links
✅ **Keycloak Integration** - Full SSO support across all applications  
✅ **Secure Tokens** - 15-minute expiry with single-use validation
✅ **Cross-App SSO** - Authentication works across App1, App2, App3
✅ **Production Ready** - Comprehensive security and error handling

## Quick Test

1. **Start Keycloak**: Ensure running on port 8081
2. **Configure Client**: Create `magic-link-app` client in Keycloak
3. **Run Application**: `dotnet run --urls="http://localhost:5200"`
4. **Test Flow**: Enter email → Check console logs → Click magic link
5. **Verify SSO**: Access other applications without re-authentication

## Magic Link Flow

```
Email Request → Token Generation → Magic Link Email → 
User Clicks Link → Token Validation → Keycloak Auth → 
SSO Session Created → Dashboard Access
```

## Security

- **15-minute token expiry**
- **Single-use tokens**
- **Cryptographically secure generation**
- **Keycloak authentication validation**
- **Cross-application SSO support**

For detailed implementation and configuration, see the individual documentation files above.