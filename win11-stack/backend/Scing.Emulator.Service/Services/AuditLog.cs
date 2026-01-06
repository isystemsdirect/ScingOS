using System.Text.Json;

namespace Scing.Emulator.Service.Services;

public sealed class AuditLog
{
  private readonly AppPaths _paths;

  public AuditLog(AppPaths paths)
  {
    _paths = paths;
  }

  public void Write(string action, string outcome, object? details = null, string? pluginId = null, string? correlationId = null)
  {
    _paths.EnsureCreated();

    var fileName = $"audit-{DateTimeOffset.UtcNow:yyyyMMdd}.log";
    var path = Path.Combine(_paths.AuditDir, fileName);

    var entry = new Dictionary<string, object?>
    {
      ["timestamp"] = DateTimeOffset.UtcNow,
      ["action"] = action,
      ["outcome"] = outcome,
      ["pluginId"] = pluginId,
      ["correlationId"] = correlationId,
      ["details"] = details
    };

    var json = JsonSerializer.Serialize(entry, new JsonSerializerOptions(JsonSerializerDefaults.Web));
    File.AppendAllText(path, json + Environment.NewLine);
  }
}
