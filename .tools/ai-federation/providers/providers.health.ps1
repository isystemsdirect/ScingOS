param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host 'AI Federation Provider Health' -ForegroundColor Cyan
Write-Host '--------------------------------' -ForegroundColor DarkGray

# Load .env.local (adjacent to providers/ directory)
function Import-DotEnvLocal {
  param([string]$Path)
  if(-not (Test-Path $Path)){ return }
  Get-Content $Path | ForEach-Object {
    $line = $_; if([string]::IsNullOrWhiteSpace($line)) { return }
    $t = $line.Trim(); if($t.StartsWith('#')) { return }
    if($t -notmatch '=') { return }
    $k, $v = $t.Split('=', 2); $k = $k.Trim(); $v = $v.Trim()
    if([string]::IsNullOrWhiteSpace($k)) { return }
    if( ($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'")) ){
      $v = $v.Substring(1, $v.Length-2)
    }
    if(-not [string]::IsNullOrWhiteSpace($v)){
      [Environment]::SetEnvironmentVariable($k, $v, 'Process')
    }
  }
}

Import-DotEnvLocal -Path (Join-Path (Split-Path -Parent $PSScriptRoot) ".env.local")

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