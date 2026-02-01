param(
  [Parameter(Mandatory=$true)][string]$Topic,
  [Parameter(Mandatory=$true)][string]$App,
  [Parameter(Mandatory=$false)][string]$Kind = "intent",
  [Parameter(Mandatory=$false)][string]$Ref = "",
  [Parameter(Mandatory=$false)][string]$PayloadJson = "{}",
  [Parameter(Mandatory=$false)][string]$PayloadFile = ""
)

$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$SCINGOS_ROOT = "G:\GIT\isystemsdirect\ScingOS"
$INBOX = Join-Path $SCINGOS_ROOT ".spectroline\inbox"

function New-Id { ([guid]::NewGuid().ToString("N")).Substring(0,12) }
function Stamp { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }

$id = New-Id
$tsIso = (Get-Date).ToUniversalTime().ToString("o")
$refVal = if ([string]::IsNullOrWhiteSpace($Ref)) { $null } else { $Ref }

try {
  if (-not [string]::IsNullOrWhiteSpace($PayloadFile) -and (Test-Path $PayloadFile)) {
    $payloadObj = Get-Content $PayloadFile -Raw | ConvertFrom-Json
  } else {
    $payloadObj = $PayloadJson | ConvertFrom-Json
  }
} catch { throw "PayloadJson must be valid JSON or provide -PayloadFile" }

$pkt = [ordered]@{
  v = 1
  ts = $tsIso
  app = $App
  kind = $Kind
  id = $id
  ref = $refVal
  topic = $Topic
  payload = $payloadObj
  policy = @{ plan_ack = $true }
}

$file = Join-Path $INBOX ("{0}__{1}__{2}__{3}.json" -f (Stamp), $App, $Kind, $id)
($pkt | ConvertTo-Json -Depth 20) | Set-Content -Path $file -Encoding UTF8

Write-Host "EMITTED -> $file" -ForegroundColor Green
