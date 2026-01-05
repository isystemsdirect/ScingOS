using System.Net.WebSockets;
using System.Text.Json;
using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using Serilog.Events;
using Scing.Emulator.Service.Models;
using Scing.Emulator.Service.Services;

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

var startedAt = DateTimeOffset.UtcNow;

app.MapGet("/health", () => Results.Ok(new
{
  status = "ok",
  service = serviceName,
  bind = $"{bindHost}:{port}",
  uptimeSeconds = (long)(DateTimeOffset.UtcNow - startedAt).TotalSeconds
}));

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
