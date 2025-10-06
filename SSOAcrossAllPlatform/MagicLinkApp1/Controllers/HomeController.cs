using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MagicLinkApp.Services;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace MagicLinkApp.Controllers;

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
    public IActionResult SendMagicLink(string email)
    {
        _logger.LogInformation("Magic Link requested for email: {Email}", email);

        if (string.IsNullOrEmpty(email))
        {
            ViewBag.Error = "Please enter a valid email address";
            return View("Index");
        }

        // Redirect to Keycloak to initiate the magic link flow
        // Keycloak will handle user existence, magic link generation, and email sending.
        var keycloakAuthority = _configuration["Keycloak:Authority"];
        var keycloakClientId = _configuration["Keycloak:ClientId"];
        var redirectUri = Url.Action("Dashboard", "Home", null, Request.Scheme); // Where Keycloak redirects after successful auth

        // Construct the Keycloak authorization URL for magic link flow
        // This assumes Keycloak is configured to handle a 'login_hint' and potentially a custom 'kc_action' or 'acr_values'
        // to trigger a magic link flow. The exact parameters might vary based on Keycloak's configuration.
        var authUrl = $"{keycloakAuthority}/protocol/openid-connect/auth" +
                      $"?client_id={keycloakClientId}" +
                      $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                      $"&response_type=code" + // Or 'token' depending on flow
                      $"&scope=openid profile email" +
                      $"&login_hint={Uri.EscapeDataString(email)}" +
                      $"&kc_action=AUTH_MAGIC_LINK"; // Custom action for magic link, might need Keycloak customization

        _logger.LogInformation("Redirecting to Keycloak for Magic Link initiation: {AuthUrl}", authUrl);
        return Redirect(authUrl);
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
        ViewBag.AuthMethod = "Magic Link (via Keycloak)";

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
}
