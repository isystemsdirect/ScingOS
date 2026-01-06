using System.Net.WebSockets;
using System.Text.Json;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using Serilog;
using Serilog.Events;
using Scing.Emulator.Service.Models;
using Scing.Emulator.Service.Services;

static (int major, int minor, int patch) ParseSemVer(string version)
{
  var parts = version.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
  if (parts.Length < 3)
  {
    return (0, 0, 0);
  }

  _ = int.TryParse(parts[0], out var major);
  _ = int.TryParse(parts[1], out var minor);
  _ = int.TryParse(parts[2], out var patch);
  return (major, minor, patch);
}

static JsonElement LoadVersionManifest(string contentRootPath)
{
  try
  {
    var path = Path.Combine(contentRootPath, "version.json");
    if (!File.Exists(path))
    {
      using var empty = JsonDocument.Parse("{}");
      return empty.RootElement.Clone();
    }

    using var doc = JsonDocument.Parse(File.ReadAllText(path));
    return doc.RootElement.Clone();
  }
  catch
  {
    using var empty = JsonDocument.Parse("{}");
    return empty.RootElement.Clone();
  }
}

var builder = WebApplication.CreateBuilder(args);

var bindHost = builder.Configuration["ScingEmulator:BindHost"] ?? "127.0.0.1";
var port = int.TryParse(builder.Configuration["ScingEmulator:Port"], out var p) ? p : 3333;
var serviceName = builder.Configuration["ScingEmulator:ServiceName"] ?? "ScingEmulatorService";

// Default to localhost-only if URLs are not explicitly configured.
if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
  builder.WebHost.UseUrls($"http://{bindHost}:{port}");
}

builder.Host.UseWindowsService(options =>
{
  options.ServiceName = serviceName;
});

builder.Services.AddSingleton<AppPaths>();
builder.Services.AddSingleton<ConfigStore>();
builder.Services.AddSingleton<NeuralStreamHub>();
builder.Services.AddSingleton<LogTailer>();

builder.Services.AddCors(options =>
{
  options.AddDefaultPolicy(policy =>
  {
    // Local service bound to 127.0.0.1 only; allow all origins to support file:// ("null") origins.
    policy
      .AllowAnyHeader()
      .AllowAnyMethod()
      .SetIsOriginAllowed(_ => true);
  });
});

// Serilog file logging -> %ProgramData%\ScingOS\Logs\ScingEmulatorService-YYYYMMDD.log
builder.Services.AddSingleton(provider =>
{
  var config = provider.GetRequiredService<IConfiguration>();
  var env = provider.GetRequiredService<IWebHostEnvironment>();
  var paths = provider.GetRequiredService<AppPaths>();
  paths.EnsureCreated();

  var logPath = Path.Combine(paths.LogsDir, "ScingEmulatorService-.log");

  return new LoggerConfiguration()
    .MinimumLevel.Is(env.IsDevelopment() ? LogEventLevel.Debug : LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.File(
      logPath,
      rollingInterval: RollingInterval.Day,
      retainedFileCountLimit: 14,
      shared: true)
    .WriteTo.Console(restrictedToMinimumLevel: env.IsDevelopment() ? LogEventLevel.Debug : LogEventLevel.Warning)
    .CreateLogger();
});

builder.Host.UseSerilog((ctx, services, cfg) =>
{
  var logger = services.GetRequiredService<Serilog.ILogger>();
  cfg.ReadFrom.Configuration(ctx.Configuration);
  cfg.WriteTo.Logger(logger);
});

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
  ForwardedHeaders = ForwardedHeaders.None
});

app.UseCors();
app.UseWebSockets();

// Static UI hosting (Phase 3): serve built assets at http://127.0.0.1:3333/ui
// Source directory is provided at runtime to avoid committing build outputs.
var uiDistDir = builder.Configuration["ScingEmulator:UiDistDir"]
  ?? Environment.GetEnvironmentVariable("SCING_EMULATOR_UI_DIR");
if (!string.IsNullOrWhiteSpace(uiDistDir) && Directory.Exists(uiDistDir))
{
  var uiProvider = new PhysicalFileProvider(uiDistDir);
  app.UseDefaultFiles(new DefaultFilesOptions
  {
    FileProvider = uiProvider,
    RequestPath = "/ui"
  });
  app.UseStaticFiles(new StaticFileOptions
  {
    FileProvider = uiProvider,
    RequestPath = "/ui"
  });
}

var startedAt = DateTimeOffset.UtcNow;
var versionManifest = LoadVersionManifest(app.Environment.ContentRootPath);
var serviceVersion = versionManifest.TryGetProperty("version", out var v) && v.ValueKind == JsonValueKind.String
  ? (v.GetString() ?? "0.0.0")
  : "0.0.0";
var sdkMin = versionManifest.TryGetProperty("sdkMin", out var sMin) && sMin.ValueKind == JsonValueKind.String
  ? (sMin.GetString() ?? "0.0.0")
  : "0.0.0";
var sdkMax = versionManifest.TryGetProperty("sdkMax", out var sMax) && sMax.ValueKind == JsonValueKind.String
  ? (sMax.GetString() ?? "0.0.0")
  : "0.0.0";
var (svcMajor, svcMinor, _) = ParseSemVer(serviceVersion);

app.MapGet("/health", () => Results.Ok(new
{
  status = "ok",
  serviceName,
  uptimeSeconds = (long)(DateTimeOffset.UtcNow - startedAt).TotalSeconds
}));

app.MapGet("/version", () =>
{
  var buildSha = Environment.GetEnvironmentVariable("SCING_BUILD_SHA")
    ?? Environment.GetEnvironmentVariable("GITHUB_SHA");

  DateTimeOffset? buildTime = null;
  var buildTimeRaw = Environment.GetEnvironmentVariable("SCING_BUILD_TIME")
    ?? Environment.GetEnvironmentVariable("SOURCE_DATE_EPOCH");
  if (!string.IsNullOrWhiteSpace(buildTimeRaw))
  {
    if (long.TryParse(buildTimeRaw, out var epochSeconds))
    {
      buildTime = DateTimeOffset.FromUnixTimeSeconds(epochSeconds);
    }
    else if (DateTimeOffset.TryParse(buildTimeRaw, out var parsed))
    {
      buildTime = parsed;
    }
  }

  // Contract: /version is read-only and backed by sdk/core/version.json (copied to output).
  // We return the canonical manifest fields plus optional build metadata.
  var dict = JsonSerializer.Deserialize<Dictionary<string, object?>>(versionManifest.GetRawText(), new JsonSerializerOptions(JsonSerializerDefaults.Web))
    ?? new Dictionary<string, object?>();
  dict["buildSha"] = buildSha;
  dict["buildTime"] = buildTime;
  return Results.Ok(dict);
});

app.MapGet("/compat", () =>
{
  return Results.Ok(new
  {
    supportedClients = new object[]
    {
      new { language = "ts", minVersion = sdkMin, maxVersion = sdkMax },
      new { language = "dotnet", minVersion = sdkMin, maxVersion = sdkMax },
      new { language = "shell", minVersion = sdkMin, maxVersion = sdkMax }
    },
    deprecatedAfter = (string?)null,
    notes = $"Default policy: Service major == SDK major; SDK minor <= service minor. Manifest-backed. Parsed service semver={svcMajor}.{svcMinor}.x"
  });
});

app.MapGet("/config", async (ConfigStore store, CancellationToken ct) =>
{
  var cfg = await store.ReadAsync(ct);
  return Results.Json(cfg);
});

app.MapPost("/config", async (HttpContext http, IWebHostEnvironment env, IConfiguration cfg, ConfigStore store, JsonElement body, CancellationToken ct) =>
{
  if (!DevAuth.IsAllowed(http, env, cfg))
  {
    return Results.Unauthorized();
  }

  await store.WriteAsync(body, ct);
  return Results.Ok(new { ok = true });
});

app.MapPost("/event", async (NeuralStreamHub hub, JsonElement body, CancellationToken ct) =>
{
  var ev = new EmulatorEvent(
    Type: "event",
    Payload: body,
    Timestamp: DateTimeOffset.UtcNow
  );

  var json = JsonSerializer.Serialize(ev, new JsonSerializerOptions(JsonSerializerDefaults.Web));
  await hub.BroadcastAsync(json, ct);

  return Results.Accepted();
});

app.MapGet("/sse/neural", async (HttpContext http, NeuralStreamHub hub, CancellationToken ct) =>
{
  http.Response.Headers.CacheControl = "no-cache";
  http.Response.Headers.Connection = "keep-alive";
  http.Response.Headers["X-Accel-Buffering"] = "no";
  http.Response.ContentType = "text/event-stream";

  var (id, reader) = hub.SubscribeSse();

  try
  {
    // Send an initial event so clients know we're live.
    await http.Response.WriteAsync("event: ready\ndata: {}\n\n", ct);
    await http.Response.Body.FlushAsync(ct);

    while (await reader.WaitToReadAsync(ct))
    {
      while (reader.TryRead(out var msg))
      {
        // One-line JSON payload.
        await http.Response.WriteAsync($"data: {msg}\n\n", ct);
        await http.Response.Body.FlushAsync(ct);
      }
    }
  }
  catch (OperationCanceledException)
  {
    // client disconnected
  }
  finally
  {
    hub.UnsubscribeSse(id);
  }
});

app.Map("/ws/neural", async http =>
{
  if (!http.WebSockets.IsWebSocketRequest)
  {
    http.Response.StatusCode = StatusCodes.Status400BadRequest;
    return;
  }

  var hub = http.RequestServices.GetRequiredService<NeuralStreamHub>();
  var logger = http.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("NeuralWebSocket");

  using var socket = await http.WebSockets.AcceptWebSocketAsync();
  var clientId = Guid.NewGuid();
  hub.AddWebSocket(clientId, socket);

  var buffer = new byte[4 * 1024];

  try
  {
    while (socket.State == WebSocketState.Open)
    {
      var result = await socket.ReceiveAsync(buffer, http.RequestAborted);
      if (result.MessageType == WebSocketMessageType.Close)
      {
        break;
      }

      // Client -> backend messages are currently ignored; use POST /event instead.
      if (result.Count > 0)
      {
        logger.LogDebug("Received {Count} bytes from WS client {ClientId}", result.Count, clientId);
      }
    }
  }
  catch (OperationCanceledException)
  {
    // shutting down
  }
  finally
  {
    await hub.RemoveWebSocketAsync(clientId);
  }
});

app.MapGet("/logs/tail", (HttpContext http, IWebHostEnvironment env, IConfiguration cfg, LogTailer tailer, int? lines) =>
{
  if (!DevAuth.IsAllowed(http, env, cfg))
  {
    return Results.Unauthorized();
  }

  var text = tailer.Tail(lines ?? 200);
  return Results.Text(text, "text/plain");
});

app.Run();
