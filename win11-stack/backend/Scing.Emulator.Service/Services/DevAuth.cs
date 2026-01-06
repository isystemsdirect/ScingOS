namespace Scing.Emulator.Service.Services;

public static class DevAuth
{
  public const string CanonicalAdminTokenHeader = "X-Scing-Admin-Token";

  public static bool IsAllowed(HttpContext httpContext, IWebHostEnvironment env, IConfiguration config)
  {
    if (env.IsDevelopment())
    {
      // In dev, allow without token if the env var isn't set.
      var token = GetToken(config);
      return string.IsNullOrWhiteSpace(token) || HasToken(httpContext, token);
    }

    // In non-dev, require a token.
    var required = GetToken(config);
    return !string.IsNullOrWhiteSpace(required) && HasToken(httpContext, required);
  }

  private static string? GetToken(IConfiguration config)
  {
    var envVar = config["ScingEmulator:DevTokenEnvVar"] ?? "SCING_EMULATOR_DEV_TOKEN";
    return Environment.GetEnvironmentVariable(envVar);
  }

  private static bool HasToken(HttpContext ctx, string required)
  {
    if (TryGetProvidedToken(ctx, out var provided))
    {
      return string.Equals(provided, required, StringComparison.Ordinal);
    }

    return false;
  }

  private static bool TryGetProvidedToken(HttpContext ctx, out string provided)
  {
    provided = string.Empty;

    // Canonical header.
    if (ctx.Request.Headers.TryGetValue(CanonicalAdminTokenHeader, out var v1) && !string.IsNullOrWhiteSpace(v1.ToString()))
    {
      provided = v1.ToString();
      return true;
    }

    // Optional back-compat headers.
    if (ctx.Request.Headers.TryGetValue("X-Scing-Dev-Token", out var v2) && !string.IsNullOrWhiteSpace(v2.ToString()))
    {
      provided = v2.ToString();
      return true;
    }

    if (ctx.Request.Headers.TryGetValue("x-bdk-token", out var v3) && !string.IsNullOrWhiteSpace(v3.ToString()))
    {
      provided = v3.ToString();
      return true;
    }

    return false;
  }
}
