using System.Text.Json;
using ScingOS.Sdk;
using ScingOS.Sdk.Abstractions;

static string? GetOpt(string[] args, string name)
{
  var i = Array.IndexOf(args, name);
  if (i >= 0 && i + 1 < args.Length) return args[i + 1];
  return null;
}

static bool HasFlag(string[] args, string name) => args.Contains(name, StringComparer.OrdinalIgnoreCase);

static void PrintUsage()
{
  Console.WriteLine("scingos doctor [--baseUrl <url>] [--token <token>] [--verbose]");
  Console.WriteLine("scingos service status [--baseUrl <url>] [--token <token>] [--verbose]");
  Console.WriteLine("scingos logs tail --lines <n> --token <token> [--baseUrl <url>] [--verbose]");
  Console.WriteLine("scingos version [--baseUrl <url>] [--token <token>] [--verbose]");
}

static string JsonOneLine(JsonDocument doc)
{
  return doc.RootElement.GetRawText();
}

var cliArgs = Environment.GetCommandLineArgs().Skip(1).ToArray();
if (cliArgs.Length == 0)
{
  PrintUsage();
  return 2;
}

var verbose = HasFlag(cliArgs, "--verbose");
var baseUrl = GetOpt(cliArgs, "--baseUrl");
var token = GetOpt(cliArgs, "--token");

var client = new ScingClient(baseUrl, token);

try
{
  if (cliArgs[0] == "doctor")
  {
    try
    {
      var health = await client.HealthAsync();
      var version = await client.VersionAsync();
      var compat = await client.CompatAsync();

      Console.WriteLine("OK");
      Console.WriteLine($"health: {JsonOneLine(health)}");
      Console.WriteLine($"version: {JsonOneLine(version)}");
      Console.WriteLine($"compat: {JsonOneLine(compat)}");
      return 0;
    }
    catch (Exception ex)
    {
      Console.WriteLine("DOWN");
      if (verbose) Console.WriteLine(ex);
      else Console.WriteLine(ex.Message);
      return 1;
    }
  }

  if (cliArgs[0] == "service" && cliArgs.Length >= 2 && cliArgs[1] == "status")
  {
    try
    {
      var health = await client.HealthAsync();
      Console.WriteLine("reachable: true");
      Console.WriteLine($"health: {JsonOneLine(health)}");
      return 0;
    }
    catch (Exception ex)
    {
      Console.WriteLine("reachable: false");
      if (verbose) Console.WriteLine(ex);
      else Console.WriteLine(ex.Message);
      return 1;
    }
  }

  if (cliArgs[0] == "logs" && cliArgs.Length >= 2 && cliArgs[1] == "tail")
  {
    var linesRaw = GetOpt(cliArgs, "--lines") ?? "200";
    if (!int.TryParse(linesRaw, out var lines)) lines = 200;

    using var http = new HttpClient();
    var url = (baseUrl ?? "http://127.0.0.1:3333").TrimEnd('/') + $"/logs/tail?lines={lines}";

    var req = new HttpRequestMessage(HttpMethod.Get, url);
    if (!string.IsNullOrWhiteSpace(token)) req.Headers.TryAddWithoutValidation("X-Scing-Dev-Token", token);

    var res = await http.SendAsync(req);
    if (!res.IsSuccessStatusCode)
    {
      Console.WriteLine($"error: HTTP {(int)res.StatusCode}");
      if (verbose) Console.WriteLine(await res.Content.ReadAsStringAsync());
      return 1;
    }

    Console.WriteLine(await res.Content.ReadAsStringAsync());
    return 0;
  }

  if (cliArgs[0] == "version")
  {
    var version = await client.VersionAsync();
    Console.WriteLine($"service: {JsonOneLine(version)}");
    Console.WriteLine("sdk: 0.1.0");
    return 0;
  }

  PrintUsage();
  return 2;
}
catch (Exception ex)
{
  if (verbose) Console.WriteLine(ex);
  else Console.WriteLine(ex.Message);
  return 1;
}
