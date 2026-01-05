namespace Scing.Emulator.Service.Services;

public static class DevAuth
{
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
    if (!ctx.Request.Headers.TryGetValue("X-Scing-Dev-Token", out var provided))
    {
      return false;
    }

    return string.Equals(provided.ToString(), required, StringComparison.Ordinal);
  }
}
