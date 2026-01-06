param(
  [switch]$Clean
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$uiDir = Join-Path $repoRoot 'ui'

if ($Clean) {
  if (Test-Path (Join-Path $uiDir 'dist')) {
    Remove-Item -Recurse -Force (Join-Path $uiDir 'dist')
  }
}

Write-Host "[ui-build] installing deps..."
& npm.cmd --prefix $uiDir install

Write-Host "[ui-build] building..."
& npm.cmd --prefix $uiDir run build

$shellDir = Join-Path $repoRoot 'shell\Scing.Emulator.Shell'
$splashSrc = Join-Path $shellDir 'src\splash'
$splashDist = Join-Path $uiDir 'dist\splash'
if (Test-Path $splashSrc) {
  Write-Host "[ui-build] copying splash -> dist/splash..."
  New-Item -ItemType Directory -Force -Path $splashDist | Out-Null
  Copy-Item -Recurse -Force (Join-Path $splashSrc '*') $splashDist
}

$index = Join-Path $uiDir 'dist/index.html'
if (-not (Test-Path $index)) {
  throw "UI build failed: missing dist/index.html"
}

Write-Host "[ui-build] OK -> $index"
