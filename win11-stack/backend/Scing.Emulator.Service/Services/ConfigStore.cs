using System.Text.Json;

namespace Scing.Emulator.Service.Services;

public sealed class ConfigStore
{
  private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
  {
    WriteIndented = true
  };

  private readonly AppPaths _paths;
  private readonly ILogger<ConfigStore> _logger;
  private readonly SemaphoreSlim _mutex = new(1, 1);

  public ConfigStore(AppPaths paths, ILogger<ConfigStore> logger)
  {
    _paths = paths;
    _logger = logger;
  }

  public async Task<JsonElement> ReadAsync(CancellationToken cancellationToken)
  {
    _paths.EnsureCreated();

    await _mutex.WaitAsync(cancellationToken);
    try
    {
      if (!File.Exists(_paths.ConfigPath))
      {
        using var doc = JsonDocument.Parse("{}");
        return doc.RootElement.Clone();
      }

      await using var stream = File.OpenRead(_paths.ConfigPath);
      using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
      return doc.RootElement.Clone();
    }
    finally
    {
      _mutex.Release();
    }
  }

  public async Task WriteAsync(JsonElement configJson, CancellationToken cancellationToken)
  {
    _paths.EnsureCreated();

    await _mutex.WaitAsync(cancellationToken);
    try
    {
      await using var stream = File.Open(_paths.ConfigPath, FileMode.Create, FileAccess.Write, FileShare.None);
      await JsonSerializer.SerializeAsync(stream, configJson, JsonOptions, cancellationToken);
      await stream.FlushAsync(cancellationToken);

      _logger.LogInformation("Wrote config to {ConfigPath}", _paths.ConfigPath);
    }
    finally
    {
      _mutex.Release();
    }
  }
}
