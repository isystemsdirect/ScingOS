using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using ScingOS.Sdk.Abstractions;

namespace ScingOS.Sdk;

public sealed class ScingClient
{
  private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

  private readonly HttpClient _http;
  private readonly Uri _baseUri;
  private readonly string? _adminToken;

  public ScingClient(string? baseUrl = null, string? adminToken = null, HttpClient? httpClient = null)
  {
    _baseUri = new Uri((baseUrl ?? "http://127.0.0.1:3333").TrimEnd('/') + "/");
    _adminToken = adminToken;

    _http = httpClient ?? new HttpClient();
    _http.Timeout = TimeSpan.FromSeconds(5);
  }

  public async Task<JsonDocument> HealthAsync(CancellationToken cancellationToken = default)
    => await GetJsonAsync("health", cancellationToken);

  public async Task<JsonDocument> VersionAsync(CancellationToken cancellationToken = default)
    => await GetJsonAsync("version", cancellationToken);

  public async Task<JsonDocument> CompatAsync(CancellationToken cancellationToken = default)
    => await GetJsonAsync("compat", cancellationToken);

  public async Task PublishEventAsync<TPayload>(ScingEnvelope<TPayload> envelope, CancellationToken cancellationToken = default)
  {
    var req = new HttpRequestMessage(HttpMethod.Post, new Uri(_baseUri, "event"))
    {
      Content = new StringContent(JsonSerializer.Serialize(envelope, JsonOptions), Encoding.UTF8, "application/json")
    };

    if (!string.IsNullOrWhiteSpace(_adminToken))
    {
      req.Headers.TryAddWithoutValidation("X-Scing-Admin-Token", _adminToken);
    }

    using var res = await _http.SendAsync(req, cancellationToken);
    res.EnsureSuccessStatusCode();
  }

  public async Task ConnectWebSocketAsync(Func<string, Task> handler, CancellationToken cancellationToken = default)
  {
    var wsUri = new UriBuilder(_baseUri)
    {
      Scheme = _baseUri.Scheme == "https" ? "wss" : "ws",
      Path = "ws/neural"
    }.Uri;

    using var ws = new ClientWebSocket();
    await ws.ConnectAsync(wsUri, cancellationToken);

    var buffer = new byte[64 * 1024];
    while (!cancellationToken.IsCancellationRequested && ws.State == WebSocketState.Open)
    {
      var result = await ws.ReceiveAsync(buffer, cancellationToken);
      if (result.MessageType == WebSocketMessageType.Close) break;

      var text = Encoding.UTF8.GetString(buffer, 0, result.Count);
      await handler(text);
    }

    if (ws.State == WebSocketState.Open)
    {
      await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "client closing", CancellationToken.None);
    }
  }

  private async Task<JsonDocument> GetJsonAsync(string relativePath, CancellationToken cancellationToken)
  {
    var req = new HttpRequestMessage(HttpMethod.Get, new Uri(_baseUri, relativePath));
    if (!string.IsNullOrWhiteSpace(_adminToken))
    {
      req.Headers.TryAddWithoutValidation("X-Scing-Admin-Token", _adminToken);
    }

    using var res = await _http.SendAsync(req, cancellationToken);
    res.EnsureSuccessStatusCode();
    var stream = await res.Content.ReadAsStreamAsync(cancellationToken);
    return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
  }
}
