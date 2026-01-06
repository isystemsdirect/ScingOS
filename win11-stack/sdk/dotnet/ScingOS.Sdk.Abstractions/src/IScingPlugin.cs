using System.Text.Json;

namespace ScingOS.Sdk.Abstractions;

public interface IScingPlugin
{
  Task OnStartAsync(IScingPluginContext context, CancellationToken ct);

  Task OnStopAsync(CancellationToken ct);

  Task OnEventAsync(JsonElement envelope, CancellationToken ct);
}
