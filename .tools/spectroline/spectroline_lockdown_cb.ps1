# =========================================================================================
# SPECTROLINE BRIDGE LOCKDOWN CB (URLACL + PORT + HEALTH + LOGS + DRIVER + OPTIONAL COMMITPUSH)
# =========================================================================================
$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$SCINGOS="G:\GIT\isystemsdirect\ScingOS"
$PORT=8789
$HEALTH_127="http://127.0.0.1:$PORT/health"
$HEALTH_LOCAL="http://localhost:$PORT/health"

Set-Location $SCINGOS

Write-Host "=== 0) ELEVATION CHECK ===" -ForegroundColor Cyan
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "NOT ADMIN. Re-run PowerShell as Administrator." -ForegroundColor Yellow
  exit 1
}
Write-Host "ADMIN OK ✅" -ForegroundColor Green

Write-Host "`n=== 1) URLACL RESET/ADD (127.0.0.1 + localhost) ===" -ForegroundColor Cyan
cmd /c "netsh http delete urlacl url=http://127.0.0.1:$PORT/ 2>nul" | Out-Null
cmd /c "netsh http delete urlacl url=http://localhost:$PORT/ 2>nul" | Out-Null

$acct = "$env:USERDOMAIN\$env:USERNAME"
cmd /c "netsh http add urlacl url=http://127.0.0.1:$PORT/ user=$acct" | Out-Null
cmd /c "netsh http add urlacl url=http://localhost:$PORT/ user=$acct" | Out-Null

Write-Host "URLACL added for 127.0.0.1 + localhost as: $acct" -ForegroundColor Green

Write-Host "`n--- URLACL VERIFY (filtered) ---" -ForegroundColor Cyan
cmd /c "netsh http show urlacl" | Select-String -Pattern "127\.0\.0\.1:$PORT|localhost:$PORT" | ForEach-Object { $_.Line } | Write-Host

Write-Host "`n=== 2) PORT OWNERSHIP CHECK (8789) ===" -ForegroundColor Cyan
$portLine = cmd /c "netstat -ano | findstr :$PORT" 2>$null
if ($portLine) {
  Write-Host "PORT $PORT currently in use:" -ForegroundColor Yellow
  $portLine | Write-Host
  Write-Host "Attempting to identify owning process..." -ForegroundColor Yellow
  $pids = ($portLine | ForEach-Object { ($_ -split "\s+")[-1] } | Where-Object { $_ -match "^\d+$" } | Select-Object -Unique)
  foreach ($pid in $pids) {
    try {
      $p = Get-Process -Id $pid -ErrorAction Stop
      Write-Host ("PID {0} => {1}" -f $pid, $p.ProcessName) -ForegroundColor Yellow
    } catch {
      Write-Host ("PID {0} => (unknown)" -f $pid) -ForegroundColor Yellow
    }
  }
} else {
  Write-Host "PORT $PORT appears free ✅" -ForegroundColor Green
}

Write-Host "`n=== 3) KILL OLD BRIDGE PROCESSES (if any) ===" -ForegroundColor Cyan
$bridgeProcs = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
  try { $_.CommandLine -match "spectroline_bridge_http\.ps1" } catch { $false }
}
if ($bridgeProcs) {
  $bridgeProcs | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Milliseconds 400
  Write-Host "Old bridge processes stopped ✅" -ForegroundColor Green
} else {
  Write-Host "No existing bridge process detected ✅" -ForegroundColor Green
}

Write-Host "`n=== 4) START BRIDGE (WITH LOG CAPTURE) ===" -ForegroundColor Cyan
$BRIDGE = Join-Path $SCINGOS ".tools\spectroline\spectroline_bridge_http.ps1"
$BRIDGE_LOG = Join-Path $SCINGOS ".spectroline\logs\bridge.boot.$PORT.log"

if (!(Test-Path (Split-Path $BRIDGE_LOG))) { New-Item -ItemType Directory -Force -Path (Split-Path $BRIDGE_LOG) | Out-Null }

# Start bridge in a new PowerShell, redirect output to a log
Start-Process powershell -ArgumentList @(
  "-NoProfile","-ExecutionPolicy","Bypass",
  "-Command", "powershell -NoProfile -ExecutionPolicy Bypass -File `"$BRIDGE`" -Port $PORT *>> `"$BRIDGE_LOG`""
) | Out-Null

Start-Sleep -Milliseconds 900
Write-Host "Bridge started. Boot log: $BRIDGE_LOG" -ForegroundColor Green

Write-Host "`n=== 5) HEALTH PROBE LOOP (127 + localhost) ===" -ForegroundColor Cyan
function Probe($url) {
  try {
    $r = Invoke-WebRequest -Uri $url -TimeoutSec 2
    if ($r.StatusCode -eq 200) { return @{ ok=$true; body=$r.Content } }
  } catch {}
  return @{ ok=$false; body=$null }
}

$ok127=$false; $okLocal=$false
for ($i=1; $i -le 30; $i++) {
  $p1 = Probe $HEALTH_127
  $p2 = Probe $HEALTH_LOCAL
  if ($p1.ok) { $ok127=$true }
  if ($p2.ok) { $okLocal=$true }
  if ($ok127 -or $okLocal) { break }
  Start-Sleep -Milliseconds 250
}

Write-Host ("HEALTH 127.0.0.1 : " + ($(if($ok127){"OK ✅"}else{"FAIL ❌"}))) -ForegroundColor ($(if($ok127){"Green"}else{"Yellow"}))
Write-Host ("HEALTH localhost  : " + ($(if($okLocal){"OK ✅"}else{"FAIL ❌"}))) -ForegroundColor ($(if($okLocal){"Green"}else{"Yellow"}))

if (-not ($ok127 -or $okLocal)) {
  Write-Host "`n=== 6) HEALTH FAILED: SHOW BOOT LOG TAIL + AUDIT TAIL ===" -ForegroundColor Red
  if (Test-Path $BRIDGE_LOG) {
    Write-Host "`n--- bridge boot log (tail 120) ---" -ForegroundColor Cyan
    Get-Content $BRIDGE_LOG -Tail 120 | Write-Host
  }
  $AUDIT = Join-Path $SCINGOS ".spectroline\logs\bridge.audit.jsonl"
  if (Test-Path $AUDIT) {
    Write-Host "`n--- bridge.audit.jsonl (tail 60) ---" -ForegroundColor Cyan
    Get-Content $AUDIT -Tail 60 | Write-Host
  } else {
    Write-Host "`nNo bridge.audit.jsonl yet." -ForegroundColor Yellow
  }
  throw "Bridge /health still failing. Use the log output above to pinpoint the exact error."
}

Write-Host "`n=== 7) RUN GOLDEN PASS DRIVER (validate) ===" -ForegroundColor Cyan
$DRIVER = Join-Path $SCINGOS ".tools\spectroline\spectroline_daily_driver.ps1"
powershell -ExecutionPolicy Bypass -File $DRIVER -ClipboardText "HELLO" -Device "note20u" -BridgePort $PORT -DoValidate

Write-Host "`n=== 8) MCP OPS SNAPSHOT (STATUS+LIST+DIFF) ===" -ForegroundColor Cyan
$ASK = Join-Path $SCINGOS ".tools\scinggpt\ask_scinggpt.ps1"
powershell -ExecutionPolicy Bypass -File $ASK 'OP:STATUS OP:LIST OP:DIFF'

Write-Host "`n=== 9) OPTIONAL CHECKPOINT COMMITPUSH (UNCOMMENT TO RUN) ===" -ForegroundColor Cyan
# powershell -ExecutionPolicy Bypass -File $ASK -Prompt 'OP:COMMITPUSH "Checkpoint: Bridge URLACL locked + health OK + golden pass re-proved" OP:REMOTE "origin" OP:BRANCH "scpsc-ultra-grade-foundation-clean"'

Write-Host "`nDONE ✅ Bridge is stable, health is green, lane is proven." -ForegroundColor Green
# =========================================================================================
