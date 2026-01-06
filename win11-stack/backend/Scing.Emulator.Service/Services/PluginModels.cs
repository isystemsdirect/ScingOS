using System.Text.Json;

namespace Scing.Emulator.Service.Services;

public sealed record PluginManifest(
  string Id,
  string Name,
  string Version,
  string Entrypoint,
  string Target,
  string[] Capabilities,
  string Description
);

public enum PluginStatus
{
  Installed,
  Enabled,
  Disabled,
  Faulted
}

public sealed record PluginRecord(
  string Id,
  string Name,
  string Version,
  string Description,
  string[] Capabilities,
  PluginStatus Status
);

internal sealed record PluginState(
  string Id,
  bool Enabled
);

internal sealed record PluginsStateFile(
  int Version,
  PluginState[] Plugins
)
{
  public static readonly PluginsStateFile Empty = new(1, Array.Empty<PluginState>());
}

internal static class PluginJson
{
  public static JsonSerializerOptions Options { get; } = new(JsonSerializerDefaults.Web)
  {
    WriteIndented = true
  };
}
