public IActionResult Dashboard()
{
    var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
    var realmRoles = User.FindAll("realm_access").Select(c => c.Value).ToList();
    userRoles.AddRange(realmRoles);

    // Get all required roles from appsettings
    var allAppRoles = GetAllApplicationRoles();

    // Only keep roles that are defined in appsettings
    var filteredRoles = userRoles
        .Where(r => allAppRoles.Contains(r))
        .ToList();

    var applications = GetAuthorizedApplications(filteredRoles);

    ViewBag.UserName = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "User";
    ViewBag.Email = User.FindFirst("email")?.Value ?? "No email";
    ViewBag.Applications = applications;
    ViewBag.UserRoles = filteredRoles;

    return View();
}

// Helper to get all roles from appsettings
private HashSet<string> GetAllApplicationRoles()
{
    var allRoles = new HashSet<string>();
    var appsConfig = _configuration.GetSection("Applications");
    foreach (var app in appsConfig.GetChildren())
    {
        var requiredRoles = app.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
        foreach (var role in requiredRoles)
        {
            allRoles.Add(role);
        }
    }
    return allRoles;
}

// Helper method to filter applications based on roles
private List<ApplicationInfo> GetAuthorizedApplications(List<string> userRoles)
{
    var applications = new List<ApplicationInfo>();
    var appsConfig = _configuration.GetSection("Applications");

    // Debug: Log user roles
    _logger.LogInformation($"User roles: {string.Join(", ", userRoles)}");

    foreach (var app in appsConfig.GetChildren())
    {
        var requiredRoles = app.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();
        _logger.LogInformation($"App {app.Key} requires roles: {string.Join(", ", requiredRoles)}");

        // Exclude App3 for multi-user role
        if (app.Key == "App3" && userRoles.Contains("multi-user"))
            continue;

        // Show app if user has any required role
        if (requiredRoles.Any(role => userRoles.Contains(role)))
        {
            applications.Add(new ApplicationInfo
            {
                Name = app.Key,
                Url = app["Url"] ?? "",
                DisplayName = app.Key.Replace("App", "Application ")
            });
        }
    }

    // If no roles found, still show apps for authenticated users
    if (!applications.Any() && User.Identity?.IsAuthenticated == true)
    {
        applications.Add(new ApplicationInfo { Name = "App1", Url = "http://localhost:5101", DisplayName = "Application 1" });
        applications.Add(new ApplicationInfo { Name = "App2", Url = "http://localhost:5102", DisplayName = "Application 2" });
    }

    return applications;
}

[Authorize]
public IActionResult AuthenticateApp1()
{
    var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
    var realmRoles = User.FindAll("realm_access").Select(c => c.Value).ToList();
    userRoles.AddRange(realmRoles);

    var appConfig = _configuration.GetSection("Applications:App1");
    var requiredRoles = appConfig.GetSection("RequiredRoles").Get<string[]>() ?? Array.Empty<string>();

    // Check if user has any required role for App1
    if (userRoles.Any(role => requiredRoles.Contains(role)))
    {
        // Optionally, generate SSO token and redirect
        var appUrl = appConfig["Url"];
        // If you use SSO token, generate and append here
        // var ssoToken = GenerateSSOToken();
        // return Redirect($"{appUrl}?ssoToken={ssoToken}");
        return Redirect(appUrl);
    }

    ViewBag.Error = "Access denied to App1";
    return View("Dashboard");
}