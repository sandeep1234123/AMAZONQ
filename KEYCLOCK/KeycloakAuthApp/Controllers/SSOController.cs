using KeycloakAuthApp.Models;
using KeycloakAuthApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeycloakAuthApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class SSOController : ControllerBase
{
    private readonly IKeycloakService _keycloakService;
    private readonly ILogger<SSOController> _logger;

    public SSOController(IKeycloakService keycloakService, ILogger<SSOController> logger)
    {
        _keycloakService = keycloakService;
        _logger = logger;
    }

    /// <summary>
    /// Configure Azure AD SSO
    /// </summary>
    [HttpPost("configure/azure")]
    public async Task<IActionResult> ConfigureAzureSSO([FromBody] AzureSSORequest request)
    {
        try
        {
            var config = new SSOConfiguration
            {
                ProviderName = "Azure AD",
                ProviderType = "oidc",
                ClientId = request.ClientId,
                ClientSecret = request.ClientSecret,
                AuthorizationUrl = $"https://login.microsoftonline.com/{request.TenantId}/oauth2/v2.0/authorize",
                TokenUrl = $"https://login.microsoftonline.com/{request.TenantId}/oauth2/v2.0/token",
                UserInfoUrl = "https://graph.microsoft.com/v1.0/me",
                AttributeMapping = new Dictionary<string, string>
                {
                    {"email", "mail"},
                    {"firstName", "givenName"},
                    {"lastName", "surname"},
                    {"username", "userPrincipalName"}
                }
            };

            var success = await _keycloakService.EnableSSOAsync(config);
            if (success)
            {
                return Ok(new { message = "Azure AD SSO configured successfully" });
            }
            return BadRequest(new { message = "Failed to configure Azure AD SSO" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to configure Azure AD SSO");
            return BadRequest(new { message = "Failed to configure Azure AD SSO", error = ex.Message });
        }
    }

    /// <summary>
    /// Configure Okta SSO
    /// </summary>
    [HttpPost("configure/okta")]
    public async Task<IActionResult> ConfigureOktaSSO([FromBody] OktaSSORequest request)
    {
        try
        {
            var config = new SSOConfiguration
            {
                ProviderName = "Okta",
                ProviderType = "oidc",
                ClientId = request.ClientId,
                ClientSecret = request.ClientSecret,
                AuthorizationUrl = $"{request.OktaDomain}/oauth2/default/v1/authorize",
                TokenUrl = $"{request.OktaDomain}/oauth2/default/v1/token",
                UserInfoUrl = $"{request.OktaDomain}/oauth2/default/v1/userinfo",
                AttributeMapping = new Dictionary<string, string>
                {
                    {"email", "email"},
                    {"firstName", "given_name"},
                    {"lastName", "family_name"},
                    {"username", "preferred_username"}
                }
            };

            var success = await _keycloakService.EnableSSOAsync(config);
            if (success)
            {
                return Ok(new { message = "Okta SSO configured successfully" });
            }
            return BadRequest(new { message = "Failed to configure Okta SSO" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to configure Okta SSO");
            return BadRequest(new { message = "Failed to configure Okta SSO", error = ex.Message });
        }
    }

    /// <summary>
    /// Configure Google SSO
    /// </summary>
    [HttpPost("configure/google")]
    public async Task<IActionResult> ConfigureGoogleSSO([FromBody] GoogleSSORequest request)
    {
        try
        {
            var config = new SSOConfiguration
            {
                ProviderName = "Google",
                ProviderType = "oidc",
                ClientId = request.ClientId,
                ClientSecret = request.ClientSecret,
                AuthorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth",
                TokenUrl = "https://oauth2.googleapis.com/token",
                UserInfoUrl = "https://openidconnect.googleapis.com/v1/userinfo",
                AttributeMapping = new Dictionary<string, string>
                {
                    {"email", "email"},
                    {"firstName", "given_name"},
                    {"lastName", "family_name"},
                    {"username", "email"}
                }
            };

            var success = await _keycloakService.EnableSSOAsync(config);
            if (success)
            {
                return Ok(new { message = "Google SSO configured successfully" });
            }
            return BadRequest(new { message = "Failed to configure Google SSO" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to configure Google SSO");
            return BadRequest(new { message = "Failed to configure Google SSO", error = ex.Message });
        }
    }
}

public class AzureSSORequest
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
}

public class OktaSSORequest
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string OktaDomain { get; set; } = string.Empty;
}

public class GoogleSSORequest
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}