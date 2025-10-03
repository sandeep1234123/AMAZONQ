using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace App1.Controllers;

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
        _logger.LogInformation("App1 Index accessed. User authenticated: {IsAuthenticated}", User.Identity?.IsAuthenticated);
        _logger.LogInformation("Cookies present: {Cookies}", string.Join(", ", Request.Cookies.Keys));
        _logger.LogInformation("User claims count: {ClaimsCount}", User.Claims.Count());
        
        if (User.Claims.Any())
        {
            _logger.LogInformation("User claims: {Claims}", string.Join(", ", User.Claims.Select(c => $"{c.Type}:{c.Value}")));
        }
        
        // If user is already authenticated via Keycloak SSO
        if (User.Identity?.IsAuthenticated == true)
        {
            _logger.LogInformation("User already authenticated, redirecting to Dashboard");
            return RedirectToAction("Dashboard");
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

        // Check if SSO token is provided from CommonLogin
        if (!string.IsNullOrEmpty(ssoToken))
        {
            var tokenData = await GetSSOTokenData(ssoToken);
            if (tokenData != null)
            {
                var requiredRoles = _configuration.GetSection("SSOSettings:RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
                var hasAccess = requiredRoles.Any(role => tokenData.Roles.Contains(role));
                
                if (hasAccess)
                {
                    _logger.LogInformation("Valid SSO token with roles: {Roles}", string.Join(", ", tokenData.Roles));
                    TempData["SSOToken"] = ssoToken;
                    
                    // Check if multi-user is in token
                    if (tokenData.Roles.Contains("multi-user"))
                    {
                        ViewBag.MultiUserActive = true;
                        _logger.LogInformation("Multi-user SSO detected in token");
                    }
                    
                    return Challenge(new AuthenticationProperties
                    {
                        RedirectUri = Url.Action("Dashboard")
                    }, OpenIdConnectDefaults.AuthenticationScheme);
                }
                else
                {
                    _logger.LogWarning("SSO token valid but user lacks required roles. Token roles: {TokenRoles}, Required: {RequiredRoles}", 
                        string.Join(", ", tokenData.Roles), string.Join(", ", requiredRoles));
                    ViewBag.Error = "Access denied. You do not have permission to access Application 1.";
                }
            }
            else
            {
                ViewBag.Error = "Invalid or expired SSO token";
            }
        }
        
        if (!string.IsNullOrEmpty(error))
        {
            _logger.LogWarning("Authentication error: {Error}", error);
            ViewBag.Error = "Please login to access Application 1";
        }

        ViewBag.SSOActive = false;
        ViewBag.MultiUserActive = false;
        return View();
    }
    
    [HttpPost]
    public IActionResult Login(string username)
    {
        if (string.IsNullOrEmpty(username))
        {
            ViewBag.Error = "Please enter username or email";
            return View("Index");
        }

        // Store username for potential use after authentication
        TempData["Username"] = username;
        
        // Redirect to Keycloak for authentication
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Dashboard")
        }, OpenIdConnectDefaults.AuthenticationScheme);
    }
    
    [HttpPost]
    public IActionResult AuthenticateApp1(string username, string password)
    {
        _logger.LogInformation("Local authentication attempt for user: {Username}", username);
        
        // Local authentication for App1 (fallback when Keycloak unavailable)
        if ((username == "app1user" && password == "App1Pass123") ||
            (username == "multiuser" && password == "Multi123!") ||
            (username == "manager" && password == "Manager123!"))
        {
            _logger.LogInformation("Local authentication successful for {Username}", username);
            
            // Set user roles based on username
            var roles = new List<string>();
            if (username == "app1user") roles.Add("app1-user");
            if (username == "multiuser") roles.Add("multi-user");
            if (username == "manager") roles.Add("manager");
            
            // Create local session (simplified)
            ViewBag.UserName = username;
            ViewBag.UserRoles = roles;
            ViewBag.SSOActive = false;
            ViewBag.AppName = "Application 1";
            ViewBag.Email = $"{username}@company.com";
            
            return View("Dashboard");
        }
        
        _logger.LogWarning("Local authentication failed for user: {Username}", username);
        ViewBag.Error = "Invalid username or password";
        return View("Index");
    }

    [Authorize]
    public IActionResult Dashboard(string? ssoToken)
    {
        
        var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        var realmRoles = User.FindAll("realm_access").Select(c => c.Value).ToList();
        userRoles.AddRange(realmRoles);

        // Log all user roles for debugging
        _logger.LogInformation("All user roles: {AllRoles}", string.Join(", ", userRoles));
        
        // Get all required roles from appsettings
        var allAppRoles = GetAllApplicationRoles();
        _logger.LogInformation("All app roles: {AllAppRoles}", string.Join(", ", allAppRoles));

        // Only keep roles that are defined in appsettings
        var filteredRoles = userRoles
            .Where(r => allAppRoles.Contains(r))
            .ToList();
            
        _logger.LogInformation("Filtered roles: {FilteredRoles}", string.Join(", ", filteredRoles));

        // Check if user has required roles for App1
        var requiredRoles = _configuration.GetSection("SSOSettings:RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
        var hasAccess = requiredRoles.Any(role => filteredRoles.Contains(role));
        
        if (!hasAccess)
        {
            ViewBag.Error = "Access denied. You do not have permission to access Application 1.";
            return View("Index");
        }

        var applications = GetAuthorizedApplications(filteredRoles);
        
        // SSO is active if user is authenticated via Keycloak or has SSO token
        var ssoActive = User.Identity?.IsAuthenticated == true;
        var ssoSource = !string.IsNullOrEmpty(ssoToken) ? "Common Login Portal" : "Direct Keycloak";

        ViewBag.UserName = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "User";
        ViewBag.Email = User.FindFirst("email")?.Value ?? "No email";
        ViewBag.Applications = applications;
        ViewBag.UserRoles = filteredRoles;
        ViewBag.SSOActive = ssoActive;
        ViewBag.SSOSource = ssoSource;
        ViewBag.AppName = "Application 1";
        ViewBag.UserId = User.FindFirst("sub")?.Value;

        return View();
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

    [Authorize]
    public IActionResult AccessApp(string appName)
    {
        var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        var ssoSettings = _configuration.GetSection("SSOSettings");
        var ssoRoles = ssoSettings.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
        var appConfig = _configuration.GetSection($"Applications:{appName}");

        _logger.LogInformation($"AccessApp called for {appName}, User roles: {string.Join(", ", userRoles)}");

        if (appConfig.Exists())
        {
            var requiredRoles = appConfig.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
            var appUrl = appConfig["Url"];

            _logger.LogInformation($"Required roles for {appName}: {string.Join(", ", requiredRoles)}");

            // SSO is active only if user has any SSO role
            if (userRoles.Any(role => ssoRoles.Contains(role)))
            {
                var ssoToken = GenerateSSOToken();
                return Redirect($"{appUrl}?ssoToken={ssoToken}");
            }
        }

        ViewBag.Error = $"Access denied to {appName}";
        return View("Dashboard");
    }

    public IActionResult LoginWithKeycloak()
    {
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Dashboard")
        }, OpenIdConnectDefaults.AuthenticationScheme);
    }
    
    public IActionResult LoginWithAD()
    {
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Dashboard"),
            Parameters = 
            {
                { "kc_idp_hint", "ldap" },
                { "prompt", "login" }
            }
        }, OpenIdConnectDefaults.AuthenticationScheme);
    }
    
    public async Task<IActionResult> Logout()
    {
        foreach (var cookie in Request.Cookies.Keys)
        {
            Response.Cookies.Delete(cookie);
        }

        return SignOut(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Index", "Home")
        }, "Cookies", "OpenIdConnect");
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
    
    private async Task<bool> ValidateSSOToken(string ssoToken)
    {
        var tokenData = await GetSSOTokenData(ssoToken);
        if (tokenData == null) return false;
        
        var requiredRoles = _configuration.GetSection("SSOSettings:RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
        return requiredRoles.Any(role => tokenData.Roles.Contains(role));
    }
    
    private async Task<SSOTokenData?> GetSSOTokenData(string ssoToken)
    {
        try
        {
            var tokenBytes = Convert.FromBase64String(ssoToken);
            var tokenJson = System.Text.Encoding.UTF8.GetString(tokenBytes);
            var tokenData = System.Text.Json.JsonSerializer.Deserialize<SSOTokenData>(tokenJson);

            if (tokenData == null) return null;

            // Check token expiry
            var currentTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (currentTime > tokenData.Expiry) 
            {
                _logger.LogWarning("SSO token expired. Current: {Current}, Expiry: {Expiry}", currentTime, tokenData.Expiry);
                return null;
            }

            return tokenData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse SSO token");
            return null;
        }
    }
}

public class ApplicationInfo
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class SSOTokenData
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string[] Roles { get; set; } = Array.Empty<string>();
    public long Timestamp { get; set; }
    public long Expiry { get; set; }
}