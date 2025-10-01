using KeycloakAuthApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KeycloakAuthApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SSOLoginController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SSOLoginController> _logger;

    public SSOLoginController(AppDbContext context, ILogger<SSOLoginController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get current SSO login credentials
    /// </summary>
    [HttpGet("credentials")]
    [Authorize]
    public async Task<IActionResult> GetCredentials()
    {
        try
        {
            var credentials = await _context.SSOLoginCredentials
                .Where(c => c.IsActive)
                .FirstOrDefaultAsync();

            if (credentials == null)
            {
                // Create default credentials if none exist
                credentials = new SSOLoginCredentials();
                _context.SSOLoginCredentials.Add(credentials);
                await _context.SaveChangesAsync();
            }

            return Ok(new { 
                username = credentials.Username, 
                // Don't return password for security
                lastUpdated = credentials.LastUpdated 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get SSO credentials");
            return BadRequest(new { message = "Failed to get credentials" });
        }
    }

    /// <summary>
    /// Update SSO login credentials after SSO authentication
    /// </summary>
    [HttpPost("update-credentials")]
    [Authorize]
    public async Task<IActionResult> UpdateCredentials([FromBody] UpdateCredentialsRequest request)
    {
        try
        {
            var credentials = await _context.SSOLoginCredentials
                .Where(c => c.IsActive)
                .FirstOrDefaultAsync();

            if (credentials == null)
            {
                credentials = new SSOLoginCredentials
                {
                    Username = request.Username ?? "Asset",
                    Password = request.Password ?? "Admin_123"
                };
                _context.SSOLoginCredentials.Add(credentials);
            }
            else
            {
                credentials.Username = request.Username ?? credentials.Username;
                credentials.Password = request.Password ?? credentials.Password;
                credentials.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("SSO credentials updated for user: {Username}", credentials.Username);

            return Ok(new { 
                message = "Credentials updated successfully",
                username = credentials.Username
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update SSO credentials");
            return BadRequest(new { message = "Failed to update credentials" });
        }
    }

    /// <summary>
    /// Validate SSO login credentials
    /// </summary>
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCredentials([FromBody] LoginRequest request)
    {
        try
        {
            var credentials = await _context.SSOLoginCredentials
                .Where(c => c.IsActive && c.Username == request.Username && c.Password == request.Password)
                .FirstOrDefaultAsync();

            if (credentials != null)
            {
                return Ok(new { 
                    valid = true, 
                    message = "Credentials are valid",
                    username = credentials.Username
                });
            }

            return Ok(new { 
                valid = false, 
                message = "Invalid credentials" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate credentials");
            return BadRequest(new { message = "Validation failed" });
        }
    }
}

public class UpdateCredentialsRequest
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}