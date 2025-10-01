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

    public async Task<IActionResult> Index(string? ssoToken)
    {
        // Check if user is already authenticated
        if (User.Identity?.IsAuthenticated == true)
        {
            return View("Dashboard");
        }

        // Check for SSO token from common login
        if (!string.IsNullOrEmpty(ssoToken))
        {
            var isValidToken = await ValidateSSOToken(ssoToken);
            if (isValidToken)
            {
                // Redirect to Keycloak for silent authentication
                return Challenge(new AuthenticationProperties
                {
                    RedirectUri = Url.Action("Dashboard"),
                    Parameters = { { "prompt", "none" } }
                }, OpenIdConnectDefaults.AuthenticationScheme);
            }
        }

        return View();
    }

    public IActionResult Login()
    {
        // Redirect to common login page
        var commonLoginUrl = _configuration["SSOSettings:CommonLoginUrl"];
        return Redirect(commonLoginUrl);
    }

    [Authorize(Policy = "App2Access")]
    public IActionResult Dashboard()
    {
        ViewBag.UserName = User.Identity?.Name;
        ViewBag.Email = User.FindFirst("email")?.Value;
        ViewBag.Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        ViewBag.AppName = "Application 2";
        
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