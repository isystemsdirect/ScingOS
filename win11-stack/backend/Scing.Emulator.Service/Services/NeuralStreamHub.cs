using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Channels;

namespace Scing.Emulator.Service.Services;

public sealed class NeuralStreamHub
{
  private readonly ILogger<NeuralStreamHub> _logger;
  private readonly ConcurrentDictionary<Guid, WebSocket> _wsClients = new();
  private readonly ConcurrentDictionary<Guid, Channel<string>> _sseClients = new();

  public NeuralStreamHub(ILogger<NeuralStreamHub> logger)
  {
    _logger = logger;
  }

  public (Guid id, ChannelReader<string> reader) SubscribeSse()
  {
    var id = Guid.NewGuid();
    var channel = Channel.CreateUnbounded<string>(new UnboundedChannelOptions
    {
      SingleReader = true,
      SingleWriter = false
    });

    _sseClients[id] = channel;
    _logger.LogInformation("SSE client connected {ClientId}. Total SSE={Count}", id, _sseClients.Count);

    return (id, channel.Reader);
  }

  public void UnsubscribeSse(Guid id)
  {
    if (_sseClients.TryRemove(id, out var channel))
    {
      channel.Writer.TryComplete();
      _logger.LogInformation("SSE client disconnected {ClientId}. Total SSE={Count}", id, _sseClients.Count);
    }
  }

  public void AddWebSocket(Guid id, WebSocket socket)
  {
    _wsClients[id] = socket;
    _logger.LogInformation("WS client connected {ClientId}. Total WS={Count}", id, _wsClients.Count);
  }

  public async Task RemoveWebSocketAsync(Guid id)
  {
    if (_wsClients.TryRemove(id, out var socket))
    {
      try
      {
        if (socket.State is WebSocketState.Open or WebSocketState.CloseReceived)
        {
          await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "bye", CancellationToken.None);
        }
      }
      catch
      {
        // best-effort
      }

      _logger.LogInformation("WS client disconnected {ClientId}. Total WS={Count}", id, _wsClients.Count);
    }
  }

  public async Task BroadcastAsync(string json, CancellationToken cancellationToken)
  {
    foreach (var kvp in _sseClients)
    {
      kvp.Value.Writer.TryWrite(json);
    }

    var buffer = Encoding.UTF8.GetBytes(json);
    var segment = new ArraySegment<byte>(buffer);

    foreach (var kvp in _wsClients)
    {
      var socket = kvp.Value;
      if (socket.State != WebSocketState.Open)
      {
        continue;
      }

      try
      {
        await socket.SendAsync(segment, WebSocketMessageType.Text, endOfMessage: true, cancellationToken);
      }
      catch
      {
        // best-effort; cleanup happens on receive loop
      }
    }
  }
}
