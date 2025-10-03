using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Configure Keycloak Authentication
var keycloakConfig = builder.Configuration.GetSection("Keycloak");

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.Cookie.Name = "CommonLogin.Auth";
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
})
.AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
{
    options.Authority = keycloakConfig["Authority"];
    options.ClientId = keycloakConfig["ClientId"];
    options.ClientSecret = keycloakConfig["ClientSecret"];
    options.RequireHttpsMetadata = false;
    options.CallbackPath = "/signin-oidc";
    options.ResponseType = OpenIdConnectResponseType.Code;
    options.Scope.Clear();
    options.Scope.Add("openid");
    options.Scope.Add("profile");
    options.Scope.Add("email");
    // Remove roles scope as it may not exist in Keycloak
    options.SaveTokens = true;
    options.GetClaimsFromUserInfoEndpoint = true;
    options.SignedOutRedirectUri = "http://localhost:5000";
    options.SignedOutCallbackPath = "/signout-callback-oidc";
    
    options.TokenValidationParameters.NameClaimType = "preferred_username";
    options.TokenValidationParameters.RoleClaimType = "realm_access.roles";
    
    options.Events = new OpenIdConnectEvents
    {
        OnTokenValidated = context =>
        {
            var identity = context.Principal.Identity as System.Security.Claims.ClaimsIdentity;
            
            // Extract roles from realm_access
            var realmAccess = context.Principal.FindFirst("realm_access")?.Value;
            if (!string.IsNullOrEmpty(realmAccess))
            {
                var realmData = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(realmAccess);
                if (realmData.TryGetProperty("roles", out var rolesElement))
                {
                    foreach (var role in rolesElement.EnumerateArray())
                    {
                        identity.AddClaim(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role.GetString()));
                    }
                }
            }
            
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            // Clear any existing authentication cookies
            context.Response.Cookies.Delete("SSO.Auth");
            context.Response.Redirect("/Home/Index?error=auth_failed");
            context.HandleResponse();
            return Task.CompletedTask;
        },
        OnRemoteFailure = context =>
        {
            context.Response.Cookies.Delete("SSO.Auth");
            context.Response.Redirect("/Home/Index?error=remote_failure");
            context.HandleResponse();
            return Task.CompletedTask;
        },
        OnRedirectToIdentityProviderForSignOut = async context =>
        {
            // Add id_token_hint for proper Keycloak logout
            var idToken = await context.HttpContext.GetTokenAsync("id_token");
            if (!string.IsNullOrEmpty(idToken))
            {
                context.ProtocolMessage.IdTokenHint = idToken;
            }
        }
    };
});

builder.Services.AddAuthorization();

// Configure Kestrel server options to fix HTTP 431 error
builder.Services.Configure<Microsoft.AspNetCore.Server.Kestrel.Core.KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestHeadersTotalSize = 65536; // 64KB (increased)
    options.Limits.MaxRequestHeaderCount = 200; // Increased
    options.Limits.MaxRequestLineSize = 16384; // 16KB (increased)
    options.Limits.MaxRequestBufferSize = 1048576; // 1MB
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// app.UseHttpsRedirection(); // Disabled for development
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();