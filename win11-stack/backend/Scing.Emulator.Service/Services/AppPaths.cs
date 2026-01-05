namespace Scing.Emulator.Service.Services;

public sealed class AppPaths
{
  public string ProgramDataRoot { get; }
  public string LogsDir { get; }
  public string DataDir { get; }
  public string ConfigPath { get; }

  public AppPaths(IConfiguration config)
  {
    var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
    ProgramDataRoot = Path.Combine(programData, "ScingOS");

    LogsDir = Path.Combine(ProgramDataRoot, "Logs");
    DataDir = Path.Combine(ProgramDataRoot, "Emulator");

    var configFileName = config["ScingEmulator:ConfigFileName"] ?? "config.json";
    ConfigPath = Path.Combine(DataDir, configFileName);
  }

  public void EnsureCreated()
  {
    Directory.CreateDirectory(ProgramDataRoot);
    Directory.CreateDirectory(LogsDir);
    Directory.CreateDirectory(DataDir);
  }
}
