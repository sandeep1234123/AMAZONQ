using KeycloakAuthApp.Models;
using KeycloakAuthApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeycloakAuthApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class UserManagementController : ControllerBase
{
    private readonly IKeycloakService _keycloakService;
    private readonly ILogger<UserManagementController> _logger;

    public UserManagementController(IKeycloakService keycloakService, ILogger<UserManagementController> logger)
    {
        _keycloakService = keycloakService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await _keycloakService.GetUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get users");
            return BadRequest(new { message = "Failed to get users", error = ex.Message });
        }
    }

    /// <summary>
    /// Get user by email
    /// </summary>
    [HttpGet("users/{email}")]
    public async Task<IActionResult> GetUserByEmail(string email)
    {
        try
        {
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
            _logger.LogError(ex, "Failed to get user {Email}", email);
            return BadRequest(new { message = "Failed to get user", error = ex.Message });
        }
    }

    /// <summary>
    /// Assign role to user
    /// </summary>
    [HttpPost("users/{userId}/roles/{roleName}")]
    public async Task<IActionResult> AssignRole(string userId, string roleName)
    {
        try
        {
            var success = await _keycloakService.AssignRoleToUserAsync(userId, roleName);
            if (success)
            {
                return Ok(new { message = $"Role {roleName} assigned to user successfully" });
            }
            return BadRequest(new { message = "Failed to assign role" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to assign role {RoleName} to user {UserId}", roleName, userId);
            return BadRequest(new { message = "Failed to assign role", error = ex.Message });
        }
    }

    /// <summary>
    /// Get user roles
    /// </summary>
    [HttpGet("users/{userId}/roles")]
    public async Task<IActionResult> GetUserRoles(string userId)
    {
        try
        {
            var roles = await _keycloakService.GetUserRolesAsync(userId);
            return Ok(new { userId, roles });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get roles for user {UserId}", userId);
            return BadRequest(new { message = "Failed to get user roles", error = ex.Message });
        }
    }

    /// <summary>
    /// Migrate user from external IDP
    /// </summary>
    [HttpPost("migrate")]
    public async Task<IActionResult> MigrateUser([FromBody] User user, [FromQuery] string sourceIdp)
    {
        try
        {
            var success = await _keycloakService.MigrateUserFromIdpAsync(user, sourceIdp);
            if (success)
            {
                return Ok(new { message = $"User migrated successfully from {sourceIdp}" });
            }
            return BadRequest(new { message = "Failed to migrate user" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate user {Email} from {SourceIdp}", user.Email, sourceIdp);
            return BadRequest(new { message = "Failed to migrate user", error = ex.Message });
        }
    }
}