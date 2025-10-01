using KeycloakAuthApp.Configuration;
using KeycloakAuthApp.Models;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KeycloakAuthApp.Services;

public interface IKeycloakService
{
    Task<string> GetAdminTokenAsync();
    Task<User> CreateUserAsync(UserRegistrationRequest request);
    Task<User?> GetUserByEmailAsync(string email);
    Task<List<User>> GetUsersAsync();
    Task<bool> AssignRoleToUserAsync(string userId, string roleName);
    Task<string> GenerateMagicLinkAsync(string email, string redirectUri);
    Task<bool> MigrateUserFromIdpAsync(User user, string sourceIdp);
    Task<List<string>> GetUserRolesAsync(string userId);
    Task<bool> EnableSSOAsync(SSOConfiguration config);
}

public class KeycloakService : IKeycloakService
{
    private readonly HttpClient _httpClient;
    private readonly KeycloakSettings _settings;
    private readonly ILogger<KeycloakService> _logger;

    public KeycloakService(HttpClient httpClient, IOptions<KeycloakSettings> settings, ILogger<KeycloakService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> GetAdminTokenAsync()
    {
        var tokenEndpoint = $"{_settings.BaseUrl}/realms/{_settings.Realm}/protocol/openid-connect/token";
        
        var parameters = new Dictionary<string, string>
        {
            {"grant_type", "password"},
            {"client_id", _settings.ClientId},
            {"client_secret", _settings.ClientSecret},
            {"username", _settings.AdminUsername},
            {"password", _settings.AdminPassword}
        };

        var content = new FormUrlEncodedContent(parameters);
        var response = await _httpClient.PostAsync(tokenEndpoint, content);
        
        if (response.IsSuccessStatusCode)
        {
            var jsonResponse = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
            return tokenResponse.GetProperty("access_token").GetString() ?? string.Empty;
        }

        throw new Exception("Failed to obtain admin token");
    }

    public async Task<User> CreateUserAsync(UserRegistrationRequest request)
    {
        var token = await GetAdminTokenAsync();
        var endpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/users";

        var keycloakUser = new
        {
            username = request.Username,
            email = request.Email,
            firstName = request.FirstName,
            lastName = request.LastName,
            enabled = true,
            emailVerified = false,
            credentials = new[]
            {
                new
                {
                    type = "password",
                    value = request.Password,
                    temporary = false
                }
            }
        };

        var json = JsonSerializer.Serialize(keycloakUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.PostAsync(endpoint, content);
        
        if (response.IsSuccessStatusCode)
        {
            var locationHeader = response.Headers.Location?.ToString();
            var userId = locationHeader?.Split('/').Last();
            
            var user = new User
            {
                Id = userId ?? Guid.NewGuid().ToString(),
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Roles = request.Roles
            };

            // Assign roles if specified
            foreach (var role in request.Roles)
            {
                await AssignRoleToUserAsync(user.Id, role);
            }

            return user;
        }

        throw new Exception("Failed to create user in Keycloak");
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        var token = await GetAdminTokenAsync();
        var endpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/users?email={email}";

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.GetAsync(endpoint);
        
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            var users = JsonSerializer.Deserialize<JsonElement[]>(json);
            
            if (users.Length > 0)
            {
                var userElement = users[0];
                return new User
                {
                    Id = userElement.GetProperty("id").GetString() ?? string.Empty,
                    Username = userElement.GetProperty("username").GetString() ?? string.Empty,
                    Email = userElement.GetProperty("email").GetString() ?? string.Empty,
                    FirstName = userElement.TryGetProperty("firstName", out var fn) ? fn.GetString() ?? string.Empty : string.Empty,
                    LastName = userElement.TryGetProperty("lastName", out var ln) ? ln.GetString() ?? string.Empty : string.Empty,
                    EmailVerified = userElement.TryGetProperty("emailVerified", out var ev) && ev.GetBoolean(),
                    Enabled = userElement.TryGetProperty("enabled", out var en) && en.GetBoolean()
                };
            }
        }

        return null;
    }

    public async Task<List<User>> GetUsersAsync()
    {
        var token = await GetAdminTokenAsync();
        var endpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/users";

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.GetAsync(endpoint);
        var users = new List<User>();
        
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            var userElements = JsonSerializer.Deserialize<JsonElement[]>(json);
            
            foreach (var userElement in userElements)
            {
                users.Add(new User
                {
                    Id = userElement.GetProperty("id").GetString() ?? string.Empty,
                    Username = userElement.GetProperty("username").GetString() ?? string.Empty,
                    Email = userElement.TryGetProperty("email", out var email) ? email.GetString() ?? string.Empty : string.Empty,
                    FirstName = userElement.TryGetProperty("firstName", out var fn) ? fn.GetString() ?? string.Empty : string.Empty,
                    LastName = userElement.TryGetProperty("lastName", out var ln) ? ln.GetString() ?? string.Empty : string.Empty,
                    EmailVerified = userElement.TryGetProperty("emailVerified", out var ev) && ev.GetBoolean(),
                    Enabled = userElement.TryGetProperty("enabled", out var en) && en.GetBoolean()
                });
            }
        }

        return users;
    }

    public async Task<bool> AssignRoleToUserAsync(string userId, string roleName)
    {
        var token = await GetAdminTokenAsync();
        
        // Get role by name
        var roleEndpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/roles/{roleName}";
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var roleResponse = await _httpClient.GetAsync(roleEndpoint);
        if (!roleResponse.IsSuccessStatusCode) return false;
        
        var roleJson = await roleResponse.Content.ReadAsStringAsync();
        var role = JsonSerializer.Deserialize<JsonElement>(roleJson);
        
        // Assign role to user
        var assignEndpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/users/{userId}/role-mappings/realm";
        var roleAssignment = new[]
        {
            new
            {
                id = role.GetProperty("id").GetString(),
                name = role.GetProperty("name").GetString()
            }
        };
        
        var content = new StringContent(JsonSerializer.Serialize(roleAssignment), Encoding.UTF8, "application/json");
        var assignResponse = await _httpClient.PostAsync(assignEndpoint, content);
        
        return assignResponse.IsSuccessStatusCode;
    }

    public async Task<string> GenerateMagicLinkAsync(string email, string redirectUri)
    {
        // Generate a secure token for magic link
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        var magicLink = $"{redirectUri}?token={token}&email={Uri.EscapeDataString(email)}";
        
        // In a real implementation, you would:
        // 1. Store the token with expiration in database/cache
        // 2. Send email with the magic link
        // 3. Validate token when user clicks the link
        
        _logger.LogInformation($"Magic link generated for {email}: {magicLink}");
        return magicLink;
    }

    public async Task<bool> MigrateUserFromIdpAsync(User user, string sourceIdp)
    {
        try
        {
            // Create user in Keycloak with IDP attributes
            var migrationRequest = new UserRegistrationRequest
            {
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Password = Guid.NewGuid().ToString(), // Temporary password
                Roles = user.Roles
            };

            var migratedUser = await CreateUserAsync(migrationRequest);
            
            // Set user attributes to track migration
            var token = await GetAdminTokenAsync();
            var endpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/users/{migratedUser.Id}";
            
            var updateData = new
            {
                attributes = new Dictionary<string, string[]>
                {
                    {"migrated_from", new[] {sourceIdp}},
                    {"migration_date", new[] {DateTime.UtcNow.ToString("O")}}
                }
            };
            
            var content = new StringContent(JsonSerializer.Serialize(updateData), Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            
            var response = await _httpClient.PutAsync(endpoint, content);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to migrate user {user.Email} from {sourceIdp}");
            return false;
        }
    }

    public async Task<List<string>> GetUserRolesAsync(string userId)
    {
        var token = await GetAdminTokenAsync();
        var endpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/users/{userId}/role-mappings/realm";

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.GetAsync(endpoint);
        var roles = new List<string>();
        
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            var roleElements = JsonSerializer.Deserialize<JsonElement[]>(json);
            
            roles.AddRange(roleElements.Select(role => role.GetProperty("name").GetString() ?? string.Empty));
        }

        return roles;
    }

    public async Task<bool> EnableSSOAsync(SSOConfiguration config)
    {
        var token = await GetAdminTokenAsync();
        var endpoint = $"{_settings.BaseUrl}/admin/realms/{_settings.Realm}/identity-provider/instances";

        var idpConfig = new
        {
            alias = config.ProviderName.ToLower(),
            providerId = config.ProviderType.ToLower(),
            enabled = true,
            config = new Dictionary<string, string>
            {
                {"clientId", config.ClientId},
                {"clientSecret", config.ClientSecret},
                {"authorizationUrl", config.AuthorizationUrl},
                {"tokenUrl", config.TokenUrl},
                {"userInfoUrl", config.UserInfoUrl}
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(idpConfig), Encoding.UTF8, "application/json");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.PostAsync(endpoint, content);
        return response.IsSuccessStatusCode;
    }
}