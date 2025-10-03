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
        
        // If user is already authenticated via Keycloak SSO
        if (User.Identity?.IsAuthenticated == true)
        {
            _logger.LogInformation("User already authenticated, redirecting to Dashboard");
            return RedirectToAction("Dashboard");
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

        // If no error and no SSO token, try silent SSO authentication
        if (string.IsNullOrEmpty(error) && string.IsNullOrEmpty(ssoToken))
        {
            _logger.LogInformation("Attempting silent SSO authentication");
            return Challenge(new AuthenticationProperties
            {
                RedirectUri = Url.Action("Dashboard"),
                Parameters = { { "prompt", "none" } }
            }, OpenIdConnectDefaults.AuthenticationScheme);
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

    public IActionResult LoginWithKeycloak()
    {
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Dashboard")
        }, OpenIdConnectDefaults.AuthenticationScheme);
    }
    
    [AllowAnonymous]
    public IActionResult LoginWithAD()
    {
        return View();
    }
    
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> LoginWithAD(string username, string password, string domain = "COMPANY")
    {
        _logger.LogInformation("Attempting Active Directory authentication for user: {Username}", username);
        
        try
        {
            var isAuthenticated = await AuthenticateWithActiveDirectory(username, password, domain);
            
            if (isAuthenticated)
            {
                _logger.LogInformation("AD authentication successful for {Username}", username);
                
                // Get user info from AD
                var userInfo = await GetUserInfoFromAD(username, domain);
                
                // Create authentication claims
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, username),
                    new Claim("preferred_username", username),
                    new Claim("sub", Guid.NewGuid().ToString()),
                    new Claim("email", userInfo.Email ?? $"{username}@{domain.ToLower()}.com"),
                    new Claim("given_name", userInfo.FirstName ?? username),
                    new Claim("family_name", userInfo.LastName ?? "User")
                };
                
                // Add roles based on AD groups or default roles
                var roles = await GetUserRolesFromAD(username, domain);
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
                
                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var principal = new ClaimsPrincipal(identity);
                
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
                
                return RedirectToAction("Dashboard");
            }
            else
            {
                ViewBag.Error = "Invalid Active Directory credentials";
                return View();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AD authentication failed for user: {Username}", username);
            ViewBag.Error = "Active Directory authentication failed. Please check your credentials.";
            return View();
        }
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
        var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        var realmRoles = User.FindAll("realm_access").Select(c => c.Value).ToList();
        userRoles.AddRange(realmRoles);

        // Get all required roles from appsettings
        var allAppRoles = GetAllApplicationRoles();
        var filteredRoles = userRoles.Where(r => allAppRoles.Contains(r)).ToList();
        
        // Check if user has required roles for App3
        var requiredRoles = _configuration.GetSection("SSOSettings:RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
        var hasAccess = requiredRoles.Any(role => filteredRoles.Contains(role));
        
        if (!hasAccess)
        {
            ViewBag.Error = "Access denied. You do not have permission to access Application 3.";
            return View("Index");
        }
        
        var applications = GetAuthorizedApplications(filteredRoles);
        
        // SSO is active if user is authenticated via Keycloak
        var ssoActive = User.Identity?.IsAuthenticated == true;
        
        ViewBag.UserName = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "User";
        ViewBag.Email = User.FindFirst("email")?.Value ?? "No email";
        ViewBag.Applications = applications;
        ViewBag.UserRoles = filteredRoles;
        ViewBag.SSOActive = ssoActive;
        ViewBag.AppName = "Application 3";
        ViewBag.UserId = User.FindFirst("sub")?.Value;

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

    [Authorize]
    public IActionResult AccessApp(string appName)
    {
        var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        var appConfig = _configuration.GetSection($"Applications:{appName}");

        _logger.LogInformation($"AccessApp called for {appName}, User roles: {string.Join(", ", userRoles)}");

        if (appConfig.Exists())
        {
            var requiredRoles = appConfig.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
            var appUrl = appConfig["Url"];

            _logger.LogInformation($"Required roles for {appName}: {string.Join(", ", requiredRoles)}");

            if (User.Identity?.IsAuthenticated == true)
            {
                var ssoToken = GenerateSSOToken();
                return Redirect($"{appUrl}?ssoToken={ssoToken}");
            }
        }

        ViewBag.Error = $"Access denied to {appName}";
        return View("Dashboard");
    }

    private string GenerateSSOToken()
    {
        var tokenData = new
        {
            UserId = User.FindFirst("sub")?.Value,
            Email = User.FindFirst("email")?.Value,
            Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Expiry = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds()
        };

        return Convert.ToBase64String(System.Text.Json.JsonSerializer.SerializeToUtf8Bytes(tokenData));
    }

    private HashSet<string> GetAllApplicationRoles()
    {
        var allRoles = new HashSet<string>();
        
        // Add SSO settings roles
        var ssoRoles = _configuration.GetSection("SSOSettings:RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
        foreach (var role in ssoRoles)
        {
            allRoles.Add(role);
        }
        
        // Add application roles
        var appsConfig = _configuration.GetSection("Applications");
        foreach (var app in appsConfig.GetChildren())
        {
            var requiredRoles = app.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
            foreach (var role in requiredRoles)
            {
                allRoles.Add(role);
            }
        }
        return allRoles;
    }

    private async Task<bool> AuthenticateWithActiveDirectory(string username, string password, string domain)
    {
        try
        {
            // For testing - simulate AD authentication
            // In production, use System.DirectoryServices.AccountManagement
            var validUsers = new Dictionary<string, string>
            {
                { "ad", "AD123!" },
                { "aduser1", "ADPass123!" },
                { "aduser2", "ADPass123!" },
                { "admin", "Admin123!" },
                { "manager", "Manager123!" }
            };
            
            return validUsers.ContainsKey(username.ToLower()) && validUsers[username.ToLower()] == password;
        }
        catch
        {
            return false;
        }
    }
    
    private async Task<(string Email, string FirstName, string LastName)> GetUserInfoFromAD(string username, string domain)
    {
        // Simulate getting user info from AD
        return (Email: $"{username}@{domain.ToLower()}.com", FirstName: username, LastName: "User");
    }
    
    private async Task<List<string>> GetUserRolesFromAD(string username, string domain)
    {
        // Simulate getting roles from AD groups
        var userRoles = new Dictionary<string, List<string>>
        {
            { "ad", new List<string> { "app3-user" } },
            { "aduser1", new List<string> { "app3-user" } },
            { "aduser2", new List<string> { "app3-user" } },
            { "admin", new List<string> { "admin", "app1-user", "app2-user", "app3-user" } },
            { "manager", new List<string> { "manager", "app1-user", "app2-user", "app3-user" } }
        };
        
        return userRoles.ContainsKey(username.ToLower()) ? userRoles[username.ToLower()] : new List<string> { "app3-user" };
    }
    
    private List<ApplicationInfo> GetAuthorizedApplications(List<string> userRoles)
    {
        var applications = new List<ApplicationInfo>();
        var appsConfig = _configuration.GetSection("Applications");

        _logger.LogInformation($"User roles: {string.Join(", ", userRoles)}");

        foreach (var app in appsConfig.GetChildren())
        {
            var requiredRoles = app.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
            _logger.LogInformation($"App {app.Key} requires roles: {string.Join(", ", requiredRoles)}");

            if (app.Key == "App3" && userRoles.Contains("multi-user"))
                continue;

            if (requiredRoles.Any(role => userRoles.Contains(role)))
            {
                applications.Add(new ApplicationInfo
                {
                    Name = app.Key,
                    Url = app["Url"] ?? "",
                    DisplayName = app.Key.Replace("App", "Application ")
                });
            }
        }

        if (!applications.Any() && User.Identity?.IsAuthenticated == true)
        {
            applications.Add(new ApplicationInfo { Name = "App1", Url = "http://localhost:5101", DisplayName = "Application 1" });
            applications.Add(new ApplicationInfo { Name = "App2", Url = "http://localhost:5102", DisplayName = "Application 2" });
        }

        return applications;
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

public class ApplicationInfo
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}