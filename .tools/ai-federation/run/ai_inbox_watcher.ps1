param(
  [int]$PollMs = 900,
  [switch]$Once,
  [switch]$Verbose
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }

$here   = Split-Path -Parent $MyInvocation.MyCommand.Path
# From run/ -> up to repo root requires three levels: run -> ai-federation -> .tools -> repo
$scingos = Resolve-Path (Join-Path $here "..\..\..") | Select-Object -ExpandProperty Path

$aiIn    = Join-Path $scingos ".spectroline\ai\inbox"
$aiLogs  = Join-Path $scingos ".spectroline\ai\logs"
$aiState = Join-Path $scingos ".spectroline\ai\state"
$runIntent = Join-Path $scingos ".tools\ai-federation\run\ai_run_intent.ps1"

New-Item -ItemType Directory -Force -Path $aiIn,$aiLogs,$aiState | Out-Null
if (!(Test-Path $runIntent)) { throw "Missing runner: $runIntent" }

$audit = Join-Path $aiLogs "ai.watcher.audit.jsonl"
$seen  = Join-Path $aiState "watcher.seen.json"

if (!(Test-Path $seen)) { "[]" | Set-Content -Path $seen -Encoding UTF8 }

function Audit($obj) {
  $line = ($obj | ConvertTo-Json -Compress -Depth 30)
  Add-Content -Path $audit -Value $line -Encoding UTF8
}

function LoadSeen() {
  try { (Get-Content $seen -Raw | ConvertFrom-Json) } catch { @() }
}

function SaveSeen($arr) {
  ($arr | ConvertTo-Json -Depth 6) | Set-Content -Path $seen -Encoding UTF8
}

Write-Host "AI INBOX WATCHER LIVE" -ForegroundColor Green
Write-Host ("inbox=" + $aiIn)
Write-Host ("poll_ms=" + $PollMs)

do {
  $seenList = @()
  $seenList = LoadSeen
  $seenSet = @{}
  foreach ($x in $seenList) { $seenSet[[string]$x] = $true }

  $items = Get-ChildItem $aiIn -Filter "*.json" -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime
  foreach ($f in $items) {
    if ($seenSet.ContainsKey($f.FullName)) { continue }

    # mark seen early (prevents double-run if long execution)
    $seenList += $f.FullName
    SaveSeen $seenList

    $ts = IsoUtc
    Audit([ordered]@{ ts=$ts; event="intent_seen"; file=$f.FullName })
    if ($Verbose) { Write-Host ("RUN: " + $f.FullName) -ForegroundColor Cyan }

    try {
      & powershell -NoProfile -ExecutionPolicy Bypass -File $runIntent -IntentPath $f.FullName | Out-Null
      Audit([ordered]@{ ts=IsoUtc; event="intent_ok"; file=$f.FullName })
    } catch {
      Audit([ordered]@{ ts=IsoUtc; event="intent_err"; file=$f.FullName; error=$_.Exception.Message })
      if ($Verbose) { Write-Host ("ERR: " + $_.Exception.Message) -ForegroundColor Red }
    }
  }

  if ($Once) { break }
  Start-Sleep -Milliseconds $PollMs
} while ($true)