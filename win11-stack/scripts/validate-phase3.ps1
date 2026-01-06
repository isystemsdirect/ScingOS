param(
  [switch]$SkipUiInstall
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$uiDir = Join-Path $repoRoot 'ui'
$shellDir = Join-Path $repoRoot 'shell/Scing.Emulator.Shell'
$tauriDir = Join-Path $shellDir 'src-tauri'
$serviceProj = Join-Path $repoRoot 'backend/Scing.Emulator.Service/Scing.Emulator.Service.csproj'

Write-Host "[phase3] dotnet build service..."
& dotnet build $serviceProj -c Release
if ($LASTEXITCODE -ne 0) { throw "dotnet build failed" }

Write-Host "[phase3] build UI..."
if (-not $SkipUiInstall) {
  & npm.cmd --prefix $uiDir install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}
& npm.cmd --prefix $uiDir run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

$uiIndex = Join-Path $uiDir 'dist/index.html'
if (-not (Test-Path $uiIndex)) { throw "missing UI dist/index.html" }

Write-Host "[phase3] cargo check tauri..."
Push-Location $tauriDir
try {
  & cargo check -q
  if ($LASTEXITCODE -ne 0) { throw "cargo check failed" }
} finally {
  Pop-Location
}

$conf = Join-Path $tauriDir 'tauri.conf.json'
if (-not (Test-Path $conf)) { throw "missing tauri.conf.json" }

Write-Host "[phase3] OK"
