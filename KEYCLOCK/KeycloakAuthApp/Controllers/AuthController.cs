using KeycloakAuthApp.Models;
using KeycloakAuthApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeycloakAuthApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IKeycloakService _keycloakService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IKeycloakService keycloakService, ILogger<AuthController> logger)
    {
        _keycloakService = keycloakService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user in Keycloak
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationRequest request)
    {
        try
        {
            var user = await _keycloakService.CreateUserAsync(request);
            return Ok(new { message = "User registered successfully", userId = user.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register user {Email}", request.Email);
            return BadRequest(new { message = "Registration failed", error = ex.Message });
        }
    }

    /// <summary>
    /// Generate magic link for passwordless login
    /// </summary>
    [HttpPost("magic-link")]
    public async Task<IActionResult> GenerateMagicLink([FromBody] MagicLinkRequest request)
    {
        try
        {
            var user = await _keycloakService.GetUserByEmailAsync(request.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var magicLink = await _keycloakService.GenerateMagicLinkAsync(request.Email, request.RedirectUri);
            return Ok(new { magicLink, message = "Magic link generated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate magic link for {Email}", request.Email);
            return BadRequest(new { message = "Failed to generate magic link", error = ex.Message });
        }
    }

    /// <summary>
    /// Validate magic link token and authenticate user
    /// </summary>
    [HttpGet("magic-link/validate")]
    public async Task<IActionResult> ValidateMagicLink([FromQuery] string token, [FromQuery] string email)
    {
        try
        {
            // In a real implementation, validate the token from database/cache
            // For demo purposes, we'll assume validation is successful
            var user = await _keycloakService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Generate JWT token or redirect to application with auth code
            return Ok(new { message = "Magic link validated successfully", user = user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate magic link for {Email}", email);
            return BadRequest(new { message = "Invalid magic link", error = ex.Message });
        }
    }

    /// <summary>
    /// Get current user profile (requires authentication)
    /// </summary>
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var email = User.FindFirst("email")?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email not found in token" });
            }

            var user = await _keycloakService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var roles = await _keycloakService.GetUserRolesAsync(user.Id);
            user.Roles = roles;

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get user profile");
            return BadRequest(new { message = "Failed to get profile", error = ex.Message });
        }
    }
}