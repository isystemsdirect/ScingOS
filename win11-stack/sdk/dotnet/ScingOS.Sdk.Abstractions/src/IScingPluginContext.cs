using System.Text.Json;

namespace ScingOS.Sdk.Abstractions;

public interface IScingPluginContext
{
  string PluginId { get; }

  IReadOnlyCollection<string> Capabilities { get; }

  void Subscribe(string eventTypePattern);

  Task PublishAsync(JsonElement envelope, CancellationToken ct);

  Task<JsonElement> ReadConfigAsync(CancellationToken ct);

  Task WriteConfigAsync(JsonElement config, CancellationToken ct);

  void LogInfo(string message, string? correlationId = null);

  void LogWarn(string message, string? correlationId = null);

  void LogError(string message, string? correlationId = null);
}
