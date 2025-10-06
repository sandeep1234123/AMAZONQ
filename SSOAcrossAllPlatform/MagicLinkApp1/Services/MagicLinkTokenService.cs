using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace MagicLinkApp.Services;

public class MagicLinkTokenService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<MagicLinkTokenService> _logger;
    private static readonly Dictionary<string, MagicLinkToken> _tokens = new();

    public MagicLinkTokenService(IConfiguration configuration, ILogger<MagicLinkTokenService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string GenerateToken(string email)
    {
        using var rng = RandomNumberGenerator.Create();
        var randomBytes = new byte[32];
        rng.GetBytes(randomBytes);

        var tokenData = new
        {
            Email = email,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Random = Convert.ToBase64String(randomBytes)
        };

        var json = JsonSerializer.Serialize(tokenData);
        var base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        var urlSafeToken = base64.Replace('+', '-').Replace('/', '_').Replace("=", "");

        // Store token
        var expiryMinutes = int.Parse(_configuration["MagicLink:ExpiryMinutes"] ?? "15");
        _tokens[urlSafeToken] = new MagicLinkToken
        {
            Email = email,
            Token = urlSafeToken,
            ExpiryTime = DateTime.UtcNow.AddMinutes(expiryMinutes),
            IsUsed = false
        };

        _logger.LogInformation("Generated token for {Email}, expires at {Expiry}", email, _tokens[urlSafeToken].ExpiryTime);
        return urlSafeToken;
    }

    public TokenValidationResult ValidateToken(string token)
    {
        if (string.IsNullOrEmpty(token))
            return new TokenValidationResult { IsValid = false, Error = "No token provided" };

        // Check if token exists in storage
        if (!_tokens.ContainsKey(token))
            return new TokenValidationResult { IsValid = false, Error = "Token not found or already used" };

        var storedToken = _tokens[token];

        // Check if already used
        if (storedToken.IsUsed)
            return new TokenValidationResult { IsValid = false, Error = "Token already used" };

        // Check expiry
        if (DateTime.UtcNow > storedToken.ExpiryTime)
        {
            _tokens.Remove(token);
            return new TokenValidationResult { IsValid = false, Error = "Token expired" };
        }

        return new TokenValidationResult 
        { 
            IsValid = true, 
            Email = storedToken.Email,
            Token = storedToken
        };
    }

    public bool MarkTokenAsUsed(string token)
    {
        if (_tokens.ContainsKey(token))
        {
            _tokens[token].IsUsed = true;
            return true;
        }
        return false;
    }

    public TokenDebugInfo GetDebugInfo(string token)
    {
        var decodedData = DecodeToken(token);
        return new TokenDebugInfo
        {
            Token = token,
            DecodedData = decodedData,
            ExistsInStorage = _tokens.ContainsKey(token),
            StoredTokensCount = _tokens.Count
        };
    }

    private dynamic? DecodeToken(string token)
    {
        try
        {
            var base64 = token.Replace('-', '+').Replace('_', '/');
            switch (base64.Length % 4)
            {
                case 2: base64 += "=="; break;
                case 3: base64 += "="; break;
            }

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(base64));
            return JsonSerializer.Deserialize<dynamic>(json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to decode token");
            return null;
        }
    }
}

public class MagicLinkToken
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiryTime { get; set; }
    public bool IsUsed { get; set; }
}

public class TokenValidationResult
{
    public bool IsValid { get; set; }
    public string? Error { get; set; }
    public string? Email { get; set; }
    public MagicLinkToken? Token { get; set; }
}

public class TokenDebugInfo
{
    public string Token { get; set; } = string.Empty;
    public dynamic? DecodedData { get; set; }
    public bool ExistsInStorage { get; set; }
    public int StoredTokensCount { get; set; }
}