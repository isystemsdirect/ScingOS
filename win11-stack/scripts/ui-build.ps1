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

$index = Join-Path $uiDir 'dist/index.html'
if (-not (Test-Path $index)) {
  throw "UI build failed: missing dist/index.html"
}

Write-Host "[ui-build] OK -> $index"
