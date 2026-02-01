param(
  [int]$PollMs = 750
)

$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$SCINGOS_ROOT = "G:\GIT\isystemsdirect\ScingOS"
$INBOX  = Join-Path $SCINGOS_ROOT ".spectroline\inbox"
$OUTBOX = Join-Path $SCINGOS_ROOT ".spectroline\outbox"
$STATE  = Join-Path $SCINGOS_ROOT ".spectroline\state"
$LOGS   = Join-Path $SCINGOS_ROOT ".spectroline\logs"

New-Item -ItemType Directory -Force -Path $OUTBOX,$STATE,$LOGS | Out-Null

$seenPath = Join-Path $STATE "watcher.seen.json"
if (!(Test-Path $seenPath)) { "[]" | Set-Content -Path $seenPath -Encoding UTF8 }
$seen = (Get-Content $seenPath -Raw | ConvertFrom-Json)

function Save-Seen { ($seen | ConvertTo-Json) | Set-Content -Path $seenPath -Encoding UTF8 }
function Stamp { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }

Write-Host "WATCHING inbox: $INBOX" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Cyan

while ($true) {
  $files = Get-ChildItem $INBOX -Filter "*.json" -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime
  foreach ($f in $files) {
    if ($seen -contains $f.Name) { continue }

    try {
      $pkt = Get-Content $f.FullName -Raw | ConvertFrom-Json
      $id  = [string]$pkt.id
      $app = [string]$pkt.app
      $topic = [string]$pkt.topic
      $kind = [string]$pkt.kind

      if ($kind -eq "intent") {
        $ack = [ordered]@{
          v=1
          ts=(Get-Date -AsUTC -Format o)
          app="spectroline-watcher"
          kind="ack"
          id=("$id-out")
          ref=$id
          topic=($topic + "_ack")
          payload=@{
            ok=$true
            note="ACK by local watcher (lane proof-of-life)"
            received_file=$f.Name
          }
          policy=@{ plan_ack=$true }
        }

        $outFile = Join-Path $OUTBOX ("{0}__spectroline-watcher__ack__{1}.json" -f (Stamp), $id)
        ($ack | ConvertTo-Json -Depth 20) | Set-Content -Path $outFile -Encoding UTF8

        $audit = Join-Path $LOGS "watcher.audit.jsonl"
        ("{0}`t{1}`t{2}`t{3}" -f (Get-Date -AsUTC -Format o), $id, $topic, $outFile) | Add-Content -Path $audit -Encoding UTF8
      }

      $seen += $f.Name
      Save-Seen
    } catch {
      $audit = Join-Path $LOGS "watcher.errors.jsonl"
      ("{0}`t{1}`t{2}" -f (Get-Date -AsUTC -Format o), $f.Name, $_.Exception.Message) | Add-Content -Path $audit -Encoding UTF8
      $seen += $f.Name
      Save-Seen
    }
  }

  Start-Sleep -Milliseconds $PollMs
}
