cd "g:\GIT\isystemsdirect\ScingOS\apps\android\spectrocap-android"
Write-Host "Building..." -ForegroundColor Cyan
$output = .\gradlew.bat :app:assembleDebug 2>&1
$output | Out-File build_output.log -Encoding UTF8
Write-Host "Build complete. Last 50 lines:" -ForegroundColor Yellow
$lastLines = $output | Select-Object -Last 50
$lastLines | ForEach-Object { Write-Host $_ }
Write-Host "`nChecking for APK..." -ForegroundColor Cyan
$apk = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
  $mb = [Math]::Round((Get-Item $apk).Length/1MB, 2)
  Write-Host "✓ SUCCESS: $mb MB APK" -ForegroundColor Green
} else {
  Write-Host "✗ FAILED: APK not found" -ForegroundColor Red
  Write-Host "`nSearching for error patterns..." 
  $output | Select-String "error|Error|ERROR" -Context 2
}
