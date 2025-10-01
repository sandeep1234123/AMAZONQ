namespace KeycloakAuthApp.Models;

public class SSOLoginCredentials
{
    public int Id { get; set; }
    public string Username { get; set; } = "Asset";
    public string Password { get; set; } = "Admin_123";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUpdated { get; set; }
    public bool IsActive { get; set; } = true;
}