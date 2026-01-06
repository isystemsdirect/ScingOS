using System.Text.Json;
using ScingOS.Sdk.Abstractions;

namespace ScingOS.Plugins.HelloHeartbeat;

public sealed class HelloHeartbeatPlugin : IScingPlugin
{
  private IScingPluginContext? _ctx;
  private PeriodicTimer? _timer;
  private CancellationTokenSource? _loopCts;

  public async Task OnStartAsync(IScingPluginContext context, CancellationToken ct)
  {
    _ctx = context;

    // Subscribe to ping events and respond with pong.
    context.Subscribe("system.ping");

    _timer = new PeriodicTimer(TimeSpan.FromSeconds(2));
    _loopCts = CancellationTokenSource.CreateLinkedTokenSource(ct);

    _ = Task.Run(() => HeartbeatLoopAsync(_loopCts.Token), _loopCts.Token);

    context.LogInfo("hello-heartbeat plugin started");
    await Task.CompletedTask;
  }

  public async Task OnStopAsync(CancellationToken ct)
  {
    try { _loopCts?.Cancel(); } catch { /* ignore */ }
    try { _timer?.Dispose(); } catch { /* ignore */ }

    _ctx?.LogInfo("hello-heartbeat plugin stopped");
    await Task.CompletedTask;
  }

  public async Task OnEventAsync(JsonElement envelope, CancellationToken ct)
  {
    if (_ctx is null) return;

    if (envelope.ValueKind != JsonValueKind.Object) return;
    if (!envelope.TryGetProperty("type", out var t) || t.ValueKind != JsonValueKind.String) return;

    var type = t.GetString() ?? string.Empty;
    if (!string.Equals(type, "system.ping", StringComparison.OrdinalIgnoreCase)) return;

    var correlationId = envelope.TryGetProperty("correlationId", out var cid) && cid.ValueKind == JsonValueKind.String
      ? cid.GetString()
      : null;

    var payload = new Dictionary<string, object?>
    {
      ["ok"] = true,
      ["from"] = "hello-heartbeat"
    };

    var pong = CreateEnvelope("system.pong", payload, correlationId);
    await _ctx.PublishAsync(pong, ct);
  }

  private async Task HeartbeatLoopAsync(CancellationToken ct)
  {
    if (_ctx is null || _timer is null) return;

    while (await _timer.WaitForNextTickAsync(ct))
    {
      var payload = new Dictionary<string, object?>
      {
        ["message"] = "heartbeat",
        ["unixMs"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
      };

      var env = CreateEnvelope("system.heartbeat", payload, correlationId: null);
      try
      {
        await _ctx.PublishAsync(env, ct);
      }
      catch (Exception ex)
      {
        _ctx.LogWarn($"heartbeat publish failed: {ex.Message}");
      }
    }
  }

  private static JsonElement CreateEnvelope(string type, object payload, string? correlationId)
  {
    var env = new Dictionary<string, object?>
    {
      ["version"] = "0.1.0",
      ["timestamp"] = DateTimeOffset.UtcNow.ToString("o"),
      ["correlationId"] = correlationId ?? Guid.NewGuid().ToString(),
      ["source"] = "plugin.hello-heartbeat",
      ["type"] = type,
      ["payload"] = payload
    };

    var json = JsonSerializer.SerializeToElement(env, new JsonSerializerOptions(JsonSerializerDefaults.Web));
    return json;
  }
}
