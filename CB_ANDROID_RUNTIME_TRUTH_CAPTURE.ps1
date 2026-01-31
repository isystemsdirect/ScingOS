Param(
    [string]$ModulePath = "G:\GIT\isystemsdirect\ScingOS\apps\android\spectrocap-android",
    [string]$TmpDir = "G:\GIT\isystemsdirect\ScingOS\.tmp"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Dir([string]$Path) {
    if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Path $Path | Out-Null }
}

function Tail-File([string]$Path, [int]$Lines = 200) {
    if (Test-Path $Path) { Get-Content $Path -Tail $Lines }
}

Ensure-Dir -Path $TmpDir
$buildLog = Join-Path $TmpDir 'spectrocap_build.log'

Push-Location $ModulePath
try {
    # Resolve APPID
    $appGradle = Join-Path $ModulePath 'app\build.gradle'
    $APPID = (Select-String -Path $appGradle -Pattern 'applicationId\s+"([^"]+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 1)
    if (-not $APPID) { throw "ApplicationId not found in $appGradle" }

    Write-Host ("APPID=" + $APPID) -ForegroundColor Green

    # Build APK non-interactively
    & cmd /c "gradlew.bat --stop" | Out-Null
    $env:GRADLE_OPTS='-Dorg.gradle.daemon=false'
    & cmd /c "gradlew.bat clean :app:assembleDebug --no-daemon --info --stacktrace" *> $buildLog
    $APK = Join-Path $ModulePath 'app\build\outputs\apk\debug\app-debug.apk'
    if (-not (Test-Path $APK)) {
        Write-Host "APK missing. Tail of build log:" -ForegroundColor Red
        Tail-File -Path $buildLog -Lines 240
        throw "Build failed or APK not produced"
    }

    # Device ops
    & cmd /c "adb devices -l" *> (Join-Path $TmpDir 'adb_devices.log')
    & cmd /c "adb shell am force-stop $APPID" | Out-Null
    & cmd /c "adb uninstall $APPID" *> (Join-Path $TmpDir 'adb_uninstall.log')
    & cmd /c "adb install -r `"$APK`"" *> (Join-Path $TmpDir 'adb_install.log')

    # Resolve launcher component on device
    $COMP = (& cmd /c "adb shell cmd package resolve-activity --brief -c android.intent.category.LAUNCHER $APPID" | Select-Object -Last 1).Trim()
    if (-not $COMP) { throw "Could not resolve launcher component for $APPID" }
    Write-Host ("COMP=" + $COMP) -ForegroundColor Yellow

    # Start and capture logs
    & cmd /c "adb logcat -c" | Out-Null
    & cmd /c "adb shell am start -W -n $COMP" *> (Join-Path $TmpDir 'adb_start.log')

    $failsafeLog = Join-Path $TmpDir 'failsafe.log'
    $crashLog    = Join-Path $TmpDir 'crash.log'
    & cmd /c "adb logcat -d -v time SpectroCAP_FAILSAFE:E *:S" *> $failsafeLog
    & cmd /c "adb logcat -d -v time AndroidRuntime:E ActivityManager:E System.err:E WindowManager:W *:S" *> $crashLog

    # Top resumed activity
    $topResumedFile = Join-Path $TmpDir 'top_resumed.txt'
    (& cmd /c "adb shell dumpsys activity activities") | Select-String -Pattern 'mResumedActivity|topResumedActivity' | Set-Content -Path $topResumedFile

    # PID-specific log
    $PID = (& cmd /c "adb shell pidof $APPID").Trim()
    Write-Host ("PID=" + $PID) -ForegroundColor Yellow
    if ($PID) {
        $pidLog = Join-Path $TmpDir 'pid_logcat.log'
        & cmd /c "adb logcat -d --pid=$PID -v time" *> $pidLog
    }

    # Summary output
    Write-Host "Saved logs:" -ForegroundColor Cyan
    Get-ChildItem $TmpDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize

} finally {
    Pop-Location
}
