# SCINGR_REPO_AUDIT_AND_SCAFFOLD_WIN10.ps1
# Run in VS Code terminal from repo root (Windows 10 Pro).
# Purpose:
#   A) Prove whether ScingR/WiX installer sources exist in this repo checkout.
#   B) If missing, scaffold a new WiX installer folder and minimal Package.wxs so ScingR packaging can be rebuilt.

$ErrorActionPreference = "Stop"

Write-Host "============================================================"
Write-Host " SCINGR REPO AUDIT + SCAFFOLD (Windows 10 Pro)"
Write-Host "============================================================"
$repoRoot = (Get-Location).Path
Write-Host "REPO_ROOT=$repoRoot"

Write-Host "`n[1] Git sanity + recent commits"
if (Test-Path ".git") {
  git rev-parse --is-inside-work-tree | Out-Host
  git remote -v | Out-Host
  git log -n 10 --oneline | Out-Host
} else {
  Write-Warning ".git not found. You may not be at repo root."
}

Write-Host "`n[2] Search for ScingR references (names, service hooks, build scripts)"
$patterns = @(
  "ScingR", "scingr", "Scing R",
  "Service", "Windows Service",
  "msiexec", "wix", "candle", "light",
  "Package.wxs", ".wxs", ".wixproj",
  "installer", "msi", "setup"
)

# Fast file scan (avoid node_modules/dist/bin/obj/.git etc by path segment)
$excludeDirNames = @("node_modules", "dist", "build", "out", "bin", "obj", ".git")
$excludeRegex = "\\(" + (($excludeDirNames | ForEach-Object { [regex]::Escape($_) }) -join "|") + ")\\"

$allFiles = Get-ChildItem -Recurse -File -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch $excludeRegex }

$hits = New-Object System.Collections.Generic.List[object]
foreach ($p in $patterns) {
  $m = Select-String -Path $allFiles.FullName -Pattern $p -SimpleMatch -ErrorAction SilentlyContinue
  foreach ($x in $m) {
    $hits.Add([pscustomobject]@{
      Pattern = $p
      File    = $x.Path
      Line    = $x.LineNumber
      Text    = $x.Line.Trim()
    })
  }
}

if ($hits.Count -gt 0) {
  Write-Host "`n[FOUND] Reference hits (top 60):"
  $hits | Sort-Object File, Line | Select-Object -First 60 | Format-Table -AutoSize | Out-Host
} else {
  Write-Host "`n[OK] No textual references found for common ScingR/WiX/MSI terms."
}

Write-Host "`n[3] Explicitly locate WiX source artifacts"
$wxs = Get-ChildItem -Recurse -Filter "Package.wxs" -File -ErrorAction SilentlyContinue
$wixproj = Get-ChildItem -Recurse -Filter "*.wixproj" -File -ErrorAction SilentlyContinue
$wxsAny = Get-ChildItem -Recurse -Filter "*.wxs" -File -ErrorAction SilentlyContinue

if ($wxs.Count -gt 0 -or $wixproj.Count -gt 0 -or $wxsAny.Count -gt 0) {
  Write-Host "[FOUND] WiX artifacts present:"
  if ($wxs.Count -gt 0)     { $wxs.FullName | Out-Host }
  if ($wixproj.Count -gt 0) { $wixproj.FullName | Out-Host }
  if ($wxsAny.Count -gt 0)  { Write-Host "Other .wxs files:"; $wxsAny.FullName | Select-Object -First 50 | Out-Host }
  Write-Host "`nResult: Installer sources appear to exist somewhere already. We should point the bring-up script at these paths."
  exit 0
}

Write-Host "`n[4] No WiX sources found. Scaffolding a new installer layer in this repo..."
$wixDir = Join-Path $repoRoot "win10-stack\installer\wix"
$outDir = Join-Path $wixDir "out"
New-Item -ItemType Directory -Force -Path $wixDir, $outDir | Out-Null

# Minimal Package.wxs (template) - will build only after you define real payload files.
# This is intentionally conservative and clearly marked TODO.
$packageWxsPath = Join-Path $wixDir "Package.wxs"
$packageWxs = @"
<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Wix xmlns=\"http://schemas.microsoft.com/wix/2006/wi\">
  <!--
    ScingR Installer (Scaffold)
    Windows 10 Pro compatible.

    TODO (next steps after scaffold exists in repo):
      1) Decide what ScingR *is* in this repo: service exe? tray app? node runtime?
      2) Place built artifacts into a predictable folder (e.g., ..\payload\)
      3) Add <File Source=\"...\"> entries and component GUIDs
      4) (Optional) Add ServiceInstall/ServiceControl if ScingR is a Windows service
  -->

  <Product Id=\"*\" Name=\"ScingR\" Language=\"1033\" Version=\"0.0.1\" Manufacturer=\"Inspection Systems Direct LLC\" UpgradeCode=\"PUT-GUID-HERE-ONCE-LOCKED\">
    <Package InstallerVersion=\"500\" Compressed=\"yes\" InstallScope=\"perMachine\" />

    <MajorUpgrade DowngradeErrorMessage=\"A newer version of ScingR is already installed.\" />
    <MediaTemplate />

    <Property Id=\"ARPPRODUCTICON\" Value=\"ScingR.ico\" />

    <Directory Id=\"TARGETDIR\" Name=\"SourceDir\">
      <Directory Id=\"ProgramFilesFolder\">
        <Directory Id=\"INSTALLFOLDER\" Name=\"ScingR\">
          <!-- TODO: Add Component(s) + File payload here -->
        </Directory>
      </Directory>
    </Directory>

    <Feature Id=\"MainFeature\" Title=\"ScingR\" Level=\"1\">
      <!-- TODO: Reference ComponentGroup(s) here -->
    </Feature>
  </Product>
</Wix>
"@
Set-Content -Path $packageWxsPath -Value $packageWxs -Encoding UTF8

# Minimal README to explain why it exists
$readmePath = Join-Path $wixDir "README.md"
$readme = @"
# ScingR Installer (WiX) - Scaffold

This folder was generated because the repo checkout did not contain any existing WiX installer sources (no `.wxs` / `.wixproj` found).

## What this provides
- A minimal `Package.wxs` template that is Windows 10 Pro compatible.
- `out/` directory for build artifacts.

## What is still needed
1. Identify ScingR deliverable(s) produced by this repo (EXE, service, Node runtime, etc.).
2. Place build outputs into a known folder (recommended: `win10-stack/installer/payload/`).
3. Update `Package.wxs` to include:
   - Component(s)
   - File payload
   - Optional Windows Service installation (if ScingR runs as a service)
4. Add a stable UpgradeCode GUID once the product identity is locked.

## Build
After WiX Toolset is installed (candle/light on PATH):
- `candle Package.wxs -out out\\Package.wixobj`
- `light out\\Package.wixobj -out out\\ScingR.msi`
"@
Set-Content -Path $readmePath -Value $readme -Encoding UTF8

Write-Host "`n[OK] Scaffold created:"
Write-Host " - $packageWxsPath"
Write-Host " - $readmePath"
Write-Host " - $outDir"

Write-Host "`n[5] Git status (you can commit this scaffold)"
if (Test-Path ".git") {
  git status -sb | Out-Host
} else {
  Write-Warning "Not a git repo root; cannot show status."
}

Write-Host "`n============================================================"
Write-Host "NEXT: Paste the output of section [2] hit table (if any) here."
Write-Host "If there were no hits, tell me: in this repo, where is ScingR supposed to be produced (which folder/build step)?"
Write-Host "============================================================"
