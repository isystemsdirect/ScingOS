param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host 'AI Federation Provider Health' -ForegroundColor Cyan
Write-Host '--------------------------------' -ForegroundColor DarkGray

$regPath = Join-Path $PSScriptRoot 'providers.registry.json'
if (-not (Test-Path $regPath)) { throw "Missing registry: $regPath" }
$reg = Get-Content $regPath -Raw | ConvertFrom-Json

foreach ($p in $reg.providers) {
  $missing = @()
  foreach ($k in $p.env_keys) {
    $val = [Environment]::GetEnvironmentVariable($k,'Process')
    if ([string]::IsNullOrWhiteSpace($val)) { $missing += $k }
  }

  $state  = if ($p.enabled) { 'ENABLED' } else { 'DISABLED' }
  $health = if ($missing.Count -eq 0) { 'KEY OK' } else { 'MISSING: ' + ($missing -join ',') }
  Write-Host ('- ' + $p.id.PadRight(12) + ' | ' + $state.PadRight(8) + ' | ' + $health)
}