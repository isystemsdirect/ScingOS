param(
  [Parameter(Mandatory=$true)][string]$IntentJsonPath,
  [Parameter(Mandatory=$true)][string]$ResultJsonPath,
  [string]$DiffJsonPath = "",
  [string]$OutStateDir = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function TsFile { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }
function Sha256($path) {
  if (!(Test-Path $path)) { return $null }
  (Get-FileHash -Algorithm SHA256 -Path $path).Hash.ToLowerInvariant()
}

if (!(Test-Path $IntentJsonPath)) { throw "Missing intent: $IntentJsonPath" }
if (!(Test-Path $ResultJsonPath)) { throw "Missing result: $ResultJsonPath" }

$intent = Get-Content $IntentJsonPath -Raw | ConvertFrom-Json
$result = Get-Content $ResultJsonPath -Raw | ConvertFrom-Json
$rid = $result.ref
if (-not $rid) { $rid = "unknown" }

$outDir = $OutStateDir
if (-not $outDir) {
  $scingos = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $ResultJsonPath))
  $outDir = Join-Path $scingos ".spectroline\ai\state"
}
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$packFile = Join-Path $outDir ("{0}__ai_evidence__{1}.json" -f (TsFile), $rid)

$pack = [ordered]@{
  ts = IsoUtc
  ref = $rid
  intent = [ordered]@{
    path = $IntentJsonPath
    sha256 = (Sha256 $IntentJsonPath)
    meta = [ordered]@{
      ts = $intent.ts
      topic = $intent.topic
      mode = $intent.payload.mode
      providers = $intent.payload.providers
    }
  }
  result = [ordered]@{
    path = $ResultJsonPath
    sha256 = (Sha256 $ResultJsonPath)
    meta = [ordered]@{
      ts = $result.ts
      topic = $result.topic
      mode = $result.payload.mode
      providers = $result.payload.providers
      ok = @($result.payload.results | Where-Object { $_.ok -eq $true } | Select-Object -ExpandProperty provider)
      err = @($result.payload.results | Where-Object { $_.ok -ne $true } | Select-Object -ExpandProperty provider)
    }
  }
  diff = $null
  notes = @(
    "Evidence pack is replay-friendly: intent+result hashes included.",
    "Diff is optional but recommended for multi-provider runs."
  )
}

if ($DiffJsonPath -and (Test-Path $DiffJsonPath)) {
  $pack.diff = [ordered]@{
    path = $DiffJsonPath
    sha256 = (Sha256 $DiffJsonPath)
  }
}

($pack | ConvertTo-Json -Depth 40) | Set-Content -Path $packFile -Encoding UTF8
Write-Host "WROTE: $packFile"