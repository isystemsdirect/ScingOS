param(
  [string]$ClipboardText = "HELLO",
  [string]$Device = "note20u",
  [int]$BridgePort = 8789,
  [switch]$DoCommitPush,
  [switch]$DoValidate,
  [string]$CommitMsg = "Checkpoint: SpectroLINE daily driver"
)

$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$SCINGOS_ROOT = "G:\GIT\isystemsdirect\ScingOS"
Set-Location $SCINGOS_ROOT

function Wait-BridgeHealth([int]$Port, [int]$TimeoutMs = 9000) {
  $uri = "http://127.0.0.1:$Port/health"
  $t0 = [Environment]::TickCount
  while (([Environment]::TickCount - $t0) -lt $TimeoutMs) {
    try {
      $r = Invoke-WebRequest -Uri $uri -TimeoutSec 2
      if ($r.StatusCode -eq 200) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 250
  }
  return $false
}

function Post-BridgeClipboard([int]$Port, [string]$JsonBody, [int]$Retries = 8) {
  $uri = "http://127.0.0.1:$Port/clipboard"
  for ($i=1; $i -le $Retries; $i++) {
    try {
      $r = Invoke-WebRequest -Method POST -Uri $uri -Body $JsonBody -ContentType "application/json" -TimeoutSec 3
      return @{ ok=$true; status=$r.StatusCode; content=$r.Content }
    } catch {
      Start-Sleep -Milliseconds (250 * $i)
    }
  }
  return @{ ok=$false; status=$null; content=$null }
}

$EMIT  = Join-Path $SCINGOS_ROOT ".tools\spectroline\spectroline_emit.ps1"
$WATCH = Join-Path $SCINGOS_ROOT ".tools\spectroline\spectroline_watch.ps1"
$BRDG  = Join-Path $SCINGOS_ROOT ".tools\spectroline\spectroline_bridge_http.ps1"
$ASK   = Join-Path $SCINGOS_ROOT ".tools\scinggpt\ask_scinggpt.ps1"
$VALID = Join-Path $SCINGOS_ROOT ".tools\spectroline\schema_validate.ps1"

$INBOX  = Join-Path $SCINGOS_ROOT ".spectroline\inbox"
$OUTBOX = Join-Path $SCINGOS_ROOT ".spectroline\outbox"
$CHATOUT= Join-Path $SCINGOS_ROOT ".spectroline\chat\out"
$STATE  = Join-Path $SCINGOS_ROOT ".spectroline\state"

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function Latest($dir, $n=1) {
  Get-ChildItem $dir -Filter "*.json" -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First $n
}

Write-Host "=== A) Ensure watcher running ===" -ForegroundColor Cyan
$watcher = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
  try { $_.CommandLine -match "spectroline_watch\.ps1" } catch { $false }
}
if (-not $watcher) {
  Start-Process powershell -ArgumentList @("-NoProfile","-ExecutionPolicy","Bypass","-File",$WATCH) | Out-Null
  Start-Sleep -Milliseconds 600
  Write-Host "Watcher started ✅" -ForegroundColor Green
} else {
  Write-Host "Watcher already running ✅" -ForegroundColor Green
}

Write-Host "\n=== B) Ensure bridge running ===" -ForegroundColor Cyan
$bridge = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
  try { $_.CommandLine -match "spectroline_bridge_http\.ps1" } catch { $false }
}
if (-not $bridge) {
  Start-Process powershell -ArgumentList @("-NoProfile","-ExecutionPolicy","Bypass","-File",$BRDG,"-Port",$BridgePort) | Out-Null
  Start-Sleep -Milliseconds 600
  Write-Host "Bridge started ✅ (127.0.0.1:$BridgePort)" -ForegroundColor Green
} else {
  Write-Host "Bridge already running ✅" -ForegroundColor Green
}

Write-Host "\n=== C) Emit local packet (inbox) ===" -ForegroundColor Cyan
$payloadObj = @{ content=$ClipboardText; mime="text/plain"; device=$Device }
$tmpPayload = Join-Path $INBOX "emit_payload_tmp.json"
($payloadObj | ConvertTo-Json -Depth 10) | Set-Content -Path $tmpPayload -Encoding UTF8
powershell -ExecutionPolicy Bypass -File $EMIT -Topic clipboard_push -App spectrocap -PayloadFile $tmpPayload

Write-Host "\n=== D) Post to bridge (proves app-style path) ===" -ForegroundColor Cyan
if (Wait-BridgeHealth -Port $BridgePort -TimeoutMs 9000) {
  $post = Post-BridgeClipboard -Port $BridgePort -JsonBody $payload -Retries 8
  if ($post.ok) {
    Write-Host ("Bridge POST OK: " + $post.content) -ForegroundColor Green
  } else {
    Write-Host ("Bridge POST FAIL (after retries)") -ForegroundColor Yellow
  }
} else {
  Write-Host ("Bridge health not ready (timeout). Continue anyway.") -ForegroundColor Yellow
}

Write-Host "\n=== E) Optional: validate inbox ===" -ForegroundColor Cyan
if ($DoValidate) {
  powershell -ExecutionPolicy Bypass -File $VALID -Folder $INBOX
} else {
  Write-Host "(skipped) pass -DoValidate" -ForegroundColor DarkGray
}

Write-Host "\n=== F) OPS snapshot (STATUS+LIST+DIFF) ===" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File $ASK 'OP:STATUS OP:LIST OP:DIFF'

Write-Host "\n=== G) Write health snapshot to state ===" -ForegroundColor Cyan
$health = [ordered]@{
  ts = (IsoUtc)
  inbox_latest = (Latest $INBOX 1 | Select-Object -ExpandProperty Name -ErrorAction SilentlyContinue)
  outbox_latest = (Latest $OUTBOX 1 | Select-Object -ExpandProperty Name -ErrorAction SilentlyContinue)
  chatout_latest = (Latest $CHATOUT 1 | Select-Object -ExpandProperty Name -ErrorAction SilentlyContinue)
  note = "SpectroLINE daily driver snapshot"
}
($health | ConvertTo-Json -Depth 10) | Set-Content -Path (Join-Path $STATE "health.snapshot.json") -Encoding UTF8

Write-Host "\n=== H) Optional: commit+push ===" -ForegroundColor Cyan
if ($DoCommitPush) {
  $prompt = 'OP:COMMITPUSH "' + $CommitMsg + '" OP:REMOTE "origin" OP:BRANCH "scpsc-ultra-grade-foundation-clean"'
  powershell -ExecutionPolicy Bypass -File $ASK $prompt
} else {
  Write-Host "(skipped) pass -DoCommitPush" -ForegroundColor DarkGray
}

Write-Host "\n=== I) Show newest chat/out + outbox ===" -ForegroundColor Cyan
$c = Latest $CHATOUT 2
if ($c) { $c | ForEach-Object { Write-Host $_.FullName; Get-Content $_.FullName -Raw; Write-Host "----" } }
$o = Latest $OUTBOX 1
if ($o) { Write-Host $o[0].FullName; Get-Content $o[0].FullName -Raw }

Write-Host "\nDONE ✅" -ForegroundColor Green
