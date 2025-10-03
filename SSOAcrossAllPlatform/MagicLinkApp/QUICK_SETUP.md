# Magic Link App - Quick Setup

## 1. Create Keycloak Client

**In Keycloak Admin Console (`http://localhost:8081`):**

1. **Clients → Create client**
   ```
   Client ID: magic-link-app
   Client type: OpenID Connect
   ```

2. **Capability config**
   ```
   Client authentication: ON
   Authorization: OFF
   Standard flow: ON
   ```

3. **Login settings**
   ```
   Valid redirect URIs: http://localhost:5200/*
   Valid post logout redirect URIs: http://localhost:5200/*
   Web origins: http://localhost:5200
   ```

4. **Credentials tab**
   ```
   Client secret: magic-link-secret-2025
   ```

## 2. Run Magic Link App

```bash
cd MagicLinkApp
dotnet run --urls="http://localhost:5200"
```

## 3. Test Magic Link Flow

1. **Go to:** `http://localhost:5200`
2. **Enter email:** `sandeepkumar1464@gmail.com`
3. **Click:** "Send Magic Link"
4. **Check console logs** for the magic link URL
5. **Copy and paste** the URL in browser
6. **Should authenticate** via Keycloak and redirect to dashboard

## 4. Magic Link Flow

```
User enters email → App generates token → Magic link sent to email
→ User clicks link → App validates token → Redirects to Keycloak
→ Keycloak authenticates → User logged in with SSO active
```

## 5. Test Users

- Any `@gmail.com` or `@company.com` email
- Default: `sandeepkumar1464@gmail.com`

The app is ready to test! The magic link will appear in console logs since email is simulated.