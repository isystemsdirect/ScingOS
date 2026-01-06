# .NET SDK Quickstart

## Build

- `dotnet build win11-stack/sdk/dotnet/ScingOS.Sdk/ScingOS.Sdk.csproj`

## Use

```csharp
using ScingOS.Sdk;
using ScingOS.Sdk.Abstractions;

var client = new ScingClient("http://127.0.0.1:3333");

var health = await client.HealthAsync();
Console.WriteLine(health.RootElement.GetRawText());

await client.PublishEventAsync(new ScingEnvelope<object>(
  Version: "0.1.0",
  Timestamp: DateTimeOffset.UtcNow.ToString("O"),
  CorrelationId: Guid.NewGuid().ToString(),
  Source: "dotnet-sample",
  Type: "system.ping",
  Payload: new { hello = "world" }
));
```

## CLI

- `dotnet run --project win11-stack/sdk/cli/ScingOS.Cli/ScingOS.Cli.csproj -- doctor`
- `dotnet run --project win11-stack/sdk/cli/ScingOS.Cli/ScingOS.Cli.csproj -- version`
- `dotnet run --project win11-stack/sdk/cli/ScingOS.Cli/ScingOS.Cli.csproj -- logs tail --lines 200 --token <token>`

Note: current service uses header `X-Scing-Admin-Token` for token-gated endpoints.
