using KeycloakAuthApp.Configuration;
using KeycloakAuthApp.Models;
using KeycloakAuthApp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add configuration
builder.Services.Configure<KeycloakSettings>(builder.Configuration.GetSection("Keycloak"));

// Add PostgreSQL database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddControllers();
builder.Services.AddHttpClient<IKeycloakService, KeycloakService>();
builder.Services.AddScoped<IKeycloakService, KeycloakService>();

// Add Keycloak JWT Authentication
var keycloakSettings = builder.Configuration.GetSection("Keycloak").Get<KeycloakSettings>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = keycloakSettings?.Authority;
        options.Audience = keycloakSettings?.ClientId;
        options.RequireHttpsMetadata = keycloakSettings?.RequireHttpsMetadata ?? false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = keycloakSettings?.ValidateIssuer ?? true,
            ValidateAudience = keycloakSettings?.ValidateAudience ?? false,
            ValidateLifetime = keycloakSettings?.ValidateLifetime ?? true,
            ValidateIssuerSigningKey = keycloakSettings?.ValidateIssuerSigningKey ?? true,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = "preferred_username"
        };
    });

builder.Services.AddAuthorization();

// Add Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Keycloak Auth API", 
        Version = "v1",
        Description = "Comprehensive Keycloak Authentication API with SSO, Magic Links, and User Management"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Keycloak Auth API v1");
        c.RoutePrefix = "swagger"; // Serve Swagger UI at /swagger
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow })
    .WithName("HealthCheck")
    .WithTags("Health");

app.Run();