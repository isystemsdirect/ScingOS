Param(
  [string]$Root = "G:\GIT\isystemsdirect\ScingOS"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$android = Join-Path $Root 'apps\android\spectrocap-android'
$rx = Join-Path $Root 'CB_SPECTROCAP_TEMP_RECEIVER.ps1'
$rt = Join-Path $Root 'CB_ANDROID_RUNTIME_TRUTH_CAPTURE.ps1'

if (-not (Test-Path $android)) { throw "Android project missing: $android" }
if (-not (Test-Path $rx)) { throw "Receiver script missing: $rx" }
if (-not (Test-Path $rt)) { throw "Runtime script missing: $rt" }

Push-Location $android
try {
  # Device check
  & adb devices -l
  $dev = (& adb devices | Select-String "device$" -ErrorAction SilentlyContinue)
  if (-not $dev) { throw "NO ANDROID DEVICE CONNECTED" }

  # Parse APPID
  $appGradle = Join-Path $android 'app\build.gradle'
  $APPID = (Select-String -Path $appGradle -Pattern 'applicationId\s+"([^"]+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 1)
  if (-not $APPID) { throw "FAILED TO PARSE applicationId from $appGradle" }
  Write-Host ("APPID=" + $APPID) -ForegroundColor Green

  # Nuke ghost state
  & adb shell am force-stop $APPID 2>$null
  & adb uninstall $APPID | Out-Null
  & adb shell pm clear $APPID 2>$null

  # Build (no daemon)
  $env:GRADLE_OPTS='-Dorg.gradle.daemon=false'
  & ./gradlew.bat clean :app:assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) { throw "GRADLE BUILD FAILED" }

  $APK = Join-Path $android 'app\build\outputs\apk\debug\app-debug.apk'
  if (-not (Test-Path $APK)) { throw "APK NOT PRODUCED: $APK" }
  Get-Item $APK | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize

  # Install (hard gate)
  & adb install -r $APK
  if ($LASTEXITCODE -ne 0) { throw "APK INSTALL FAILED" }

  # Verify install present
  $installed = (& adb shell pm list packages | Select-String $APPID)
  if (-not $installed) { throw "APP NOT INSTALLED — STOPPING" }
  Write-Host "INSTALLED ON DEVICE ✔" -ForegroundColor Green

  # Resolve & launch
  $COMP = (& adb shell cmd package resolve-activity --brief -c android.intent.category.LAUNCHER $APPID | Select-Object -Last 1).Trim()
  if (-not $COMP) { throw "LAUNCHER NOT RESOLVABLE" }
  & adb shell am start -W -n $COMP
  Start-Sleep -Seconds 2

  $PID = (& adb shell pidof $APPID).Trim()
  if (-not $PID) { throw "APP FAILED TO START (NO PID)" }
  Write-Host ("APP RUNNING — PID=" + $PID + " ✔") -ForegroundColor Green

} finally {
  Pop-Location
}

# Start receiver only after install confirmed
Start-Process powershell -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-File",$rx | Out-Null

Write-Host ""; Write-Host "INSTALL & LAUNCH VERIFIED." -ForegroundColor Green
Write-Host "NOW ON THE PHONE:" -ForegroundColor Cyan
Write-Host "Settings → Receiver URL → http://<PC_IP>:9443/ingest" -ForegroundColor Cyan
Write-Host "Send: NOTE20 TEST 001" -ForegroundColor Cyan
Write-Host ""

# Verify receipt
$out = Join-Path $env:TEMP 'spectrocap_last_payload.txt'
Start-Sleep -Seconds 3
if (Test-Path $out) {
  Write-Host "PAYLOAD RECEIVED ✔" -ForegroundColor Green
  Get-Content $out -Raw | Write-Output
} else {
  throw "NO PAYLOAD RECEIVED — TRANSPORT FAILED"
}

# Commit checkpoint
Push-Location $android
try {
  & git add -A
  & git commit -m "Checkpoint: Note20 install verified + LAN send validated"
  & git push
} finally {
  Pop-Location
}

Write-Host ""; Write-Host "LOCKED ✔  Ready for Windows standalone app." -ForegroundColor Green
