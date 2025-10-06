using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MagicLinkApp.Services;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace MagicLinkApp.Controllers;

public class HomeController : Controller
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HomeController> _logger;
    private readonly MagicLinkTokenService _tokenService;

    public HomeController(IConfiguration configuration, ILogger<HomeController> logger, MagicLinkTokenService tokenService)
    {
        _configuration = configuration;
        _logger = logger;
        _tokenService = tokenService;
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
        var token = _tokenService.GenerateToken(email);
        var magicLink = $"{_configuration["MagicLink:BaseUrl"]}/Home/VerifyMagicLink?token={token}";

        // Send email (simplified - in production use proper email service)
        await SendMagicLinkEmail(email, magicLink);

        ViewBag.Success = $"Magic Link sent to {email}. Please check your email.";
        ViewBag.Email = email;
        return View("Index");
    }

    public async Task<IActionResult> VerifyMagicLink(string token)
    {
        _logger.LogInformation("Magic Link verification attempt with token: {Token}", token);

        var validation = _tokenService.ValidateToken(token);
        if (!validation.IsValid)
        {
            ViewBag.Error = validation.Error;
            return View("Index");
        }

        _tokenService.MarkTokenAsUsed(token);
        _logger.LogInformation("Token validated successfully for email: {Email}", validation.Email);

        TempData["MagicLinkEmail"] = validation.Email;

        // For testing, let's try direct dashboard access first
        if (User.Identity?.IsAuthenticated == true)
        {
            _logger.LogInformation("User already authenticated, redirecting to dashboard");
            return RedirectToAction("Dashboard");
        }

        // TEST MODE: Skip Keycloak and go directly to test dashboard
        if (_configuration["MagicLink:TestMode"] == "true")
        {
            _logger.LogInformation("TEST MODE: Bypassing Keycloak authentication");
            return RedirectToAction("TestDashboard", new { email = validation.Email });
        }

        _logger.LogInformation("Challenging with Keycloak for email: {Email}", validation.Email);
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = Url.Action("Dashboard"),
            Parameters = {
                { "login_hint", validation.Email }
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

    public IActionResult TestDashboard(string email)
    {
        ViewBag.UserName = "Test User";
        ViewBag.Email = email;
        ViewBag.UserId = "test-user-id";
        ViewBag.Roles = new[] { "magic-user" };
        ViewBag.AuthMethod = "Magic Link (Test Mode)";
        ViewBag.TestMode = true;

        _logger.LogInformation("TEST MODE: User {Email} accessed Magic Link Test Dashboard", email);

        return View("Dashboard");
    }

    public IActionResult DebugToken(string token)
    {
        var debugInfo = _tokenService.GetDebugInfo(token);
        return Json(debugInfo);
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



    private async Task<bool> IsValidUser(string email)
    {
        // In production, check against Keycloak API
        // For demo, accept any email with @gmail.com or @company.com
        return email.Contains("@gmail.com") || email.Contains("@company.com");
    }

    private async Task SendMagicLinkEmail(string email, string magicLink)
    {
        try
        {
            using var client = new System.Net.Mail.SmtpClient();
            client.Host = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            client.Port = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            client.EnableSsl = true;
            client.Credentials = new System.Net.NetworkCredential(
                _configuration["Email:Username"],
                _configuration["Email:Password"]
            );

            var message = new System.Net.Mail.MailMessage
            {
                From = new System.Net.Mail.MailAddress(
                    _configuration["Email:FromEmail"] ?? "noreply@magiclink.com",
                    _configuration["Email:FromName"] ?? "Magic Link App"
                ),
                Subject = "Your Magic Link - SSO Platform",
                Body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;'>
                            <h1 style='color: white; margin: 0;'>🔗 Magic Link Authentication</h1>
                        </div>
                        <div style='padding: 30px; background: #f8f9fa;'>
                            <h2 style='color: #2c3e50;'>Hello!</h2>
                            <p style='font-size: 16px; line-height: 1.6; color: #555;'>
                                You requested a magic link to sign in to the SSO Platform. 
                                Click the button below to authenticate securely:
                            </p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{magicLink}' 
                                   style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                          color: white; padding: 15px 30px; text-decoration: none; 
                                          border-radius: 5px; font-weight: bold; display: inline-block;'>
                                    🚀 Sign In with Magic Link
                                </a>
                            </div>
                            <p style='font-size: 14px; color: #777;'>
                                This link will expire in 15 minutes for security reasons.
                                If you didn't request this, please ignore this email.
                            </p>
                            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                            <p style='font-size: 12px; color: #999; text-align: center;'>
                                SSO Platform - Magic Link Authentication<br>
                                This is an automated message, please do not reply.
                            </p>
                        </div>
                    </body>
                    </html>",
                IsBodyHtml = true
            };
            
            message.To.Add(email);
            
            await client.SendMailAsync(message);
            _logger.LogInformation("Magic Link email successfully sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Magic Link email to {Email}", email);
            
            // Fallback: Log the magic link for testing
            Console.WriteLine($"=== EMAIL FAILED - MAGIC LINK FOR {email} ===");
            Console.WriteLine(magicLink);
            Console.WriteLine($"=== TEST URL: http://localhost:5200/Home/TestMagicLink?token={System.Web.HttpUtility.UrlDecode(magicLink.Split("token=")[1])} ===");
            Console.WriteLine("=== COPY AND PASTE IN BROWSER ===");
        }
    }
}

