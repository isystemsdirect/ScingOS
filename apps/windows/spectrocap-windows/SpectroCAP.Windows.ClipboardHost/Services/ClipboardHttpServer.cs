using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using SpectroCAP.Windows.ClipboardHost.Models;

namespace SpectroCAP.Windows.ClipboardHost.Services;

public sealed class ClipboardHttpServer : IDisposable
{
    private readonly HttpListener _listener = new();
    private readonly AppConfig _cfg;
    private readonly Action<string> _log;
    private CancellationTokenSource? _cts;

    public ClipboardHttpServer(AppConfig cfg, Action<string> log)
    {
        _cfg = cfg;
        _log = log;
    }

    public void Start()
    {
        _cts = new CancellationTokenSource();

        // Prefer LAN binding, but gracefully fall back to localhost if URLACL is missing.
        // NOTE: Listening on http://+:{port}/ often requires a URL reservation:
        //   netsh http add urlacl url=http://+:45819/ user=DOMAIN\User
        if (!TryStartWithPrefix($"http://+:{_cfg.Port}/"))
        {
            if (TryStartWithPrefix($"http://localhost:{_cfg.Port}/"))
            {
                _log("WARNING: Listening on localhost only (LAN binding denied)." );
                _log($"To enable LAN (admin): netsh http add urlacl url=http://+:{_cfg.Port}/ user=\\\"{Environment.UserDomainName}\\{Environment.UserName}\\\"" );
            }
            else
            {
                // Most common cause: missing URL reservation (URLACL) for this port.
                _log("ERROR: Could not start HTTP listener. The app will stay open, but will NOT receive clipboard pushes until this is fixed.");
                _log($"Fix (admin): run CB_SPECTROCAP_URLACL_AND_FIREWALL_WIN10.cmd, or run:");
                _log($"  netsh http add urlacl url=http://+:{_cfg.Port}/ user=\\\"{Environment.UserDomainName}\\{Environment.UserName}\\\"" );
                _log("If that fails, inspect existing reservations:");
                _log("  netsh http show urlacl");
                return;
            }
        }

        _ = Task.Run(() => LoopAsync(_cts.Token));
    }

    public void Stop()
    {
        try { _cts?.Cancel(); } catch { }
        try { _listener.Stop(); } catch { }
    }

    public void Dispose()
    {
        Stop();
        _listener.Close();
    }

    private bool TryStartWithPrefix(string prefix)
    {
        try
        {
            _listener.Prefixes.Clear();
            _listener.Prefixes.Add(prefix);
            _listener.Start();

            var shown = prefix.Replace("+", "0.0.0.0");
            _log($"Listening: {shown}  ({(prefix.Contains("localhost", StringComparison.OrdinalIgnoreCase) ? "LOCAL" : "LAN")})");
            return true;
        }
        catch (HttpListenerException ex)
        {
            _log($"HttpListener start failed for '{prefix}': {ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            _log($"HttpListener start failed for '{prefix}': {ex.Message}");
            return false;
        }
    }

    private async Task LoopAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            HttpListenerContext ctx;
            try
            {
                ctx = await _listener.GetContextAsync();
            }
            catch when (ct.IsCancellationRequested)
            {
                break;
            }
            catch
            {
                try { await Task.Delay(50, ct); } catch { }
                continue;
            }

            _ = Task.Run(() => HandleAsync(ctx), ct);
        }
    }

    private async Task HandleAsync(HttpListenerContext ctx)
    {
        try
        {
            var req = ctx.Request;
            var res = ctx.Response;

            var path = req.Url?.AbsolutePath?.TrimEnd('/') ?? "";
            if (path == "") path = "/";

            if (req.HttpMethod == "GET" && (path == "/" || path.Equals("/ping", StringComparison.OrdinalIgnoreCase)))
            {
                await WriteJson(res, 200, new { ok = true, app = "SpectroCAP.ClipboardHost", port = _cfg.Port });
                return;
            }

            var token = req.Headers["X-SpectroCAP-Token"] ?? "";
            if (!token.Equals(_cfg.Token, StringComparison.OrdinalIgnoreCase))
            {
                await WriteJson(res, 401, new { ok = false, error = "unauthorized" });
                return;
            }

            if (req.HttpMethod == "POST" && path.Equals("/clipboard", StringComparison.OrdinalIgnoreCase))
            {
                using var sr = new StreamReader(req.InputStream, req.ContentEncoding ?? Encoding.UTF8);
                var body = await sr.ReadToEndAsync();

                ClipboardPushRequest? payload = null;
                try { payload = JsonSerializer.Deserialize<ClipboardPushRequest>(body); } catch { }

                var text = payload?.text ?? "";
                if (string.IsNullOrEmpty(text))
                {
                    await WriteJson(res, 400, new { ok = false, error = "missing_text" });
                    return;
                }

                // Clipboard requires STA thread. Marshal to WPF UI thread.
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    System.Windows.Clipboard.SetText(text);
                });

                _log($"Clipboard updated ({text.Length} chars) from {payload?.source ?? "unknown"}");
                await WriteJson(res, 200, new { ok = true, len = text.Length });
                return;
            }

            await WriteJson(res, 404, new { ok = false, error = "not_found" });
        }
        catch (Exception ex)
        {
            try
            {
                await WriteJson(ctx.Response, 500, new { ok = false, error = "server_error", detail = ex.Message });
            }
            catch
            {
                // ignore
            }
        }
        finally
        {
            try { ctx.Response.OutputStream.Close(); } catch { }
            try { ctx.Response.Close(); } catch { }
        }
    }

    private static async Task WriteJson(HttpListenerResponse res, int code, object obj)
    {
        var json = JsonSerializer.Serialize(obj);
        var buf = Encoding.UTF8.GetBytes(json);
        res.StatusCode = code;
        res.ContentType = "application/json; charset=utf-8";
        res.ContentEncoding = Encoding.UTF8;
        res.ContentLength64 = buf.Length;
        await res.OutputStream.WriteAsync(buf, 0, buf.Length);
    }
}
