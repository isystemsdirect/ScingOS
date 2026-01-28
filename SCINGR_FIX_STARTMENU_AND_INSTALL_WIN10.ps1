# SCINGR_FIX_STARTMENU_AND_INSTALL_WIN10.ps1
# Run from repo root (Windows 10 Pro).
# Rewrites Package.wxs into a deterministic per-user installer (WiX v4 schema),
# builds MSI, uninstalls prior ScingR (best-effort), installs, verifies files + Start Menu shortcut, and launches.

$ErrorActionPreference = "Stop"

$root    = (Get-Location).Path
$wixDir  = Join-Path $root "win10-stack\installer\wix"
$payload = Join-Path $root "win10-stack\installer\payload"
$wxsPath = Join-Path $wixDir "Package.wxs"
$outDir  = Join-Path $wixDir "out"
$msiPath = Join-Path $outDir "ScingR.msi"
$tmpDir  = Join-Path $root ".tmp"
$logPath = Join-Path $tmpDir "scingr_install.log"
$uninstallLogPath = Join-Path $tmpDir "scingr_uninstall.log"

New-Item -ItemType Directory -Force -Path $outDir, $tmpDir | Out-Null

function Find-WixExe {
  $cmd = Get-Command wix.exe -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Path }

  $candidates = @(
    "$env:ProgramFiles\WiX Toolset v6.0\bin\wix.exe",
    "$env:ProgramFiles\WiX Toolset v5.0\bin\wix.exe",
    "$env:ProgramFiles\WiX Toolset v4.0\bin\wix.exe",
    "$env:ProgramFiles(x86)\WiX Toolset v6.0\bin\wix.exe",
    "$env:ProgramFiles(x86)\WiX Toolset v5.0\bin\wix.exe",
    "$env:ProgramFiles(x86)\WiX Toolset v4.0\bin\wix.exe"
  )
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  throw "wix.exe not found. Install WiX CLI (v4+) or add to PATH."
}

function Get-ScingRUninstallGuid {
  $uninstallRoots = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
  )

  $apps = foreach ($k in $uninstallRoots) { Get-ItemProperty -Path $k -ErrorAction SilentlyContinue }
  $scing = $apps |
    Where-Object { $_.DisplayName -and ($_.DisplayName -match '^ScingR$' -or $_.DisplayName -match 'ScingR') } |
    Select-Object -First 1 DisplayName, UninstallString, PSChildName

  if (-not $scing) { return $null }

  $guid = $null
  if ($scing.UninstallString -match '{[0-9A-Fa-f-]{36}}') { $guid = $Matches[0] }
  elseif ($scing.PSChildName -match '{[0-9A-Fa-f-]{36}}') { $guid = $Matches[0] }
  return $guid
}

# Preconditions
if (!(Test-Path $payload)) { throw "Missing payload folder: $payload" }
foreach ($f in @("scingr-run.cmd", "scingr.version.txt")) {
  $p = Join-Path $payload $f
  if (!(Test-Path $p)) { throw "Missing payload file: $p" }
}
if (!(Test-Path $wixDir)) { throw "Missing wix dir: $wixDir" }

$wixExe = Find-WixExe

Write-Host "============================================================"
Write-Host " SCINGR FIX: Deterministic per-user install + Start Menu"
Write-Host "============================================================"
Write-Host "ROOT    : $root"
Write-Host "WIX     : $wixExe"
Write-Host "PAYLOAD : $payload"
Write-Host "WXS     : $wxsPath"
Write-Host "MSI     : $msiPath"
Write-Host "LOG     : $logPath"
Write-Host ""

& $wixExe --version | ForEach-Object { Write-Host "wix_version=$_" }
Write-Host ""

# 1) Uninstall any existing ScingR (best-effort) so we don’t chase cached components
Write-Host "[1] Uninstall existing ScingR (best-effort)"
$guid = Get-ScingRUninstallGuid
if ($guid) {
  Write-Host "Uninstalling ProductCode: $guid"
  if (Test-Path $uninstallLogPath) { Remove-Item $uninstallLogPath -Force }
  $u = Start-Process msiexec.exe -ArgumentList @("/x", $guid, "/qn", "/norestart", "/l*v", $uninstallLogPath) -Wait -PassThru
  Write-Host "msiexec_uninstall_return_code=$($u.ExitCode)"
  if ($u.ExitCode -ne 0) {
    throw "Uninstall failed with code $($u.ExitCode). See: $uninstallLogPath"
  }
} else {
  Write-Host "No prior ScingR uninstall entry found."
}
Write-Host ""

# 2) Rewrite Package.wxs to a clean deterministic per-user structure (WiX v4 schema)
Write-Host "[2] Writing deterministic Package.wxs (per-user LocalAppData + Start Menu shortcut)"

# Keep this stable so MajorUpgrade can detect previous versions.
$upgradeCode = "{42211177-2977-4A25-A66B-548C95088A10}"

$package = @"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://wixtoolset.org/schemas/v4/wxs">
  <Package
    Name="ScingR"
    Manufacturer="Inspection Systems Direct LLC"
    Version="0.0.1"
    UpgradeCode="$upgradeCode"
    Scope="perUser">

    <MajorUpgrade DowngradeErrorMessage="A newer version of ScingR is already installed." />
    <MediaTemplate />

    <StandardDirectory Id="LocalAppDataFolder">
      <Directory Id="INSTALLFOLDER" Name="ScingR" />
    </StandardDirectory>

    <StandardDirectory Id="ProgramMenuFolder">
      <Directory Id="AppProgramsFolder" Name="ScingR" />
    </StandardDirectory>

    <DirectoryRef Id="INSTALLFOLDER">
      <!-- Split into single-file components so Guid="*" is valid (WIX0367 avoidance). -->
      <Component Id="PayloadRunComponent" Guid="*">
        <File Id="fil_scingr_run" Source="..\payload\scingr-run.cmd" KeyPath="yes" />
      </Component>

      <Component Id="PayloadVersionComponent" Guid="*">
        <File Id="fil_scingr_ver" Source="..\payload\scingr.version.txt" KeyPath="yes" />
      </Component>

      <Component Id="RegistryComponent" Guid="*">
        <RegistryValue
          Root="HKCU"
          Key="Software\\Inspection Systems Direct LLC\\ScingR"
          Name="Installed"
          Type="integer"
          Value="1"
          KeyPath="yes" />
      </Component>
    </DirectoryRef>

    <DirectoryRef Id="AppProgramsFolder">
      <Component Id="StartMenuComponent" Guid="*">
        <Shortcut
          Id="scut_RunScingR"
          Name="Run ScingR"
          Description="Launch ScingR"
          Target="[INSTALLFOLDER]scingr-run.cmd"
          WorkingDirectory="INSTALLFOLDER" />
        <RemoveFolder Id="rm_AppProgramsFolder" Directory="AppProgramsFolder" On="uninstall" />
        <RegistryValue Root="HKCU" Key="Software\\Inspection Systems Direct LLC\\ScingR" Name="StartMenu" Type="integer" Value="1" KeyPath="yes" />
      </Component>
    </DirectoryRef>

    <Feature Id="MainFeature" Title="ScingR" Level="1">
      <ComponentRef Id="PayloadRunComponent" />
      <ComponentRef Id="PayloadVersionComponent" />
      <ComponentRef Id="StartMenuComponent" />
      <ComponentRef Id="RegistryComponent" />
    </Feature>

  </Package>
</Wix>
"@

Set-Content -LiteralPath $wxsPath -Value $package -Encoding UTF8
Write-Host "[OK] Package.wxs rewritten."
Write-Host ""

# 3) Build MSI (ensure we don't accidentally reuse a stale MSI)
Write-Host "[3] Build MSI"
if (Test-Path $msiPath) { Remove-Item $msiPath -Force }
Push-Location $wixDir
& $wixExe build "Package.wxs" -o "out\ScingR.msi"
$buildExit = $LASTEXITCODE
Pop-Location
if ($buildExit -ne 0) { throw "wix build failed with code $buildExit" }
if (!(Test-Path $msiPath)) { throw "MSI not created: $msiPath" }
(Get-Item $msiPath | Select-Object FullName, Length, LastWriteTime | Format-List | Out-String).Trim() | Write-Host
Write-Host ""

# 4) Install MSI silently + log
Write-Host "[4] Install MSI (/qn) + log"
if (Test-Path $logPath) { Remove-Item $logPath -Force }
$proc = Start-Process msiexec.exe -ArgumentList @("/i", $msiPath, "/qn", "/norestart", "/l*v", $logPath) -Wait -PassThru
Write-Host "msiexec_return_code=$($proc.ExitCode)"
if ($proc.ExitCode -ne 0) { throw "Install failed with code $($proc.ExitCode). See: $logPath" }
Write-Host ""

# 5) Verify: files installed to LocalAppData + shortcut exists
Write-Host "[5] Verify files + Start Menu shortcut"
$installDir = Join-Path $env:LOCALAPPDATA "ScingR"
$shortcutDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\ScingR"
$shortcutPath = Join-Path $shortcutDir "Run ScingR.lnk"

Write-Host ("install_dir=" + $installDir)
Write-Host ("install_dir_exists=" + (Test-Path $installDir))
if (Test-Path $installDir) {
  Get-ChildItem -LiteralPath $installDir -Force | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize | Out-Host
}

Write-Host ("shortcut_path=" + $shortcutPath)
Write-Host ("shortcut_exists=" + (Test-Path $shortcutPath))
Write-Host ""

Write-Host "[6] Log tail (last 60 lines)"
if (Test-Path $logPath) { Get-Content -LiteralPath $logPath -Tail 60 | Out-Host } else { Write-Host "log_missing" }
Write-Host ""

# 6) Launch installed runtime (direct) so we don’t depend on Start Menu indexing
Write-Host "[7] Launch ScingR runtime (direct from install dir)"
$runCmd = Join-Path $installDir "scingr-run.cmd"
if (Test-Path $runCmd) {
  Start-Process -FilePath $runCmd
  Write-Host "[OK] Launched: $runCmd"
} else {
  Write-Host "[WARN] scingr-run.cmd not found at expected install path."
}

Write-Host ""
Write-Host "============================================================"
Write-Host "DONE. If shortcut is missing, paste:"
Write-Host "  - shortcut_exists= line"
Write-Host "  - log tail"
Write-Host "============================================================"
