param(
  [Parameter(Mandatory=$true)][string]$Prompt,
  [string[]]$Providers = @("perplexity"),
  [ValidateSet("single","fanout","consensus","judge","assemble")][string]$Mode="fanout",
  [string]$OutDir = "",
  [switch]$Citations
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function TsFile { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }
function Uid    { ([guid]::NewGuid().ToString("N").Substring(0,12)) }

$here   = Split-Path -Parent $MyInvocation.MyCommand.Path
$scingos = Resolve-Path (Join-Path $here "..\..") | Select-Object -ExpandProperty Path
$aiOut  = if ($OutDir) { $OutDir } else { Join-Path $scingos ".spectroline\ai\outbox" }
New-Item -ItemType Directory -Force -Path $aiOut | Out-Null

$adapters = Join-Path $scingos ".tools\ai-federation\adapters"

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
foreach ($p in $Providers) {
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
    providers=$Providers
    results=$results
    summary=$summary
  }
  policy=@{ plan_ack=$true }
}

($packet | ConvertTo-Json -Depth 20) | Set-Content -Path $outFile -Encoding UTF8
Write-Host "WROTE: $outFile"
