using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to handle large headers (fix HTTP 431)
builder.Services.Configure<Microsoft.AspNetCore.Server.Kestrel.Core.KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestHeadersTotalSize = 65536; // 64KB
    options.Limits.MaxRequestHeaderCount = 200;
    options.Limits.MaxRequestLineSize = 16384; // 16KB
});

// Add services to the container.
builder.Services.AddControllersWithViews();

// Configure Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.Cookie.Name = "MagicLinkApp.Auth";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
    options.LoginPath = "/Home/Index";
    options.LogoutPath = "/Home/Logout";
})
.AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
{
    var keycloakConfig = builder.Configuration.GetSection("Keycloak");
    
    options.Authority = keycloakConfig["Authority"];
    options.ClientId = keycloakConfig["ClientId"];
    options.ClientSecret = keycloakConfig["ClientSecret"];
    options.ResponseType = keycloakConfig["ResponseType"];
    options.RequireHttpsMetadata = bool.Parse(keycloakConfig["RequireHttpsMetadata"] ?? "false");
    options.SaveTokens = bool.Parse(keycloakConfig["SaveTokens"] ?? "true");
    options.GetClaimsFromUserInfoEndpoint = bool.Parse(keycloakConfig["GetClaimsFromUserInfoEndpoint"] ?? "true");
    
    // Configure scopes
    options.Scope.Clear();
    var scopes = keycloakConfig["Scope"]?.Split(' ') ?? new[] { "openid", "profile", "email" };
    foreach (var scope in scopes)
    {
        options.Scope.Add(scope);
    }
    
    // Map claims
    options.TokenValidationParameters.NameClaimType = "preferred_username";
    options.TokenValidationParameters.RoleClaimType = "realm_access.roles";
    
    // Handle events
    options.Events = new OpenIdConnectEvents
    {
        OnRemoteFailure = context =>
        {
            context.Response.Redirect("/Home/Index?error=authentication_failed");
            context.HandleResponse();
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            // Log successful authentication
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var username = context.Principal?.FindFirst("preferred_username")?.Value;
            logger.LogInformation("Magic Link authentication successful for user: {Username}", username);
            return Task.CompletedTask;
        }
    };
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

app.Run();
