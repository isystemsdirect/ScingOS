param(
  [Parameter(Mandatory=$true)][string]$Prompt,
  [string[]]$Providers = @("perplexity"),
  [ValidateSet("single","fanout","consensus","judge","assemble")][string]$Mode="fanout",
  [string]$OutDir = "",
  [switch]$Citations,
  [int]$TimeoutSec = 90
)

# ENV_LOCAL_LOADER + PROVIDER_GOVERNANCE
function Import-DotEnvLocal {
  param([string]$Path)
  if(-not (Test-Path $Path)){ return }
  Get-Content $Path | ForEach-Object {
    $line = $_
    if([string]::IsNullOrWhiteSpace($line)) { return }
    $t = $line.Trim()
    if($t.StartsWith('#')) { return }
    if($t -notmatch '=') { return }
    $k, $v = $t.Split('=', 2)
    $k = $k.Trim()
    $v = $v.Trim()
    if([string]::IsNullOrWhiteSpace($k)) { return }
    if( ($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'")) ){
      $v = $v.Substring(1, $v.Length-2)
    }
    if(-not [string]::IsNullOrWhiteSpace($v)){
      [Environment]::SetEnvironmentVariable($k, $v, 'Process')
    }
  }
}

function Read-ProviderRegistry {
  param([string]$Path)
  if(-not (Test-Path $Path)){ throw "Missing provider registry: $Path" }
  return (Get-Content $Path -Raw | ConvertFrom-Json)
}

function Get-EnabledProviders {
  param($Registry)
  return @($Registry.providers | Where-Object { $_.enabled -eq $true })
}

function Resolve-TargetProviders {
  param(
    [object]$Registry,
    [object]$Intent
  )
  $enabled = Get-EnabledProviders -Registry $Registry

  # Intent allowlist intersection
  if($Intent.providers_allowlist -and $Intent.providers_allowlist.Count -gt 0){
    $allow = @($Intent.providers_allowlist | ForEach-Object { ("{0}" -f $_).ToLower() })
    return @($enabled | Where-Object { $allow -contains ($_.id.ToLower()) })
  }

  # Explicit target provider (must be enabled)
  if($Intent.target_provider){
    $pid = ($Intent.target_provider.ToString()).ToLower()
    return @($enabled | Where-Object { ($_.id.ToLower()) -eq $pid })
  }

  # Federation: use all enabled
  if($Intent.federate -eq $true){
    return @($enabled)
  }

  # Role routing: default role compute
  $role = "compute"
  if($Intent.target_role){ $role = $Intent.target_role.ToString() }
  $cands = @($enabled | Where-Object { $_.roles -contains $role })
  if($cands.Count -gt 0){
    return @($cands | Sort-Object priority -Descending | Select-Object -First 1)
  }

  # Fallback: registry default role, else first enabled
  $defRole = $Registry.default_role
  if($defRole){
    $cands2 = @($enabled | Where-Object { $_.roles -contains $defRole })
    if($cands2.Count -gt 0){
      return @($cands2 | Sort-Object priority -Descending | Select-Object -First 1)
    }
  }
  return @($enabled | Select-Object -First 1)
}

# Load .env.local adjacent to .tools/ai-federation
Import-DotEnvLocal -Path (Join-Path (Split-Path -Parent $PSScriptRoot) ".env.local")

# Load provider registry
$PROVIDER_REGISTRY_PATH = Join-Path (Split-Path -Parent $PSScriptRoot) "providers\providers.registry.json"
$PROVIDER_REGISTRY = Read-ProviderRegistry -Path $PROVIDER_REGISTRY_PATH

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function TsFile { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }
function Uid    { ([guid]::NewGuid().ToString("N").Substring(0,12)) }

$here   = Split-Path -Parent $MyInvocation.MyCommand.Path
# From run/ -> repo root is three levels up: run -> ai-federation -> .tools -> repo
$scingos = Resolve-Path (Join-Path $here "..\..\..") | Select-Object -ExpandProperty Path
$aiOut  = if ($OutDir) { $OutDir } else { Join-Path $scingos ".spectroline\ai\outbox" }
New-Item -ItemType Directory -Force -Path $aiOut | Out-Null

$adapters = Join-Path $scingos ".tools\ai-federation\adapters"

# Determine providers to call: explicit list or enabled from registry
$provList = @()
if ($Providers -and $Providers.Count -gt 0) {
  $provList = @($Providers)
} else {
  try {
    $provList = @((Get-EnabledProviders -Registry $PROVIDER_REGISTRY) | Select-Object -ExpandProperty id)
  } catch {
    $provList = @("perplexity")
  }
}

function Call-Provider([string]$p, [string]$prompt) {
  $adapter = Join-Path $adapters ("{0}.ps1" -f $p.ToLower())
  if (!(Test-Path $adapter)) { throw "Missing adapter: $adapter" }
  $args = @("-Prompt",$prompt)
  if ($Citations) { $args += "-WantCitations" }
  $json = & powershell -NoProfile -ExecutionPolicy Bypass -File $adapter @args
  return ($json | ConvertFrom-Json)
}

# --- Execute ---
$id = Uid
$ts = TsFile
$outFile = Join-Path $aiOut ("{0}__scinggpt__result__{1}.json" -f $ts, $id)

$results = @()
foreach ($p in $provList) {
  try {
    $r = Call-Provider $p $Prompt
    $results += [ordered]@{ provider=$p; ok=$true; model=$r.model; answer=$r.answer; citations=$r.citations }
  } catch {
    $results += [ordered]@{ provider=$p; ok=$false; error=$_.Exception.Message }
  }
}

function Consensus-Text($arr) {
  $answers = $arr | Where-Object { $_.ok } | Select-Object -ExpandProperty answer
  if (-not $answers -or $answers.Count -eq 0) { return $null }
  $base = ($answers | Sort-Object Length | Select-Object -First 1)
  return "CONSENSUS_BASE (shortest):`n$base"
}

$summary = switch ($Mode) {
  "single"    { ($results | Select-Object -First 1) }
  "fanout"    { $null }
  "consensus" { Consensus-Text $results }
  "judge"     { "JUDGE MODE placeholder: choose provider manually from results until judge adapter exists." }
  "assemble"  { "ASSEMBLE MODE placeholder: use a structuring prompt + preferred provider once set." }
}

$packet = [ordered]@{
  v=1
  ts=(IsoUtc)
  app="scinggpt"
  kind="result"
  id=("$id-out")
  ref=$id
  topic="ai_result"
  payload=[ordered]@{
    mode=$Mode
    prompt=$Prompt
    providers=$provList
    results=$results
    summary=$summary
  }
  policy=@{ plan_ack=$true }
}

($packet | ConvertTo-Json -Depth 20) | Set-Content -Path $outFile -Encoding UTF8
Write-Host "WROTE: $outFile"

# PROVIDER_SELECTION_SHIM
function Select-Providers-ForIntent {
  param([object]$Intent)
  $sel = Resolve-TargetProviders -Registry $PROVIDER_REGISTRY -Intent $Intent
  return @($sel)
}
