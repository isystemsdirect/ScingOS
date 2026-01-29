# Windows Clipboard Puller — SpectroCAP Clipboard Bridge
# Run this in a PowerShell window on your PC (where receiver is running)
# Polls /clip/pull every 800ms and updates Windows clipboard when new content arrives

# CONFIGURATION
$RECEIVER_BASE = "http://localhost:8088"  # Change to your PC's LAN IP if running from different PC
$POLL_INTERVAL_MS = 800                    # Poll frequency (ms)

# STATE
$LAST_TS = 0
$POLL_COUNT = 0

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ SpectroCAP Clipboard Puller (Windows)                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`nReceiver: $RECEIVER_BASE" -ForegroundColor Yellow
Write-Host "Poll interval: ${POLL_INTERVAL_MS}ms" -ForegroundColor Yellow
Write-Host "`nPolling... (press Ctrl+C to stop)`n" -ForegroundColor Yellow

while($true) {
  $POLL_COUNT += 1
  try {
    $j = Invoke-RestMethod "$RECEIVER_BASE/clip/pull"
    if ($j.ok -and $j.ts -gt $LAST_TS -and $j.text) {
      # New clipboard content detected
      Set-Clipboard -Value $j.text
      $LAST_TS = $j.ts
      $timestamp = Get-Date -Format "HH:mm:ss"
      $len = $j.text.Length
      Write-Host "[$timestamp] ✓ CLIPBOARD UPDATED (from: $($j.from), len: $len)" -ForegroundColor Green
      Write-Host "           Content: $($j.text.Substring(0, [Math]::Min(60, $len)))$(if($len -gt 60) { '...' } else { '' })" -ForegroundColor Gray
    }
  } catch {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] ✗ Poll failed: $($_.Exception.Message)" -ForegroundColor Red
  }
  
  Start-Sleep -Milliseconds $POLL_INTERVAL_MS
}
