using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace App2.Controllers;

public class HomeController : Controller
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HomeController> _logger;

    public HomeController(IConfiguration configuration, ILogger<HomeController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public IActionResult Index(string? ssoToken, string? error)
    {
        // If user is already authenticated via Keycloak SSO, show App2 home page directly
        if (User.Identity?.IsAuthenticated == true)
        {
            return View("App2Home");
        }

        // If there was an authentication error (silent auth failed), show login page
        if (!string.IsNullOrEmpty(error))
        {
            return View();
        }

        // Try silent authentication to check for active SSO session
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Index"),
            Parameters = { { "prompt", "none" } }
        }, OpenIdConnectDefaults.AuthenticationScheme);
    }

    public IActionResult Login()
    {
        // Show App2 login page
        return View();
    }

    [HttpPost]
    public IActionResult AuthenticateApp2(string username, string password)
    {
        // Simple hardcoded authentication for App2
        if (username == "app2user" && password == "App2Pass123")
        {
            // Create local session and redirect to App2 Dashboard
            return RedirectToAction("Dashboard");
        }
        
        ViewBag.Error = "Invalid username or password";
        return View("Login");
    }

    [Authorize]
    public IActionResult Dashboard()
    {
        ViewBag.UserName = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "Unknown User";
        ViewBag.Email = User.FindFirst("email")?.Value ?? "No email";
        ViewBag.Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        ViewBag.AppName = "Application 2";
        ViewBag.UserId = User.FindFirst("sub")?.Value;
        
        return View();
    }

    [Authorize(Policy = "App2Access")]
    public IActionResult Reports()
    {
        return View();
    }

    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        var commonLoginUrl = _configuration["SSOSettings:CommonLoginUrl"];
        return Redirect(commonLoginUrl);
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