using System.Collections.Concurrent;
using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Scing.Emulator.Service.Models;
using ScingOS.Sdk.Abstractions;

namespace Scing.Emulator.Service.Services;

public sealed class PluginHost : IHostedService
{
  private readonly AppPaths _paths;
  private readonly PluginLoader _loader;
  private readonly NeuralStreamHub _hub;
  private readonly ConfigStore _config;
  private readonly AuditLog _audit;
  private readonly ILogger<PluginHost> _logger;

  private readonly ConcurrentDictionary<string, PluginRuntime> _plugins = new(StringComparer.OrdinalIgnoreCase);

  private readonly string _statePath;
  private readonly object _stateLock = new();

  public PluginHost(AppPaths paths, PluginLoader loader, NeuralStreamHub hub, ConfigStore config, AuditLog audit, ILogger<PluginHost> logger)
  {
    _paths = paths;
    _loader = loader;
    _hub = hub;
    _config = config;
    _audit = audit;
    _logger = logger;

    _statePath = Path.Combine(_paths.PluginsDir, "plugins.json");
  }

  public Task StartAsync(CancellationToken cancellationToken)
  {
    _paths.EnsureCreated();

    DiscoverInstalledPlugins();

    // Enable any plugins marked enabled.
    foreach (var p in _plugins.Values)
    {
      if (p.Enabled)
      {
        _ = EnableAsync(p.Id, cancellationToken);
      }
    }

    return Task.CompletedTask;
  }

  public async Task StopAsync(CancellationToken cancellationToken)
  {
    foreach (var p in _plugins.Values)
    {
      try
      {
        await DisableAsync(p.Id, cancellationToken);
      }
      catch
      {
        // ignore shutdown faults
      }
    }
  }

  public IReadOnlyCollection<PluginRecord> List()
  {
    return _plugins.Values
      .OrderBy(p => p.Id, StringComparer.OrdinalIgnoreCase)
      .Select(p => p.ToRecord())
      .ToArray();
  }

  public async Task<PluginRecord> InstallAsync(Stream spluginZip, CancellationToken ct)
  {
    _paths.EnsureCreated();

    var (manifest, stagingDir) = await _loader.UnpackToStagingAsync(spluginZip, ct);

    try
    {
      var pluginDir = Path.Combine(_paths.PluginsDir, manifest.Id);

      if (Directory.Exists(pluginDir))
      {
        throw new InvalidOperationException("plugin already installed");
      }

      Directory.Move(stagingDir, pluginDir);

      var enabled = false;
      var rt = new PluginRuntime(manifest, pluginDir, enabled);
      _plugins[rt.Id] = rt;

      WriteStateFile();
      _audit.Write("plugins.install", "ok", new { manifest.Id, manifest.Version }, pluginId: manifest.Id);

      return rt.ToRecord();
    }
    catch
    {
      try { Directory.Delete(stagingDir, recursive: true); } catch { /* ignore */ }
      _audit.Write("plugins.install", "error", new { error = "install failed" }, pluginId: manifest.Id);
      throw;
    }
  }

  public async Task EnableAsync(string pluginId, CancellationToken ct)
  {
    if (!_plugins.TryGetValue(pluginId, out var rt)) throw new InvalidOperationException("plugin not installed");

    if (rt.Status == PluginStatus.Enabled) return;

    try
    {
      rt.SetStatus(PluginStatus.Enabled);
      rt.Enabled = true;

      var entryPath = Path.Combine(rt.RootDir, "bin", rt.Manifest.Entrypoint.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar));
      var alc = new PluginLoadContext(entryPath);

      var asm = alc.LoadFromAssemblyPath(entryPath);
      var pluginType = FindPluginType(asm);
      var plugin = (IScingPlugin?)Activator.CreateInstance(pluginType);
      if (plugin is null) throw new InvalidOperationException("failed to instantiate plugin");

      var ctx = new PluginContext(rt.Manifest, _paths, _hub, _config, _audit, _logger);
      rt.AttachRuntime(alc, plugin, ctx);

      await plugin.OnStartAsync(ctx, ct);

      WriteStateFile();
      _audit.Write("plugins.enable", "ok", null, pluginId: rt.Id);
    }
    catch (Exception ex)
    {
      rt.SetStatus(PluginStatus.Faulted);
      rt.Enabled = false;
      rt.DetachRuntime();
      WriteStateFile();

      _audit.Write("plugins.enable", "faulted", new { message = ex.Message }, pluginId: rt.Id);
      _logger.LogWarning(ex, "Plugin {PluginId} faulted during enable", rt.Id);

      throw new InvalidOperationException($"plugin enable failed: {ex.Message}");
    }
  }

  public async Task DisableAsync(string pluginId, CancellationToken ct)
  {
    if (!_plugins.TryGetValue(pluginId, out var rt)) throw new InvalidOperationException("plugin not installed");

    if (rt.Status != PluginStatus.Enabled && rt.Status != PluginStatus.Faulted)
    {
      rt.Enabled = false;
      rt.SetStatus(PluginStatus.Disabled);
      WriteStateFile();
      return;
    }

    try
    {
      if (rt.Plugin is not null)
      {
        await rt.Plugin.OnStopAsync(ct);
      }
    }
    catch (Exception ex)
    {
      _logger.LogWarning(ex, "Plugin {PluginId} threw during stop", rt.Id);
    }

    rt.Enabled = false;
    rt.SetStatus(PluginStatus.Disabled);

    rt.DetachRuntime();
    WriteStateFile();

    _audit.Write("plugins.disable", "ok", null, pluginId: rt.Id);
  }

  public async Task UninstallAsync(string pluginId, CancellationToken ct)
  {
    if (!_plugins.TryGetValue(pluginId, out var rt)) throw new InvalidOperationException("plugin not installed");

    await DisableAsync(pluginId, ct);

    try
    {
      Directory.Delete(rt.RootDir, recursive: true);
    }
    catch (Exception ex)
    {
      throw new InvalidOperationException($"uninstall failed: {ex.Message}");
    }

    _plugins.TryRemove(pluginId, out _);
    WriteStateFile();

    _audit.Write("plugins.uninstall", "ok", null, pluginId: pluginId);
  }

  public string TailPluginLog(string pluginId, int lines)
  {
    _paths.EnsureCreated();

    var dir = new DirectoryInfo(_paths.LogsDir);
    if (!dir.Exists) return string.Empty;

    var safeId = pluginId.Replace(Path.DirectorySeparatorChar, '_').Replace(Path.AltDirectorySeparatorChar, '_');
    var file = dir.GetFiles($"plugin-{safeId}-*.log")
      .OrderByDescending(f => f.LastWriteTimeUtc)
      .FirstOrDefault();

    if (file is null) return string.Empty;

    var all = File.ReadAllLines(file.FullName);
    var start = Math.Max(0, all.Length - lines);

    return string.Join(Environment.NewLine, all.Skip(start)) + Environment.NewLine;
  }

  public async Task RouteEventAsync(JsonElement envelope, CancellationToken ct)
  {
    foreach (var rt in _plugins.Values)
    {
      if (rt.Status != PluginStatus.Enabled || rt.Plugin is null || rt.Context is null) continue;

      if (!TryGetEventType(envelope, out var type)) continue;
      if (!rt.Context.IsSubscribed(type)) continue;

      try
      {
        await rt.Plugin.OnEventAsync(envelope, ct);
      }
      catch (Exception ex)
      {
        rt.SetStatus(PluginStatus.Faulted);
        rt.Enabled = false;
        rt.DetachRuntime();
        WriteStateFile();

        _audit.Write("plugins.fault", "faulted", new { message = ex.Message }, pluginId: rt.Id);
        _logger.LogWarning(ex, "Plugin {PluginId} faulted during event handling", rt.Id);
      }
    }
  }

  private void DiscoverInstalledPlugins()
  {
    _paths.EnsureCreated();

    var state = ReadStateFile();

    var root = new DirectoryInfo(_paths.PluginsDir);
    if (!root.Exists) return;

    foreach (var dir in root.GetDirectories())
    {
      if (dir.Name.StartsWith("_staging_", StringComparison.OrdinalIgnoreCase)) continue;

      try
      {
        var manifest = _loader.ReadManifestFromInstalledDir(dir.FullName);
        var enabled = state.Plugins.FirstOrDefault(p => string.Equals(p.Id, manifest.Id, StringComparison.OrdinalIgnoreCase))?.Enabled ?? false;
        var rt = new PluginRuntime(manifest, dir.FullName, enabled);
        // Keep as disabled until actually loaded into an AssemblyLoadContext.
        rt.SetStatus(PluginStatus.Disabled);
        _plugins[rt.Id] = rt;
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "Failed to load plugin manifest from {Dir}", dir.FullName);
      }
    }
  }

  private PluginsStateFile ReadStateFile()
  {
    lock (_stateLock)
    {
      try
      {
        if (!File.Exists(_statePath)) return PluginsStateFile.Empty;
        var json = File.ReadAllText(_statePath);
        return JsonSerializer.Deserialize<PluginsStateFile>(json, PluginJson.Options) ?? PluginsStateFile.Empty;
      }
      catch
      {
        return PluginsStateFile.Empty;
      }
    }
  }

  private void WriteStateFile()
  {
    lock (_stateLock)
    {
      var state = new PluginsStateFile(1, _plugins.Values.Select(p => new PluginState(p.Id, p.Enabled)).ToArray());
      var json = JsonSerializer.Serialize(state, PluginJson.Options);
      File.WriteAllText(_statePath, json);
    }
  }

  private static bool TryGetEventType(JsonElement envelope, out string type)
  {
    type = string.Empty;
    if (envelope.ValueKind != JsonValueKind.Object) return false;
    if (!envelope.TryGetProperty("type", out var t) || t.ValueKind != JsonValueKind.String) return false;
    type = t.GetString() ?? string.Empty;
    return !string.IsNullOrWhiteSpace(type);
  }

  private static Type FindPluginType(Assembly asm)
  {
    var iface = typeof(IScingPlugin);

    var type = asm.GetTypes().FirstOrDefault(t => !t.IsAbstract && iface.IsAssignableFrom(t));
    if (type is null) throw new InvalidOperationException("no type implementing IScingPlugin found");

    var ctor = type.GetConstructor(Type.EmptyTypes);
    if (ctor is null) throw new InvalidOperationException("plugin type must have a public parameterless constructor");

    return type;
  }

  private sealed class PluginRuntime
  {
    public string Id => Manifest.Id;
    public PluginManifest Manifest { get; }
    public string RootDir { get; }
    public bool Enabled { get; set; }

    public PluginStatus Status { get; private set; }

    public AssemblyLoadContext? LoadContext { get; private set; }
    public IScingPlugin? Plugin { get; private set; }
    public PluginContext? Context { get; private set; }

    public PluginRuntime(PluginManifest manifest, string rootDir, bool enabled)
    {
      Manifest = manifest;
      RootDir = rootDir;
      Enabled = enabled;
      Status = PluginStatus.Installed;
    }

    public void AttachRuntime(AssemblyLoadContext alc, IScingPlugin plugin, PluginContext ctx)
    {
      LoadContext = alc;
      Plugin = plugin;
      Context = ctx;
    }

    public void DetachRuntime()
    {
      Plugin = null;
      Context = null;

      if (LoadContext is not null)
      {
        try { LoadContext.Unload(); } catch { /* ignore */ }
        LoadContext = null;
      }

      GC.Collect();
      GC.WaitForPendingFinalizers();
    }

    public void SetStatus(PluginStatus status)
    {
      Status = status;
    }

    public PluginRecord ToRecord()
    {
      var status = Status;
      if (status == PluginStatus.Enabled && !Enabled) status = PluginStatus.Disabled;
      return new PluginRecord(Manifest.Id, Manifest.Name, Manifest.Version, Manifest.Description, Manifest.Capabilities ?? Array.Empty<string>(), status);
    }
  }

  private sealed class PluginContext : IScingPluginContext
  {
    private readonly PluginManifest _manifest;
    private readonly AppPaths _paths;
    private readonly NeuralStreamHub _hub;
    private readonly ConfigStore _config;
    private readonly AuditLog _audit;
    private readonly ILogger _logger;
    private readonly HashSet<string> _subs = new(StringComparer.OrdinalIgnoreCase);

    public string PluginId => _manifest.Id;

    public IReadOnlyCollection<string> Capabilities { get; }

    public PluginContext(PluginManifest manifest, AppPaths paths, NeuralStreamHub hub, ConfigStore config, AuditLog audit, ILogger logger)
    {
      _manifest = manifest;
      _paths = paths;
      _hub = hub;
      _config = config;
      _audit = audit;
      _logger = logger;

      Capabilities = (manifest.Capabilities ?? Array.Empty<string>()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    }

    public void Subscribe(string eventTypePattern)
    {
      Require(ScingPluginCapabilities.EventsSubscribe);

      if (string.IsNullOrWhiteSpace(eventTypePattern)) throw new InvalidOperationException("eventTypePattern required");
      _subs.Add(eventTypePattern.Trim());
    }

    public bool IsSubscribed(string eventType)
    {
      if (_subs.Count == 0) return false;

      foreach (var p in _subs)
      {
        if (p.EndsWith("*", StringComparison.Ordinal))
        {
          var prefix = p.TrimEnd('*');
          if (eventType.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return true;
        }
        else
        {
          if (string.Equals(p, eventType, StringComparison.OrdinalIgnoreCase)) return true;
        }
      }

      return false;
    }

    public async Task PublishAsync(JsonElement envelope, CancellationToken ct)
    {
      Require(ScingPluginCapabilities.EventsPublish);

      var ev = new EmulatorEvent(
        Type: "event",
        Payload: envelope,
        Timestamp: DateTimeOffset.UtcNow
      );

      var json = JsonSerializer.Serialize(ev, new JsonSerializerOptions(JsonSerializerDefaults.Web));
      await _hub.BroadcastAsync(json, ct);
    }

    public async Task<JsonElement> ReadConfigAsync(CancellationToken ct)
    {
      Require(ScingPluginCapabilities.ConfigRead);
      return await _config.ReadAsync(ct);
    }

    public async Task WriteConfigAsync(JsonElement config, CancellationToken ct)
    {
      Require(ScingPluginCapabilities.ConfigWrite);
      await _config.WriteAsync(config, ct);
    }

    public void LogInfo(string message, string? correlationId = null) => WriteLog("INFO", message, correlationId);

    public void LogWarn(string message, string? correlationId = null) => WriteLog("WARN", message, correlationId);

    public void LogError(string message, string? correlationId = null) => WriteLog("ERROR", message, correlationId);

    private void Require(string cap)
    {
      if (Capabilities.Contains(cap, StringComparer.OrdinalIgnoreCase)) return;

      _audit.Write("plugins.capability.denied", "denied", new { capability = cap }, pluginId: PluginId);
      throw new ScingCapabilityDeniedException(cap, $"capability denied: {cap}");
    }

    private void WriteLog(string level, string message, string? correlationId)
    {
      _paths.EnsureCreated();

      var fileName = $"plugin-{PluginId}-{DateTimeOffset.UtcNow:yyyyMMdd}.log";
      var path = Path.Combine(_paths.LogsDir, fileName);

      var line = $"{DateTimeOffset.UtcNow:o} [{level}]";
      if (!string.IsNullOrWhiteSpace(correlationId))
      {
        line += $" [{correlationId}]";
      }
      line += $" {message}";

      File.AppendAllText(path, line + Environment.NewLine);

      // Also emit to service logger for dev convenience.
      _logger.LogInformation("[plugin:{PluginId}] {Message}", PluginId, message);
    }
  }
}
