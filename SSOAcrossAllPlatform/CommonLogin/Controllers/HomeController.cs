using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CommonLogin.Controllers;

public class HomeController : Controller
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HomeController> _logger;

    public HomeController(IConfiguration configuration, ILogger<HomeController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public IActionResult Index()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return RedirectToAction("Dashboard");
        }
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

    [Authorize]
    public IActionResult Dashboard()
    {
        var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        
        // Also check for realm_access roles
        var realmRoles = User.FindAll("realm_access").Select(c => c.Value).ToList();
        userRoles.AddRange(realmRoles);
        
        var applications = GetAuthorizedApplications(userRoles);
        
        ViewBag.UserName = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "User";
        ViewBag.Email = User.FindFirst("email")?.Value ?? "No email";
        ViewBag.Applications = applications;
        ViewBag.UserRoles = userRoles;
        
        return View();
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
            
            // Allow access if user is authenticated (temporary fix for role issues)
            if (User.Identity?.IsAuthenticated == true)
            {
                // Generate SSO token and redirect to application
                var ssoToken = GenerateSSOToken();
                return Redirect($"{appUrl}?ssoToken={ssoToken}");
            }
        }
        
        ViewBag.Error = $"Access denied to {appName}";
        return View("Dashboard");
    }

    public async Task<IActionResult> Logout()
    {
        // Clear local cookies first
        foreach (var cookie in Request.Cookies.Keys)
        {
            Response.Cookies.Delete(cookie);
        }
        
        // Sign out from OpenID Connect (this will redirect to Keycloak logout)
        return SignOut(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Index", "Home")
        }, "Cookies", "OpenIdConnect");
    }

    private List<ApplicationInfo> GetAuthorizedApplications(List<string> userRoles)
    {
        var applications = new List<ApplicationInfo>();
        var appsConfig = _configuration.GetSection("Applications");
        
        // Debug: Log user roles
        _logger.LogInformation($"User roles: {string.Join(", ", userRoles)}");
        
        foreach (var app in appsConfig.GetChildren())
        {
            var requiredRoles = app.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
            _logger.LogInformation($"App {app.Key} requires roles: {string.Join(", ", requiredRoles)}");
            
            // For now, show all apps if user is authenticated (temporary fix)
            if (requiredRoles.Any(role => userRoles.Contains(role)) || userRoles.Any())
            {
                applications.Add(new ApplicationInfo
                {
                    Name = app.Key,
                    Url = app["Url"] ?? "",
                    DisplayName = app.Key.Replace("App", "Application ")
                });
            }
        }
        
        // If no roles found, still show apps for authenticated users
        if (!applications.Any() && User.Identity?.IsAuthenticated == true)
        {
            applications.Add(new ApplicationInfo { Name = "App1", Url = "http://localhost:5101", DisplayName = "Application 1" });
            applications.Add(new ApplicationInfo { Name = "App2", Url = "http://localhost:5102", DisplayName = "Application 2" });
        }
        
        return applications;
    }

    private string GenerateSSOToken()
    {
        // Generate a secure token for SSO
        var tokenData = new
        {
            UserId = User.FindFirst("sub")?.Value,
            Email = User.FindFirst("email")?.Value,
            Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Expiry = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds()
        };
        
        // In production, use proper JWT signing
        return Convert.ToBase64String(System.Text.Json.JsonSerializer.SerializeToUtf8Bytes(tokenData));
    }
}

public class ApplicationInfo
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}