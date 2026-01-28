# SCINGR_WIRE_PAYLOAD_INTO_MSI_WIN10.ps1
# Run from repo root in VS Code (Windows 10 Pro).
# Wires payload into win10-stack\installer\wix\Package.wxs (WiX v4 schema), builds MSI via WiX CLI (v4+), installs per-user, verifies artifacts.

$ErrorActionPreference = "Stop"

$root    = (Get-Location).Path
$wixDir  = Join-Path $root "win10-stack\installer\wix"
$payload = Join-Path $root "win10-stack\installer\payload"
$wxsPath = Join-Path $wixDir "Package.wxs"
$outDir  = Join-Path $wixDir "out"
$msiPath = Join-Path $outDir "ScingR.msi"
$tmpDir  = Join-Path $root ".tmp"
$logPath = Join-Path $tmpDir "scingr_install.log"

Write-Host "============================================================"
Write-Host " SCINGR: Wire payload into MSI + Build + Install (Win10 Pro)"
Write-Host "============================================================"
Write-Host "ROOT   : $root"
Write-Host "WXS    : $wxsPath"
Write-Host "PAYLOAD: $payload"
Write-Host "MSI    : $msiPath"
Write-Host "LOG    : $logPath"
Write-Host ""

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
  foreach ($c in $candidates) {
    if (Test-Path $c) { return $c }
  }
  throw "wix.exe not found. Install WiX CLI (v4+), or add wix.exe to PATH."
}

function Ensure-InsertAfterOnce {
  param(
    [Parameter(Mandatory = $true)][string]$Content,
    [Parameter(Mandatory = $true)][string]$MissingPattern,
    [Parameter(Mandatory = $true)][string]$AfterPattern,
    [Parameter(Mandatory = $true)][string]$InsertBlock
  )

  if ($Content -match $MissingPattern) { return $Content }

  $updated = [regex]::Replace($Content, $AfterPattern, { param($m) $m.Value + "`r`n" + $InsertBlock }, 1)
  if ($updated -eq $Content) {
    throw "Failed to patch Package.wxs. Could not find insertion point for pattern: $AfterPattern"
  }
  return $updated
}

function Ensure-InsertBeforeOnce {
  param(
    [Parameter(Mandatory = $true)][string]$Content,
    [Parameter(Mandatory = $true)][string]$MissingPattern,
    [Parameter(Mandatory = $true)][string]$BeforePattern,
    [Parameter(Mandatory = $true)][string]$InsertBlock
  )

  if ($Content -match $MissingPattern) { return $Content }

  $updated = [regex]::Replace($Content, $BeforePattern, { param($m) $InsertBlock + "`r`n" + $m.Value }, 1)
  if ($updated -eq $Content) {
    throw "Failed to patch Package.wxs. Could not find insertion point for pattern: $BeforePattern"
  }
  return $updated
}

# --- Preconditions ---
if (!(Test-Path $payload)) { throw "Missing payload folder: $payload" }
foreach ($f in @("scingr-run.cmd", "scingr.version.txt")) {
  $p = Join-Path $payload $f
  if (!(Test-Path $p)) { throw "Missing payload file: $p" }
}
if (!(Test-Path $wxsPath)) { throw "Missing Package.wxs: $wxsPath" }

New-Item -ItemType Directory -Force -Path $outDir, $tmpDir | Out-Null

$wixExe = Find-WixExe
Write-Host "Using wix.exe: $wixExe"
& $wixExe --version | ForEach-Object { Write-Host "wix_version=$_" }
Write-Host ""

# --- Patch Package.wxs (idempotent; WiX v4 style: StandardDirectory + DirectoryRef) ---
# Goals:
# 1) Install payload files under LocalAppDataFolder\ScingR\ (per-user)
# 2) Add Start Menu shortcut: Start Menu -> ScingR -> Run ScingR (per-user)
# 3) Wire components into MainFeature

$xml = Get-Content -LiteralPath $wxsPath -Raw

# Force per-user scope (avoid silent elevation failures)
if ($xml -match '<Package\b[\s\S]*?\bScope="(perMachine|perUser)"') {
  $xml = [regex]::Replace($xml, '(<Package\b[\s\S]*?\bScope=")perMachine("[\s\S]*?>)', '`$1perUser`$2', 1)
}

$localAppDataBlock = @'
    <StandardDirectory Id="LocalAppDataFolder">
      <Directory Id="INSTALLFOLDER" Name="ScingR" />
    </StandardDirectory>
'@

$programMenuBlock = @'
    <StandardDirectory Id="ProgramMenuFolder">
      <Directory Id="AppProgramsFolder" Name="ScingR" />
    </StandardDirectory>
'@

# Ensure StandardDirectory blocks exist (insert after <MediaTemplate />)
$xml = Ensure-InsertAfterOnce -Content $xml -MissingPattern 'StandardDirectory\s+Id="LocalAppDataFolder"' -AfterPattern '<MediaTemplate\s*/>' -InsertBlock $localAppDataBlock
$xml = Ensure-InsertAfterOnce -Content $xml -MissingPattern 'StandardDirectory\s+Id="ProgramMenuFolder"' -AfterPattern 'StandardDirectory\s+Id="LocalAppDataFolder"[\s\S]*?</StandardDirectory>' -InsertBlock $programMenuBlock

$installDirRefBlock = @'
    <DirectoryRef Id="INSTALLFOLDER">
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
'@

# Ensure DirectoryRef exists (insert before Feature)
$xml = Ensure-InsertBeforeOnce -Content $xml -MissingPattern '<DirectoryRef\s+Id="INSTALLFOLDER"' -BeforePattern '<Feature\b' -InsertBlock $installDirRefBlock

# Ensure Start Menu DirectoryRef exists (insert before Feature)
$startMenuDirRefBlock = @'
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
'@

$xml = Ensure-InsertBeforeOnce -Content $xml -MissingPattern '<DirectoryRef\s+Id="AppProgramsFolder"' -BeforePattern '<Feature\b' -InsertBlock $startMenuDirRefBlock

# Ensure Feature exists
if ($xml -notmatch '<Feature\s+Id="MainFeature"') {
  throw "MainFeature not found in Package.wxs. Ensure scaffold contains <Feature Id=""MainFeature"">."
}

# Ensure Feature references the components (insert after feature open tag)
if ($xml -notmatch '<ComponentRef\s+Id="PayloadRunComponent"') {
  $xml = [regex]::Replace($xml, '(<Feature\s+Id="MainFeature"[^>]*>\s*)', '`$1' + "`r`n      <ComponentRef Id=""PayloadRunComponent"" />`r`n", 1)
}
if ($xml -notmatch '<ComponentRef\s+Id="PayloadVersionComponent"') {
  $xml = [regex]::Replace($xml, '(<Feature\s+Id="MainFeature"[^>]*>\s*)', '`$1' + "`r`n      <ComponentRef Id=""PayloadVersionComponent"" />`r`n", 1)
}
if ($xml -notmatch '<ComponentRef\s+Id="StartMenuComponent"') {
  $xml = [regex]::Replace($xml, '(<Feature\s+Id="MainFeature"[^>]*>\s*)', '`$1' + "`r`n      <ComponentRef Id=""StartMenuComponent"" />`r`n", 1)
}
if ($xml -notmatch '<ComponentRef\s+Id="RegistryComponent"') {
  $xml = [regex]::Replace($xml, '(<Feature\s+Id="MainFeature"[^>]*>\s*)', '`$1' + "`r`n      <ComponentRef Id=""RegistryComponent"" />`r`n", 1)
}

Set-Content -LiteralPath $wxsPath -Value $xml -Encoding UTF8
Write-Host "[OK] Patched Package.wxs (idempotent)"
Write-Host ""

# --- Build MSI ---
Write-Host "[BUILD] wix build Package.wxs -> out\ScingR.msi"
Push-Location $wixDir
& $wixExe build "Package.wxs" -o "out\ScingR.msi"
Pop-Location

if (!(Test-Path $msiPath)) { throw "MSI not created: $msiPath" }
$msiInfo = Get-Item $msiPath | Select-Object FullName, Length, LastWriteTime
Write-Host "[OK] MSI built:"
$msiInfo | Format-List | Out-String | Write-Host
Write-Host ""

# --- Install MSI silently + log ---
if (Test-Path $logPath) { Remove-Item $logPath -Force }
Write-Host "[INSTALL] msiexec /i ScingR.msi /qn (per-user) with verbose log"
$proc = Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", $msiPath, "/qn", "/norestart", "/l*v", $logPath) -Wait -PassThru
Write-Host "msiexec_return_code=$($proc.ExitCode)"
Write-Host ""

# --- Verify artifacts ---
$installDir = Join-Path $env:LOCALAPPDATA "ScingR"
$installedRun = Join-Path $installDir "scingr-run.cmd"
$installedVer = Join-Path $installDir "scingr.version.txt"

Write-Host "[VERIFY] Installed files (per-user LocalAppData)"
Write-Host "InstallDir: $installDir"
Write-Host ("run_exists=" + (Test-Path $installedRun) + " :: " + $installedRun)
Write-Host ("ver_exists=" + (Test-Path $installedVer) + " :: " + $installedVer)
Write-Host ""

Write-Host "[VERIFY] Expected Start Menu shortcut (per-user):"
$shortcutDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\ScingR"
$shortcutPath = Join-Path $shortcutDir "Run ScingR.lnk"
Write-Host "ShortcutDir : $shortcutDir"
Write-Host "ShortcutPath: $shortcutPath"
Write-Host ("shortcut_exists=" + (Test-Path $shortcutPath))
Write-Host ""

Write-Host "[VERIFY] Uninstall entry (HKCU) matching ScingR (best-effort)"
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' -ErrorAction SilentlyContinue |
  Where-Object { $_.DisplayName -match 'ScingR' } |
  Select-Object DisplayName, DisplayVersion, Publisher, InstallLocation, UninstallString |
  Format-List | Out-Host

Write-Host "[VERIFY] Tail install log (last 60 lines):"
if (Test-Path $logPath) {
  Get-Content -LiteralPath $logPath -Tail 60 | Out-Host
} else {
  Write-Host "log_missing"
}

Write-Host ""
Write-Host "============================================================"
Write-Host "NEXT MANUAL CHECK (1 minute): Start Menu -> ScingR -> Run ScingR"
Write-Host "============================================================"
