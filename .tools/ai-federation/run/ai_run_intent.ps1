param(
  [Parameter(Mandatory=$true)][string]$IntentPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function TsFile { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }

$here   = Split-Path -Parent $MyInvocation.MyCommand.Path
# From run/ -> up to repo root requires three levels: run -> ai-federation -> .tools -> repo
$scingos = Resolve-Path (Join-Path $here "..\..\..") | Select-Object -ExpandProperty Path

$router = Join-Path $scingos ".tools\ai-federation\run\ai_router.ps1"
$diff   = Join-Path $scingos ".tools\ai-federation\run\ai_diff.ps1"
$evid   = Join-Path $scingos ".tools\ai-federation\run\ai_evidence_pack.ps1"

$aiOut  = Join-Path $scingos ".spectroline\ai\outbox"
$aiState= Join-Path $scingos ".spectroline\ai\state"
New-Item -ItemType Directory -Force -Path $aiOut,$aiState | Out-Null

if (!(Test-Path $IntentPath)) { throw "Missing intent: $IntentPath" }
if (!(Test-Path $router)) { throw "Missing router: $router" }

$intent = Get-Content $IntentPath -Raw | ConvertFrom-Json

# normalize
$mode = [string]$intent.payload.mode
if (-not $mode) { $mode = "fanout" }

$prompt = $intent.payload.task.prompt
if (-not $prompt) { throw "Intent missing payload.task.prompt" }

# If providers list empty -> router uses enabled providers registry
$providers = @()
try { $providers = @($intent.payload.providers) } catch { $providers = @() }

$useCitations = $false
try { if ($intent.payload.task.constraints.citations -eq $true) { $useCitations = $true } } catch {}
$timeout = 90
try { if ($intent.payload.task.constraints.timeout_sec) { $timeout = [int]$intent.payload.task.constraints.timeout_sec } } catch {}

# Call router
$routerArgs = @("-Mode",$mode,"-Prompt",$prompt,"-TimeoutSec",$timeout)
if ($providers.Count -gt 0) { $routerArgs += @("-Providers",$providers) }
if ($useCitations) { $routerArgs += "-Citations" }

Write-Host "=== AI ROUTER RUN ===" -ForegroundColor Cyan
Write-Host ("ts=" + (IsoUtc))
Write-Host ("mode=" + $mode)
Write-Host ("providers=" + ($(if ($providers.Count -gt 0) { $providers -join "," } else { "[enabled registry]" })))

$routerOut = & powershell -NoProfile -ExecutionPolicy Bypass -File $router @routerArgs

# Router prints WROTE: <file>. Capture latest outbox file deterministically:
$latest = Get-ChildItem $aiOut -Filter "*.json" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latest) { throw "No outbox result produced." }
$resultPath = $latest.FullName

# Run diff
Write-Host "=== AI DIFF RUN ===" -ForegroundColor Cyan
$diffOut = & powershell -NoProfile -ExecutionPolicy Bypass -File $diff -ResultJsonPath $resultPath -OutStateDir $aiState

# Determine newest diff file
$latestDiff = Get-ChildItem $aiState -Filter "*__ai_diff__*.json" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$diffPath = if ($latestDiff) { $latestDiff.FullName } else { "" }

# Write evidence pack
Write-Host "=== AI EVIDENCE PACK ===" -ForegroundColor Cyan
& powershell -NoProfile -ExecutionPolicy Bypass -File $evid -IntentJsonPath $IntentPath -ResultJsonPath $resultPath -DiffJsonPath $diffPath -OutStateDir $aiState | Out-Null

Write-Host "DONE:"
Write-Host (" - Intent:   " + $IntentPath)
Write-Host (" - Result:   " + $resultPath)
if ($diffPath) { Write-Host (" - Diff:     " + $diffPath) }
Write-Host (" - Evidence: newest __ai_evidence__*.json in " + $aiState)