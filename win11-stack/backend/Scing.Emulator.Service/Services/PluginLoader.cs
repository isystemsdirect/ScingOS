using System.IO.Compression;
using System.Text.Json;

namespace Scing.Emulator.Service.Services;

public sealed class PluginLoader
{
  private readonly AppPaths _paths;

  public PluginLoader(AppPaths paths)
  {
    _paths = paths;
  }

  public async Task<(PluginManifest manifest, string stagingDir)> UnpackToStagingAsync(Stream zipStream, CancellationToken ct)
  {
    _paths.EnsureCreated();

    var stagingDir = Path.Combine(_paths.PluginsDir, $"_staging_{Guid.NewGuid():N}");
    Directory.CreateDirectory(stagingDir);

    await using var ms = new MemoryStream();
    await zipStream.CopyToAsync(ms, ct);
    ms.Position = 0;

    using (var zip = new ZipArchive(ms, ZipArchiveMode.Read, leaveOpen: true))
    {
      zip.ExtractToDirectory(stagingDir, overwriteFiles: true);
    }

    var manifest = ReadManifestFromDirectory(stagingDir);
    ValidatePackageLayout(stagingDir, manifest);

    return (manifest, stagingDir);
  }

  public PluginManifest ReadManifestFromInstalledDir(string pluginDir)
  {
    var manifestPath = Path.Combine(pluginDir, "manifest.json");
    if (!File.Exists(manifestPath)) throw new InvalidOperationException("manifest.json missing");

    var json = File.ReadAllText(manifestPath);
    var manifest = JsonSerializer.Deserialize<PluginManifest>(json, PluginJson.Options);
    if (manifest is null) throw new InvalidOperationException("manifest.json invalid");

    ValidateManifestFields(manifest);
    return manifest;
  }

  private static PluginManifest ReadManifestFromDirectory(string root)
  {
    var manifestPath = Path.Combine(root, "manifest.json");
    if (!File.Exists(manifestPath)) throw new InvalidOperationException("manifest.json missing");

    var json = File.ReadAllText(manifestPath);
    var manifest = JsonSerializer.Deserialize<PluginManifest>(json, PluginJson.Options);
    if (manifest is null) throw new InvalidOperationException("manifest.json invalid");

    ValidateManifestFields(manifest);
    return manifest;
  }

  private static void ValidateManifestFields(PluginManifest manifest)
  {
    if (string.IsNullOrWhiteSpace(manifest.Id)) throw new InvalidOperationException("manifest.id required");
    if (string.IsNullOrWhiteSpace(manifest.Name)) throw new InvalidOperationException("manifest.name required");
    if (string.IsNullOrWhiteSpace(manifest.Version)) throw new InvalidOperationException("manifest.version required");
    if (string.IsNullOrWhiteSpace(manifest.Entrypoint)) throw new InvalidOperationException("manifest.entrypoint required");
    if (string.IsNullOrWhiteSpace(manifest.Target)) throw new InvalidOperationException("manifest.target required");
    if (!string.Equals(manifest.Target, "win11-service", StringComparison.Ordinal))
      throw new InvalidOperationException("manifest.target must be 'win11-service'");
    _ = manifest.Capabilities ?? Array.Empty<string>();
  }

  private static void ValidatePackageLayout(string root, PluginManifest manifest)
  {
    var binDir = Path.Combine(root, "bin");
    if (!Directory.Exists(binDir)) throw new InvalidOperationException("/bin directory missing");

    var entry = manifest.Entrypoint.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
    var entryPath = Path.Combine(binDir, entry);
    if (!File.Exists(entryPath)) throw new InvalidOperationException("entrypoint not found under /bin");
  }
}
