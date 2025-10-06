# Keycloak 23.0.7 Authentication Flow Configuration

## 🔐 Authentication Flows Overview

Keycloak 23.0.7 uses Authentication Flows to define how users authenticate. For Magic Link integration, we need to configure specific flows.

## 📋 Step-by-Step Authentication Flow Setup

### 1. Access Authentication Flows
```
1. Login to Keycloak Admin Console: http://localhost:8081/admin
2. Login: Admin / Admin_123
3. Select Realm: sso-realm (not master)
4. Navigate: Authentication → Flows
```

### 2. Default Flows in Keycloak 23.0.7
```
✅ Browser Flow (Default)
✅ Direct Grant Flow  
✅ Registration Flow
✅ Reset Credentials Flow
✅ Client Authentication Flow
✅ Docker Auth Flow
✅ HTTP Challenge Flow
```

## 🌐 Browser Flow Configuration (Primary)

### Step 1: Review Browser Flow
```
1. Authentication → Flows
2. Select: "Browser" flow
3. View current configuration:
   - Cookie (ALTERNATIVE)
   - Kerberos (DISABLED) 
   - Identity Provider Redirector (ALTERNATIVE)
   - Browser Forms (ALTERNATIVE)
     - Username Password Form (REQUIRED)
     - Browser Conditional OTP (CONDITIONAL)
```

### Step 2: Browser Flow Settings
```
Flow Name: Browser
Description: Browser based authentication
Top Level Flow Type: Basic flow
Used By: 
- Clients (Standard Flow)
- Identity Providers
```

### Step 3: Browser Forms Sub-Flow
```
Sub-Flow: Browser Forms
├── Username Password Form (REQUIRED)
├── Browser Conditional OTP (CONDITIONAL)
    ├── Condition - User Configured (REQUIRED)
    └── OTP Form (REQUIRED)
```

## 🔑 Direct Grant Flow Configuration

### Step 1: Configure Direct Grant Flow
```
1. Authentication → Flows
2. Select: "Direct Grant" flow
3. Current configuration:
   - Direct Grant Validate Username (REQUIRED)
   - Direct Grant Validate Password (REQUIRED)
   - Direct Grant Validate OTP (CONDITIONAL)
```

### Step 2: Direct Grant Settings
```
Flow Name: Direct Grant
Description: OpenID Connect Resource Owner Grant
Top Level Flow Type: Basic flow
Used By:
- Resource Owner Password Credentials Grant
- Direct Access Grants in clients
```

## 🔧 Client-Specific Flow Binding

### Step 1: Bind Flows to magic-user Client
```
1. Clients → magic-user → Settings
2. Authentication flow overrides:
   - Browser Flow: Browser (default)
   - Direct Grant Flow: Direct Grant (default)
```

### Step 2: Client Flow Configuration
```
Standard Flow Enabled: ON
├── Uses: Browser Flow
├── Endpoints: /auth, /token
└── Redirect URIs: http://localhost:5200/*

Direct Access Grants Enabled: ON
├── Uses: Direct Grant Flow  
├── Endpoint: /token
└── Grant Type: password
```

## 🎯 Custom Magic Link Flow (Optional)

### Step 1: Create Custom Flow
```
1. Authentication → Flows
2. Click: "Create flow"
3. Settings:
   - Alias: magic-link-browser
   - Description: Custom flow for magic link authentication
   - Flow Type: Basic flow
```

### Step 2: Add Executions to Custom Flow
```
1. Select: magic-link-browser flow
2. Add Execution: Cookie
   - Requirement: ALTERNATIVE
3. Add Execution: Identity Provider Redirector  
   - Requirement: ALTERNATIVE
4. Add Sub-Flow: Magic Link Forms
   - Type: Basic flow
   - Requirement: ALTERNATIVE
```

### Step 3: Configure Magic Link Forms Sub-Flow
```
Sub-Flow: Magic Link Forms
1. Add Execution: Username Password Form
   - Requirement: REQUIRED
2. Add Execution: Conditional OTP
   - Requirement: CONDITIONAL
```

## 🔄 Authentication Flow Execution Steps

### Browser Flow Execution (Standard)
```
Step 1: Cookie Check
├── If valid session cookie exists → Success
└── If no cookie → Continue to next

Step 2: Identity Provider Check  
├── If IdP redirect configured → Redirect to IdP
└── If no IdP → Continue to next

Step 3: Browser Forms
├── Username Password Form → User enters credentials
├── Validate credentials → Success/Failure
└── OTP Check (if configured) → Enter OTP code
```

### Direct Grant Flow Execution
```
Step 1: Validate Username
├── Check username exists
├── Check user enabled
└── Continue or fail

Step 2: Validate Password
├── Check password correct
├── Check password not expired
└── Continue or fail

Step 3: Validate OTP (if required)
├── Check OTP code
└── Success or fail
```

## ⚙️ Flow Configuration Parameters

### Browser Flow Settings
```
1. Authentication → Flows → Browser → Settings
2. Configuration options:
   - Alias: browser
   - Description: Browser based authentication
   - Provider: basic-flow
   - Top Level Flow: Yes
   - Built In: Yes
```

### Execution Requirements
```
REQUIRED: Must succeed for flow to continue
ALTERNATIVE: One alternative must succeed  
DISABLED: Execution is disabled
CONDITIONAL: Depends on conditions
```

## 🔐 Magic Link Integration Points

### Integration with Browser Flow
```
1. User clicks magic link → MagicLinkApp
2. App validates token → Success
3. App redirects to Keycloak authorization endpoint
4. Keycloak starts Browser Flow:
   ├── Cookie check (likely no existing session)
   ├── Identity Provider check (none configured)
   └── Browser Forms → Username/Password prompt
5. User authenticates → magictest / Magic123!
6. Keycloak completes flow → Returns authorization code
7. App exchanges code for tokens → User logged in
```

### Flow Customization for Magic Link
```
Option 1: Use Default Browser Flow
- Simplest approach
- Standard username/password after magic link
- No custom configuration needed

Option 2: Custom Flow with Skip Authentication
- Create custom flow
- Add execution to skip password if magic link valid
- Requires custom authenticator development
```

## 📊 Flow Binding Configuration

### Realm-Level Bindings
```
1. Authentication → Bindings
2. Default flows:
   - Browser Flow: Browser
   - Registration Flow: Registration  
   - Direct Grant Flow: Direct Grant
   - Reset Credentials Flow: Reset Credentials
   - Client Authentication Flow: Clients
```

### Client-Level Overrides
```
1. Clients → magic-user → Settings
2. Authentication flow overrides:
   - Browser Flow: (use realm default or custom)
   - Direct Grant Flow: (use realm default or custom)
```

## 🔍 Flow Debugging and Testing

### Test Browser Flow
```
1. Clear browser cookies
2. Navigate to:
   http://localhost:8081/realms/sso-realm/protocol/openid-connect/auth?client_id=magic-user&response_type=code&redirect_uri=http://localhost:5200/signin-oidc&scope=openid%20profile%20email
3. Should trigger Browser Flow
4. Enter: magictest / Magic123!
5. Should redirect back with authorization code
```

### Test Direct Grant Flow
```
POST http://localhost:8081/realms/sso-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&
client_id=magic-user&
client_secret=kl3XReMn0qbl1OuE7NMsNbUVDaH8pmfS&
username=magictest&
password=Magic123!&
scope=openid profile email
```

## 🛠️ Advanced Flow Configuration

### Conditional Executions
```
1. Add Execution: Conditional OTP
2. Configure conditions:
   - Condition - User Configured: Check if user has OTP
   - OTP Form: Show OTP input if condition met
```

### Custom Authenticators (Advanced)
```
1. Develop custom authenticator JAR
2. Deploy to Keycloak providers folder
3. Add to authentication flow
4. Configure custom logic for magic link validation
```

## ✅ Verification Checklist

### Flow Configuration Check
```
✅ Browser Flow exists and is bound to realm
✅ Direct Grant Flow exists and is enabled
✅ magic-user client has correct flow bindings
✅ Username Password Form is REQUIRED in Browser Flow
✅ All executions have correct requirement levels
```

### Client Integration Check
```
✅ Standard Flow: ON (uses Browser Flow)
✅ Direct Access Grants: ON (uses Direct Grant Flow)  
✅ Valid redirect URIs configured
✅ Client authentication enabled
✅ Client secret matches appsettings.json
```

### User Authentication Check
```
✅ magictest user exists in sso-realm
✅ User has password set (Magic123!)
✅ User is enabled
✅ Email is verified (for magic link)
```

## 🐛 Common Flow Issues

### Authentication Failures
```
❌ "Invalid user credentials"
   → Check user exists and password is correct
   → Verify user is in correct realm (sso-realm)

❌ "Client not found"  
   → Check client_id in authorization URL
   → Verify client exists in correct realm

❌ "Invalid redirect URI"
   → Check redirect_uri matches client configuration
   → Verify Valid redirect URIs in client settings

❌ "Flow execution error"
   → Check flow configuration and execution requirements
   → Verify all required executions are properly configured
```

### Flow Configuration Errors
```
❌ Flow not found
   → Check flow exists and is properly bound
   → Verify realm-level or client-level bindings

❌ Execution failed
   → Check execution configuration
   → Verify requirement levels (REQUIRED/ALTERNATIVE)

❌ Custom flow issues
   → Verify custom authenticators are deployed
   → Check execution order and requirements
```

This configuration uses Keycloak 23.0.7's default flows which work perfectly with your Magic Link application. The Browser Flow handles the standard authentication after magic link validation, while Direct Grant Flow provides backup authentication if needed.