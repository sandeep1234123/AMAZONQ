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
    options.Cookie.Name = "App2.Auth";
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
    options.LoginPath = "/Home/Index";
})
.AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
{
    options.Authority = keycloakConfig["Authority"];
    options.ClientId = keycloakConfig["ClientId"];
    options.ClientSecret = keycloakConfig["ClientSecret"];
    options.RequireHttpsMetadata = bool.Parse(keycloakConfig["RequireHttpsMetadata"] ?? "false");
    options.ResponseType = OpenIdConnectResponseType.Code;
    options.Scope.Clear();
    options.Scope.Add("openid");
    options.Scope.Add("profile");
    options.Scope.Add("email");
    options.Scope.Add("roles");
    options.SaveTokens = true;
    options.GetClaimsFromUserInfoEndpoint = true;
    
    options.TokenValidationParameters.NameClaimType = "preferred_username";
    options.TokenValidationParameters.RoleClaimType = "realm_access.roles";
    
    options.Events = new OpenIdConnectEvents
    {
        OnRemoteFailure = context =>
        {
            if (context.Failure?.Message.Contains("login_required") == true ||
                context.Failure?.Message.Contains("interaction_required") == true)
            {
                context.Response.Redirect("/Home/Index?error=sso_not_active");
                context.HandleResponse();
            }
            return Task.CompletedTask;
        },
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
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("App2Access", policy =>
        policy.RequireRole("app2-user", "admin", "manager", "multi-user"));
});

// Configure Kestrel server options to fix HTTP 431 error
builder.Services.Configure<Microsoft.AspNetCore.Server.Kestrel.Core.KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestHeadersTotalSize = 65536; // 64KB
    options.Limits.MaxRequestHeaderCount = 200;
    options.Limits.MaxRequestLineSize = 16384; // 16KB
    options.Limits.MaxRequestBufferSize = 1048576; // 1MB
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Add route for authenticated users to go directly to Dashboard
app.MapGet("/", async (HttpContext context) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        context.Response.Redirect("/Home/Dashboard");
    }
    else
    {
        context.Response.Redirect("/Home/Index");
    }
    await Task.CompletedTask;
});

// Ensure Keycloak config values are present
if (string.IsNullOrEmpty(keycloakConfig["Authority"]) ||
    string.IsNullOrEmpty(keycloakConfig["ClientId"]) ||
    string.IsNullOrEmpty(keycloakConfig["ClientSecret"]))
{
    throw new Exception("Keycloak configuration is missing required values.");
}

app.Run();