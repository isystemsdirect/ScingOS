namespace Scing.Emulator.Service.Services;

public sealed class AppPaths
{
  public string ProgramDataRoot { get; }
  public string PluginsDir { get; }
  public string LogsDir { get; }
  public string AuditDir { get; }
  public string DataDir { get; }
  public string ConfigPath { get; }

  public AppPaths(IConfiguration config)
  {
    var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
    ProgramDataRoot = Path.Combine(programData, "ScingOS");

    PluginsDir = Path.Combine(ProgramDataRoot, "Plugins");
    LogsDir = Path.Combine(ProgramDataRoot, "Logs");
    AuditDir = Path.Combine(ProgramDataRoot, "Audit");
    DataDir = Path.Combine(ProgramDataRoot, "Emulator");

    var configFileName = config["ScingEmulator:ConfigFileName"] ?? "config.json";
    ConfigPath = Path.Combine(DataDir, configFileName);
  }

  public void EnsureCreated()
  {
    Directory.CreateDirectory(ProgramDataRoot);
    Directory.CreateDirectory(PluginsDir);
    Directory.CreateDirectory(LogsDir);
    Directory.CreateDirectory(AuditDir);
    Directory.CreateDirectory(DataDir);
  }
}
