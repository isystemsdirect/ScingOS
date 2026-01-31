using System;
using System.IO;
using System.Security.Cryptography;
using System.Text.Json;

namespace SpectroCAP.Windows.ClipboardHost.Services;

public sealed class AppConfig
{
    public int Port { get; set; } = 45819;
    public string Token { get; set; } = "";
}

public static class ConfigService
{
    private static readonly string AppDir =
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "SpectroCAP");

    private static readonly string ConfigPath = Path.Combine(AppDir, "config.json");

    public static AppConfig LoadOrCreate()
    {
        Directory.CreateDirectory(AppDir);

        if (File.Exists(ConfigPath))
        {
            try
            {
                var json = File.ReadAllText(ConfigPath);
                var cfg = JsonSerializer.Deserialize<AppConfig>(json);
                if (cfg != null && cfg.Port > 0 && !string.IsNullOrWhiteSpace(cfg.Token))
                    return cfg;
            }
            catch
            {
                // fallthrough
            }
        }

        var created = new AppConfig
        {
            Port = 45819,
            Token = GenerateToken(32)
        };

        Save(created);
        return created;
    }

    public static void Save(AppConfig cfg)
    {
        Directory.CreateDirectory(AppDir);
        var json = JsonSerializer.Serialize(cfg, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(ConfigPath, json);
    }

    private static string GenerateToken(int bytes)
    {
        var buf = RandomNumberGenerator.GetBytes(bytes);
        return Convert.ToHexString(buf); // e.g., 64 hex chars for 32 bytes
    }
}
