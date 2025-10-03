using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace MagicLinkApp.Controllers;

public class HomeController : Controller
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HomeController> _logger;
    private static readonly Dictionary<string, MagicLinkToken> _magicTokens = new();

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
    public async Task<IActionResult> SendMagicLink(string email)
    {
        _logger.LogInformation("Magic Link requested for email: {Email}", email);

        if (string.IsNullOrEmpty(email))
        {
            ViewBag.Error = "Please enter a valid email address";
            return View("Index");
        }

        // Check if user exists in Keycloak (simplified check)
        if (!await IsValidUser(email))
        {
            ViewBag.Error = "User not found. Please contact administrator.";
            return View("Index");
        }

        // Generate Magic Link token
        var token = GenerateMagicLinkToken(email);
        var magicLink = $"{_configuration["MagicLink:BaseUrl"]}/Home/VerifyMagicLink?token={token}";

        // Store token temporarily (in production, use Redis/Database)
        _magicTokens[token] = new MagicLinkToken
        {
            Email = email,
            Token = token,
            ExpiryTime = DateTime.UtcNow.AddMinutes(15),
            IsUsed = false
        };

        // Send email (simplified - in production use proper email service)
        await SendMagicLinkEmail(email, magicLink);

        ViewBag.Success = $"Magic Link sent to {email}. Please check your email.";
        ViewBag.Email = email;
        return View("Index");
    }

    public async Task<IActionResult> VerifyMagicLink(string token)
    {
        _logger.LogInformation("Magic Link verification attempt with token: {Token}", token);

        if (string.IsNullOrEmpty(token) || !_magicTokens.ContainsKey(token))
        {
            ViewBag.Error = "Invalid or expired Magic Link";
            return View("Index");
        }

        var magicToken = _magicTokens[token];

        // Validate token
        if (magicToken.IsUsed)
        {
            ViewBag.Error = "Magic Link has already been used";
            return View("Index");
        }

        if (DateTime.UtcNow > magicToken.ExpiryTime)
        {
            ViewBag.Error = "Magic Link has expired";
            return View("Index");
        }

        // Mark token as used
        magicToken.IsUsed = true;

        // Store email for Keycloak authentication
        TempData["MagicLinkEmail"] = magicToken.Email;

        // Redirect to Keycloak for authentication
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Dashboard"),
            Parameters = {
                { "login_hint", magicToken.Email },
                { "prompt", "none" } // Try silent authentication first
            }
        }, OpenIdConnectDefaults.AuthenticationScheme);
    }

    [Authorize]
    public IActionResult Dashboard()
    {
        var userId = User.FindFirst("sub")?.Value;
        var username = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "Unknown User";
        var email = User.FindFirst("email")?.Value ?? "No email";
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        ViewBag.UserName = username;
        ViewBag.Email = email;
        ViewBag.UserId = userId;
        ViewBag.Roles = roles;
        ViewBag.AuthMethod = "Magic Link";

        _logger.LogInformation("User {Username} accessed Magic Link App Dashboard", username);

        return View();
    }

    public async Task<IActionResult> Logout()
    {
        _logger.LogInformation("User logging out from Magic Link App");

        // Clear local cookies
        foreach (var cookie in Request.Cookies.Keys)
        {
            Response.Cookies.Delete(cookie);
        }

        // Sign out from Keycloak
        return SignOut(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Index", "Home")
        }, "Cookies", "OpenIdConnect");
    }

    private string GenerateMagicLinkToken(string email)
    {
        // Generate cryptographically secure token
        using var rng = RandomNumberGenerator.Create();
        var tokenBytes = new byte[32];
        rng.GetBytes(tokenBytes);
        
        var tokenData = new
        {
            Email = email,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Random = Convert.ToBase64String(tokenBytes)
        };

        var tokenJson = JsonSerializer.Serialize(tokenData);
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(tokenJson));
    }

    private async Task<bool> IsValidUser(string email)
    {
        // In production, check against Keycloak API
        // For demo, accept any email with @gmail.com
        return email.Contains("@gmail.com") || email.Contains("@company.com");
    }

    private async Task SendMagicLinkEmail(string email, string magicLink)
    {
        // Simulate email sending (in production, use SendGrid, SMTP, etc.)
        _logger.LogInformation("Magic Link email sent to {Email}: {MagicLink}", email, magicLink);
        
        // For demo purposes, log the magic link
        Console.WriteLine($"=== MAGIC LINK FOR {email} ===");
        Console.WriteLine(magicLink);
        Console.WriteLine("=== COPY AND PASTE IN BROWSER ===");
        
        await Task.CompletedTask;
    }
}

public class MagicLinkToken
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiryTime { get; set; }
    public bool IsUsed { get; set; }
}