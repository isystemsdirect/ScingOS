using System.IO;
using System.Net.Http;
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
  Console.WriteLine("scingos plugin list [--baseUrl <url>] [--token <token>] [--verbose]");
  Console.WriteLine("scingos plugin install <path-to.splugin> --token <token> [--baseUrl <url>] [--verbose]");
  Console.WriteLine("scingos plugin enable <pluginId> --token <token> [--baseUrl <url>] [--verbose]");
  Console.WriteLine("scingos plugin disable <pluginId> --token <token> [--baseUrl <url>] [--verbose]");
  Console.WriteLine("scingos version [--baseUrl <url>] [--token <token>] [--verbose]");
  Console.WriteLine();
  Console.WriteLine("Token header: X-Scing-Admin-Token");
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

var baseAddress = (baseUrl ?? "http://127.0.0.1:3333").TrimEnd('/');

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

      Console.WriteLine("Connected to ScingR runtime");
      Console.WriteLine($"health: {JsonOneLine(health)}");
      Console.WriteLine($"version: {JsonOneLine(version)}");
      Console.WriteLine($"compat: {JsonOneLine(compat)}");
      return 0;
    }
    catch (Exception ex)
    {
      Console.WriteLine("ScingR runtime: DOWN");
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
      Console.WriteLine("scingr.reachable: true");
      Console.WriteLine($"health: {JsonOneLine(health)}");
      return 0;
    }
    catch (Exception ex)
    {
      Console.WriteLine("scingr.reachable: false");
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
    var url = baseAddress + $"/logs/tail?lines={lines}";

    var req = new HttpRequestMessage(HttpMethod.Get, url);
      if (!string.IsNullOrWhiteSpace(token)) req.Headers.TryAddWithoutValidation("X-Scing-Admin-Token", token);

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

  if (cliArgs[0] == "plugin" && cliArgs.Length >= 2)
  {
    var sub = cliArgs[1];
    using var http = new HttpClient();

    if (sub == "list")
    {
      var req = new HttpRequestMessage(HttpMethod.Get, baseAddress + "/plugins");
        if (!string.IsNullOrWhiteSpace(token)) req.Headers.TryAddWithoutValidation("X-Scing-Admin-Token", token);

      var res = await http.SendAsync(req);
      var body = await res.Content.ReadAsStringAsync();
      if (!res.IsSuccessStatusCode)
      {
        Console.WriteLine($"error: HTTP {(int)res.StatusCode}");
        if (verbose) Console.WriteLine(body);
        return 1;
      }

      Console.WriteLine(body);
      return 0;
    }

    if (sub == "install" && cliArgs.Length >= 3)
    {
      var path = cliArgs[2];
      if (string.IsNullOrWhiteSpace(token))
      {
        Console.WriteLine("error: --token is required for plugin install");
        return 2;
      }

      if (!File.Exists(path))
      {
        Console.WriteLine($"error: file not found: {path}");
        return 2;
      }

      await using var fs = File.OpenRead(path);
      using var form = new MultipartFormDataContent();
      using var fileContent = new StreamContent(fs);
      form.Add(fileContent, "file", Path.GetFileName(path));

      var req = new HttpRequestMessage(HttpMethod.Post, baseAddress + "/plugins/install")
      {
        Content = form
      };
      req.Headers.TryAddWithoutValidation("X-Scing-Admin-Token", token);

      var res = await http.SendAsync(req);
      var body = await res.Content.ReadAsStringAsync();
      if (!res.IsSuccessStatusCode)
      {
        Console.WriteLine($"error: HTTP {(int)res.StatusCode}");
        if (verbose) Console.WriteLine(body);
        return 1;
      }

      Console.WriteLine(body);
      return 0;
    }

    if ((sub == "enable" || sub == "disable") && cliArgs.Length >= 3)
    {
      var pluginId = cliArgs[2];
      if (string.IsNullOrWhiteSpace(token))
      {
        Console.WriteLine("error: --token is required for plugin lifecycle actions");
        return 2;
      }

      var url = baseAddress + $"/plugins/{sub}/{Uri.EscapeDataString(pluginId)}";
      var req = new HttpRequestMessage(HttpMethod.Post, url);
      req.Headers.TryAddWithoutValidation("X-Scing-Admin-Token", token);

      var res = await http.SendAsync(req);
      var body = await res.Content.ReadAsStringAsync();
      if (!res.IsSuccessStatusCode)
      {
        Console.WriteLine($"error: HTTP {(int)res.StatusCode}");
        if (verbose) Console.WriteLine(body);
        return 1;
      }

      Console.WriteLine(body);
      return 0;
    }

    PrintUsage();
    return 2;
  }

  if (cliArgs[0] == "version")
  {
    var version = await client.VersionAsync();
    Console.WriteLine($"scingr: {JsonOneLine(version)}");
    Console.WriteLine("scingos.contracts: 0.1.0");
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
