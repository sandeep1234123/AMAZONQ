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
    options.LoginPath = "/Home/Login";
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
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("App2Access", policy =>
        policy.RequireRole("app2-user", "admin"));
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

app.Run();