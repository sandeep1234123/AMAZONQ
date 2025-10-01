using Microsoft.EntityFrameworkCore;

namespace KeycloakAuthApp.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<MagicLinkToken> MagicLinkTokens { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }
    public DbSet<MigrationLog> MigrationLogs { get; set; }
    public DbSet<SSOLoginCredentials> SSOLoginCredentials { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MagicLinkToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.Email);
            entity.Property(e => e.ExpiresAt).IsRequired();
        });

        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.SessionId).IsUnique();
        });

        modelBuilder.Entity<MigrationLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.SourceIdp);
        });

        modelBuilder.Entity<SSOLoginCredentials>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).HasDefaultValue("Asset");
            entity.Property(e => e.Password).HasDefaultValue("Admin_123");
        });
    }
}

public class MagicLinkToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UserSession
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastAccessedAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class MigrationLog
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SourceIdp { get; set; } = string.Empty;
    public DateTime MigratedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}