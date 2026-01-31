using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Windows;
using SpectroCAP.Windows.ClipboardHost.Services;

namespace SpectroCAP.Windows.ClipboardHost;

public partial class MainWindow : Window
{
    private readonly AppConfig _cfg;
    private readonly ClipboardHttpServer _server;

    public MainWindow()
    {
        InitializeComponent();

        _cfg = ConfigService.LoadOrCreate();
        TokenBox.Text = _cfg.Token;

        var ipList = GetLocalIPv4s();
        var ipHint = ipList.Count > 0 ? string.Join(", ", ipList) : "UNKNOWN_IP";
        EndpointText.Text = $"POST http://<PC-IP>:{_cfg.Port}/clipboard  (PC-IP example: {ipHint})   |   GET http://<PC-IP>:{_cfg.Port}/ping";

        _server = new ClipboardHttpServer(_cfg, Log);
        _server.Start();

        Log("Ready. Keep this app running on the Windows PC.");
        Log("Android should POST JSON {\"text\":\"...\"} to /clipboard with header X-SpectroCAP-Token.");
    }

    protected override void OnClosed(EventArgs e)
    {
        _server.Dispose();
        base.OnClosed(e);
    }

    private void CopyTokenBtn_Click(object sender, RoutedEventArgs e)
    {
        System.Windows.Clipboard.SetText(_cfg.Token);
        Log("Token copied to clipboard.");
    }

    private void Log(string msg)
    {
        var line = $"[{DateTime.Now:HH:mm:ss}] {msg}";
        Dispatcher.Invoke(() =>
        {
            LogBox.AppendText(line + Environment.NewLine);
            LogBox.ScrollToEnd();
        });
    }

    private static List<string> GetLocalIPv4s()
    {
        var ips = new List<string>();
        foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
        {
            if (ni.OperationalStatus != OperationalStatus.Up) continue;
            var props = ni.GetIPProperties();
            foreach (var ua in props.UnicastAddresses)
            {
                if (ua.Address.AddressFamily == AddressFamily.InterNetwork)
                {
                    var ip = ua.Address.ToString();
                    if (ip.StartsWith("169.254.")) continue; // skip APIPA
                    ips.Add(ip);
                }
            }
        }

        return ips.Distinct().ToList();
    }
}