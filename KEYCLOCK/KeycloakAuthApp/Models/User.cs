using System.ComponentModel.DataAnnotations;

namespace KeycloakAuthApp.Models;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool EmailVerified { get; set; } = false;
    public bool Enabled { get; set; } = true;
    public DateTime CreatedTimestamp { get; set; } = DateTime.UtcNow;
    public List<string> Roles { get; set; } = new();
    public Dictionary<string, object> Attributes { get; set; } = new();
}

public class UserRegistrationRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
    
    public List<string> Roles { get; set; } = new();
}

public class MagicLinkRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string RedirectUri { get; set; } = string.Empty;
}

public class SSOConfiguration
{
    public string ProviderName { get; set; } = string.Empty;
    public string ProviderType { get; set; } = string.Empty; // Azure, Okta, Google
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string AuthorizationUrl { get; set; } = string.Empty;
    public string TokenUrl { get; set; } = string.Empty;
    public string UserInfoUrl { get; set; } = string.Empty;
    public Dictionary<string, string> AttributeMapping { get; set; } = new();
}