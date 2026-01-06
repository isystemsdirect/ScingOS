param(
  [switch]$SkipUiBuild
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$serviceProj = Join-Path $repoRoot 'backend/Scing.Emulator.Service/Scing.Emulator.Service.csproj'
$uiDist = Join-Path $repoRoot 'ui/dist'
$shellDir = Join-Path $repoRoot 'shell/Scing.Emulator.Shell'

if (-not $SkipUiBuild) {
  & (Join-Path $PSScriptRoot 'ui-build.ps1')
}

Write-Host "[dev-up] starting backend service (dotnet run)..."
$env:SCING_EMULATOR_UI_DIR = $uiDist
Start-Process -WindowStyle Hidden -FilePath 'dotnet' -ArgumentList @('run','--project',$serviceProj) | Out-Null

Start-Sleep -Seconds 1

Write-Host "[dev-up] starting tauri shell..."
& npm.cmd --prefix $shellDir install
& npm.cmd --prefix $shellDir run tauri:dev
