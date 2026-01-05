using System.Text;

namespace Scing.Emulator.Service.Services;

public sealed class LogTailer
{
  private readonly AppPaths _paths;

  public LogTailer(AppPaths paths)
  {
    _paths = paths;
  }

  public string Tail(int lines = 200)
  {
    _paths.EnsureCreated();

    var dir = new DirectoryInfo(_paths.LogsDir);
    if (!dir.Exists)
    {
      return string.Empty;
    }

    var file = dir.GetFiles("ScingEmulatorService-*.log")
      .OrderByDescending(f => f.LastWriteTimeUtc)
      .FirstOrDefault();

    if (file is null)
    {
      return string.Empty;
    }

    // Simple tail (reads whole file). Fine for dev-gated endpoint.
    var all = File.ReadAllLines(file.FullName);
    var start = Math.Max(0, all.Length - lines);

    var sb = new StringBuilder();
    for (var i = start; i < all.Length; i++)
    {
      sb.AppendLine(all[i]);
    }

    return sb.ToString();
  }
}
