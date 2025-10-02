using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace App3.Controllers;

public class HomeController : Controller
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HomeController> _logger;

    public HomeController(IConfiguration configuration, ILogger<HomeController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<IActionResult> Index(string? ssoToken, string? error)
    {
        _logger.LogInformation("App3 Index accessed. User authenticated: {IsAuthenticated}", User.Identity?.IsAuthenticated);
        
        // If user is already authenticated via Keycloak SSO, show App3 home page directly
        if (User.Identity?.IsAuthenticated == true)
        {
            _logger.LogInformation("User already authenticated, redirecting to App3Home");
            ViewBag.SSOActive = true;
            return View("App3Home");
        }

        // Check SSO status
        var ssoStatus = await CheckSSOStatus();
        ViewBag.SSOActive = ssoStatus;
        ViewBag.KeycloakAvailable = await IsKeycloakAvailable();
        
        // If there was an authentication error (silent auth failed), show login options
        if (!string.IsNullOrEmpty(error))
        {
            _logger.LogWarning("Authentication error: {Error}", error);
            ViewBag.Error = "SSO authentication failed. Please use Active Directory login.";
            ViewBag.SSOActive = false;
            return View();
        }

        // If SSO is available, try silent authentication
        if (ViewBag.KeycloakAvailable && string.IsNullOrEmpty(error))
        {
            try
            {
                _logger.LogInformation("Attempting silent SSO authentication check");
                return Challenge(new AuthenticationProperties
                {
                    RedirectUri = Url.Action("Index"),
                    Parameters = { { "prompt", "none" } }
                }, OpenIdConnectDefaults.AuthenticationScheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SSO silent authentication failed");
                ViewBag.SSOActive = false;
            }
        }
        
        return View();
    }

    public IActionResult Login()
    {
        // Show App3 login page
        return View();
    }

    [HttpPost]
    public IActionResult AuthenticateApp3(string username, string password)
    {
        _logger.LogInformation("Local authentication attempt for user: {Username}", username);
        
        // Local authentication for App3 (fallback when Keycloak unavailable)
        // Accept same users as Keycloak SSO
        var validCredentials = new Dictionary<string, string>
        {
            { "admin", "Admin123!" },
            { "app3-test", "Test123!" },
            { "multi-user", "Multi123!" },
            { "manager", "Manager123!" },
            { "app3user", "App3Pass123" } // Legacy fallback
        };
        
        if (validCredentials.ContainsKey(username) && validCredentials[username] == password)
        {
            _logger.LogInformation("Local authentication successful for {Username}", username);
            
            // Create local authentication claims to simulate SSO user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
                new Claim("preferred_username", username),
                new Claim("sub", Guid.NewGuid().ToString()),
                new Claim("email", $"{username}@ssoplatform.com")
            };
            
            // Add appropriate roles based on user
            switch (username)
            {
                case "admin":
                    claims.AddRange(new[] {
                        new Claim(ClaimTypes.Role, "admin"),
                        new Claim(ClaimTypes.Role, "app1-user"),
                        new Claim(ClaimTypes.Role, "app2-user"),
                        new Claim(ClaimTypes.Role, "app3-user")
                    });
                    break;
                case "app3-test":
                case "app3user":
                    claims.Add(new Claim(ClaimTypes.Role, "app3-user"));
                    break;
                case "multi-user":
                    claims.AddRange(new[] {
                        new Claim(ClaimTypes.Role, "app1-user"),
                        new Claim(ClaimTypes.Role, "app2-user")
                    });
                    break;
                case "manager":
                    claims.AddRange(new[] {
                        new Claim(ClaimTypes.Role, "app1-user"),
                        new Claim(ClaimTypes.Role, "app2-user"),
                        new Claim(ClaimTypes.Role, "app3-user")
                    });
                    break;
            }
            
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);
            
            HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
            
            return RedirectToAction("Dashboard");
        }
        
        _logger.LogWarning("Local authentication failed for user: {Username}", username);
        ViewBag.Error = "Invalid username or password";
        return View("Login");
    }

    public async Task<IActionResult> LoginWithAD()
    {
        _logger.LogInformation("Initiating Active Directory authentication via Keycloak");
        
        // Check if Keycloak is available
        if (!await IsKeycloakAvailable())
        {
            ViewBag.Error = "Keycloak authentication service is unavailable. Please try again later.";
            ViewBag.SSOActive = false;
            ViewBag.KeycloakAvailable = false;
            return View("Index");
        }
        
        _logger.LogInformation("Redirecting to Keycloak for IDP authentication");
        
        // Keycloak will handle IDP redirection (AD/Google/Microsoft 365)
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("AuthenticationCallback"),
            Parameters = {
                { "kc_idp_hint", "ldap" }, // Hint for Active Directory
                { "prompt", "login" } // Force authentication
            }
        }, OpenIdConnectDefaults.AuthenticationScheme);
    }
    
    public async Task<IActionResult> AuthenticationCallback()
    {
        _logger.LogInformation("Authentication callback received from Keycloak");
        
        if (User.Identity?.IsAuthenticated == true)
        {
            _logger.LogInformation("User successfully authenticated via Keycloak IDP");
            
            // Log authentication details
            var userId = User.FindFirst("sub")?.Value;
            var username = User.FindFirst("preferred_username")?.Value;
            var email = User.FindFirst("email")?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            
            _logger.LogInformation("Authenticated user - ID: {UserId}, Username: {Username}, Email: {Email}, Roles: {Roles}", 
                userId, username, email, string.Join(", ", roles));
            
            // Check if user has required roles for App3
            var requiredRoles = _configuration.GetSection("SSOSettings:RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
            var hasAccess = requiredRoles.Any(role => roles.Contains(role));
            
            if (hasAccess)
            {
                _logger.LogInformation("User has required roles for App3 access");
                return RedirectToAction("Dashboard");
            }
            else
            {
                _logger.LogWarning("User does not have required roles for App3 access. Required: {RequiredRoles}, User has: {UserRoles}", 
                    string.Join(", ", requiredRoles), string.Join(", ", roles));
                ViewBag.Error = "Access denied. You do not have permission to access Application 3.";
                return View("Index");
            }
        }
        else
        {
            _logger.LogWarning("Authentication callback received but user is not authenticated");
            ViewBag.Error = "Authentication failed. Please try again.";
            return View("Index");
        }
    }
    
    private async Task<bool> IsKeycloakAvailable()
    {
        try
        {
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(5);
            var response = await httpClient.GetAsync("http://localhost:8081/realms/sso-realm/.well-known/openid-configuration");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
    
    private async Task<bool> CheckSSOStatus()
    {
        try
        {
            // Check if there's an active SSO session by looking for SSO cookies
            var ssoSessionCookie = Request.Cookies["KEYCLOAK_SESSION"];
            var hasActiveSession = !string.IsNullOrEmpty(ssoSessionCookie);
            
            // Also check if Keycloak is available
            var keycloakAvailable = await IsKeycloakAvailable();
            
            return hasActiveSession && keycloakAvailable;
        }
        catch
        {
            return false;
        }
    }

    [Authorize]
    public IActionResult Dashboard()
    {
        _logger.LogInformation("User accessing App3 Dashboard");
        
        // Extract user information from Keycloak claims
        var userId = User.FindFirst("sub")?.Value;
        var username = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "Unknown User";
        var email = User.FindFirst("email")?.Value ?? "No email";
        var firstName = User.FindFirst("given_name")?.Value;
        var lastName = User.FindFirst("family_name")?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        
        // Get authentication method used
        var authMethod = User.FindFirst("auth_method")?.Value ?? "Keycloak SSO";
        var idpUsed = User.FindFirst("identity_provider")?.Value ?? "Unknown IDP";
        
        ViewBag.UserName = username;
        ViewBag.Email = email;
        ViewBag.FirstName = firstName;
        ViewBag.LastName = lastName;
        ViewBag.Roles = roles;
        ViewBag.AppName = "Application 3";
        ViewBag.UserId = userId;
        ViewBag.AuthMethod = authMethod;
        ViewBag.IdentityProvider = idpUsed;
        ViewBag.SSOActive = true;
        
        // Log successful access
        _logger.LogInformation("User {Username} ({UserId}) successfully accessed App3 Dashboard via {AuthMethod}", 
            username, userId, authMethod);
        
        return View();
    }

    [Authorize(Policy = "App3Access")]
    public IActionResult Features()
    {
        return View();
    }

    public async Task<IActionResult> Logout()
    {
        _logger.LogInformation("User logging out from App3");
        
        // Clear local cookies first
        foreach (var cookie in Request.Cookies.Keys)
        {
            Response.Cookies.Delete(cookie);
        }
        
        // Sign out from both local cookies and Keycloak
        return SignOut(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Index", "Home")
        }, CookieAuthenticationDefaults.AuthenticationScheme, OpenIdConnectDefaults.AuthenticationScheme);
    }

    private async Task<bool> ValidateSSOToken(string ssoToken)
    {
        try
        {
            var tokenBytes = Convert.FromBase64String(ssoToken);
            var tokenJson = System.Text.Encoding.UTF8.GetString(tokenBytes);
            var tokenData = JsonSerializer.Deserialize<SSOTokenData>(tokenJson);

            if (tokenData == null) return false;

            // Check token expiry
            var currentTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (currentTime > tokenData.Expiry) return false;

            // Check if user has required roles
            var requiredRoles = _configuration.GetSection("SSOSettings:RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
            return requiredRoles.Any(role => tokenData.Roles.Contains(role));
        }
        catch
        {
            return false;
        }
    }
}

public class SSOTokenData
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string[] Roles { get; set; } = Array.Empty<string>();
    public long Timestamp { get; set; }
    public long Expiry { get; set; }
}