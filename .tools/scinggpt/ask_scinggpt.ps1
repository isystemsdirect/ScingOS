param(
  [Parameter(Mandatory=$true, Position=0, ValueFromRemainingArguments=$true)]
  [string[]]$PromptParts
)

$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$SCINGOS_ROOT  = "G:\GIT\isystemsdirect\ScingOS"
$SCINGGPT_ROOT = "G:\GIT\isystemsdirect\scinggpt-mcp"
$SERVER_JS     = "G:\GIT\isystemsdirect\scinggpt-mcp\dist\server.js"

$LANE_ROOT     = Join-Path $SCINGOS_ROOT ".spectroline"
$CHAT_ROOT     = Join-Path $LANE_ROOT "chat"
$CHAT_IN       = Join-Path $CHAT_ROOT "in"
$CHAT_OUT      = Join-Path $CHAT_ROOT "out"

$SDK_DIR       = "G:\GIT\isystemsdirect\ScingOS\.tmp\mcp-sdk-ask"
$RUNNER        = Join-Path $SDK_DIR "ask_runner.mjs"

function New-Stamp { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }
function New-Id { ([guid]::NewGuid().ToString("N")).Substring(0,12) }

$Prompt = ($PromptParts -join ' ')

$id = New-Id
$ts = New-Stamp
$inFile = Join-Path $CHAT_IN ("{0}__user__chat__{1}.json" -f $ts, $id)

$pkt = @{
  v = 1
  ts = (Get-Date).ToUniversalTime().ToString("o")
  app = "user"
  kind = "intent"
  id = $id
  ref = $null
  topic = "chat"
  payload = @{ prompt = $Prompt }
  policy = @{ plan_ack = $true }
} | ConvertTo-Json -Depth 6

$pkt | Set-Content -Path $inFile -Encoding UTF8

Push-Location $SDK_DIR
$env:SCINGGPT_ROOT = $SCINGGPT_ROOT
$env:SERVER_JS     = $SERVER_JS
$env:CHAT_ROOT     = $CHAT_ROOT
$env:PROOF_PATH    = "G:\GIT\isystemsdirect\ScingOS\.tmp\_spectro_ask_proof.txt"

$outFile = node $RUNNER $inFile
Pop-Location

Write-Host "OUT FILE:" -ForegroundColor Cyan
Write-Host $outFile
Write-Host ""
Write-Host "OUT CONTENT:" -ForegroundColor Cyan
Get-Content $outFile -Raw | Write-Host
