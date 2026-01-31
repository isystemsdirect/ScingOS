Param(
  [string]$Root = "G:\GIT\isystemsdirect\ScingOS"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$rx = Join-Path $Root 'CB_SPECTROCAP_TEMP_RECEIVER.ps1'
$rt = Join-Path $Root 'CB_ANDROID_RUNTIME_TRUTH_CAPTURE.ps1'
if (-not (Test-Path $rx)) { throw "Missing: $rx" }
if (-not (Test-Path $rt)) { throw "Missing: $rt" }

Write-Host "Starting receiver in a new window..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile","-ExecutionPolicy","Bypass","-File",$rx) | Out-Null
Write-Host "RECEIVER STARTED in a new window." -ForegroundColor Green
Write-Host "In that receiver window, note your Wi-Fi IPv4 (e.g., 192.168.1.25)." -ForegroundColor Yellow
Write-Host "You will set the phone Receiver URL to: http://<PC_IP>:9443/ingest" -ForegroundColor Yellow

Push-Location $Root
try {
  Write-Host "\nRunning build+install+launch (runtime truth)..." -ForegroundColor Cyan
  & powershell -NoProfile -ExecutionPolicy Bypass -File $rt
} finally {
  Pop-Location
}

Write-Host "\nON THE NOTE20 NOW:" -ForegroundColor Cyan
Write-Host "1) Open SpectroCAP" -ForegroundColor Cyan
Write-Host "2) Settings ➜ Receiver URL" -ForegroundColor Cyan
Write-Host "3) Set:  http://<PC_IP>:9443/ingest   (use the IP printed by the receiver window)" -ForegroundColor Cyan
Write-Host "4) Send test payload:  NOTE20 TEST 001" -ForegroundColor Cyan
Write-Host "5) Confirm the receiver window prints the request." -ForegroundColor Cyan

$out = Join-Path $env:TEMP 'spectrocap_last_payload.txt'
Write-Host "\nVERIFY WINDOWS RECEIPT:" -ForegroundColor Cyan
if (Test-Path $out) {
  Write-Host ("FOUND: " + $out) -ForegroundColor Green
  Write-Host "LAST PAYLOAD:" -ForegroundColor Green
  Get-Content $out -Raw | Select-Object -First 1 | Write-Output
} else {
  Write-Host ("NOT FOUND YET: " + $out) -ForegroundColor Red
  Write-Host "If the receiver printed nothing, run these QUICK CHECKS (in THIS window):" -ForegroundColor Yellow
  Write-Host '  netsh advfirewall firewall show rule name="SpectroCAP Temp Receiver 9443"' -ForegroundColor Yellow
  Write-Host '  netstat -ano | findstr :9443' -ForegroundColor Yellow
  Write-Host '  adb logcat -c' -ForegroundColor Yellow
  Write-Host '  adb logcat -v time | findstr /i "spectrocap okhttp http https error exception"' -ForegroundColor Yellow
  Write-Host ("\nAlso share these files from " + (Join-Path $Root '.tmp') + " if present:") -ForegroundColor Yellow
  Write-Host '  .tmp\failsafe.log  .tmp\crash.log  .tmp\pid_logcat.log  .tmp\top_resumed.txt  .tmp\spectrocap_build.log' -ForegroundColor Yellow
  exit 1
}

Write-Host "\nCheckpoint commit + push..." -ForegroundColor Cyan
$appPath = Join-Path $Root 'apps\android\spectrocap-android'
Push-Location $appPath
try {
  & git status -sb
  & git add -A
  & git commit -m "Checkpoint: Note20 install + LAN send validated against PowerShell receiver"
  & git push
} finally {
  Pop-Location
}

Write-Host "\nLOCKED: Checkpoint pushed. Next: Windows standalone receiver/transmitter app." -ForegroundColor Green
