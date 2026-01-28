Set-Location "G:\GIT\isystemsdirect\ScingOS"
$ErrorActionPreference = "Stop"

$wixDir  = "win10-stack\installer\wix"
$wxsPath = Join-Path $wixDir "Package.wxs"
$outDir  = Join-Path $wixDir "out"
$msiPath = Join-Path $outDir "ScingR.msi"
$tmpDir  = ".tmp"
$logPath = Join-Path $tmpDir "scingr_install.log"

New-Item -ItemType Directory -Force -Path $outDir, $tmpDir | Out-Null
if (!(Test-Path $wxsPath)) { throw "Missing: $wxsPath" }

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

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) { return $candidate }
  }

  throw "wix.exe not found. Ensure WiX v4+ is installed (WiX v6 CLI recommended)."
}

$wixExe = Find-WixExe
Write-Host "Using wix.exe: $wixExe"
& $wixExe --version | ForEach-Object { Write-Host "wix_version=$_" }

$xml = Get-Content -LiteralPath $wxsPath -Raw
if ($xml -notmatch 'http://wixtoolset\.org/schemas/v4/wxs') { throw "Not WiX v4 authoring." }

# ---- Robust edit: operate inside the StartMenuComponent block only ----
$rxOpts = [System.Text.RegularExpressions.RegexOptions]::Singleline
$startMenuMatch = [regex]::Match(
  $xml,
  '(<Component\s+Id="StartMenuComponent"[\s\S]*?>)([\s\S]*?)(</Component>)',
  $rxOpts
)

if (-not $startMenuMatch.Success) { throw "StartMenuComponent block not found." }

$openTag  = $startMenuMatch.Groups[1].Value
$inner    = $startMenuMatch.Groups[2].Value
$closeTag = $startMenuMatch.Groups[3].Value

# Remove any existing Uninstall shortcut (self-closing or paired, any formatting)
$inner2 = [regex]::Replace(
  $inner,
  '<Shortcut\b(?:(?!<Shortcut\b)[\s\S])*?Id="scut_UninstallScingR"(?:(?!<Shortcut\b)[\s\S])*?(?:/>|</Shortcut>)\s*',
  '',
  $rxOpts
)

# Ensure scut_RunScingR exists (avoid silent no-op / incorrect patching)
if ($inner2 -notmatch 'Id="scut_RunScingR"') {
  throw "scut_RunScingR not found inside StartMenuComponent. Refusing to patch blindly."
}

$uninstallShortcut = @'
        <Shortcut
          Id="scut_UninstallScingR"
          Name="Uninstall ScingR"
          Description="Open Programs and Features to uninstall ScingR"
          Target="[SystemFolder]control.exe"
          Arguments="appwiz.cpl"
          WorkingDirectory="INSTALLFOLDER" />
'@

# Insert Uninstall shortcut immediately after the Run shortcut (first occurrence)
$rxRunShortcut = [regex]::new(
  '(<Shortcut\b[\s\S]*?Id="scut_RunScingR"[\s\S]*?(?:/>|</Shortcut>)\s*)',
  $rxOpts
)

$inner3 = $rxRunShortcut.Replace(
  $inner2,
  ('$1' + $uninstallShortcut),
  1
)

$patchedComponent = $openTag + $inner3 + $closeTag
$xml2 = $xml.Substring(0, $startMenuMatch.Index) + $patchedComponent + $xml.Substring($startMenuMatch.Index + $startMenuMatch.Length)

# Sanity: confirm uninstall shortcut now present
if ($xml2 -notmatch 'Id="scut_UninstallScingR"') { throw "Patch failed: uninstall shortcut not present after edit." }

Set-Content -LiteralPath $wxsPath -Value $xml2 -Encoding UTF8
Write-Host "[OK] StartMenuComponent patched (Uninstall shortcut ensured)."

# ---- Build MSI ----
Push-Location $wixDir
& $wixExe build "Package.wxs" -o "out\ScingR.msi"
$buildRc = $LASTEXITCODE
Pop-Location

Write-Host "wix_build_rc=$buildRc"
if ($buildRc -ne 0) { throw "wix build failed." }
if (!(Test-Path $msiPath)) { throw "MSI not created: $msiPath" }

# ---- Install with forced reinstall so shortcuts get written even if already installed ----
if (Test-Path $logPath) { Remove-Item $logPath -Force }

$msiFull = (Resolve-Path $msiPath).Path
$logFull = (Resolve-Path $tmpDir).Path + "\scingr_install.log"

$arguments = @(
  "/i", "`"$msiFull`"",
  "REINSTALL=ALL",
  "REINSTALLMODE=amusv",
  "/qn",
  "/norestart",
  "/l*v", "`"$logFull`""
)

$proc = Start-Process msiexec.exe -ArgumentList $arguments -Wait -PassThru
Write-Host "msiexec_return_code=$($proc.ExitCode)"
if ($proc.ExitCode -ne 0) { throw "msiexec failed (rc=$($proc.ExitCode)). See $logFull" }

# ---- Verify shortcuts ----
$shortcutDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\ScingR"
$runLnk      = Join-Path $shortcutDir "Run ScingR.lnk"
$unLnk       = Join-Path $shortcutDir "Uninstall ScingR.lnk"

Write-Host "shortcut_dir=$shortcutDir"
Write-Host ("run_shortcut_exists=" + (Test-Path $runLnk))
Write-Host ("uninstall_shortcut_exists=" + (Test-Path $unLnk))

Get-ChildItem -LiteralPath $shortcutDir -Force -ErrorAction SilentlyContinue |
  Select Name, Length, LastWriteTime | Format-Table -AutoSize
