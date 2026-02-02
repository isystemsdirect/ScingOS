param(
  [Parameter(Mandatory=$false)][string]$Folder = "G:\GIT\isystemsdirect\ScingOS\.spectroline\inbox"
)

$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

function Is-String($x){ return $x -is [string] }
function Is-Int($x){ return $x -is [int] -or $x -is [long] }
function Has-Prop($obj,$name){ try { return $null -ne $obj.PSObject.Properties[$name] } catch { return $false } }

function Validate-Packet($pkt){
  $errors = @()
  if (-not (Is-Int $pkt.v)) { $errors += "v must be integer" }
  if (-not (Is-String $pkt.ts)) { $errors += "ts must be string (ISO)" }
  if (-not (Is-String $pkt.app)) { $errors += "app must be string" }
  if (-not (Is-String $pkt.kind)) { $errors += "kind must be string" }
  if (-not (Is-String $pkt.id)) { $errors += "id must be string" }
  if (-not (Has-Prop $pkt 'ref')) { $errors += "ref must exist (string or null)" }
  if (-not (Is-String $pkt.topic)) { $errors += "topic must be string" }
  if ($null -eq $pkt.payload) { $errors += "payload must be object" }
  if ($null -eq $pkt.policy) { $errors += "policy must be object" }
  elseif (-not (Has-Prop $pkt.policy 'plan_ack')) { $errors += "policy.plan_ack must exist" }
  return $errors
}

Write-Host "Validating packets in: $Folder" -ForegroundColor Cyan
$files = Get-ChildItem $Folder -Filter "*.json" -File -ErrorAction SilentlyContinue
foreach ($f in $files){
  try {
    $pkt = Get-Content $f.FullName -Raw | ConvertFrom-Json
    $errs = Validate-Packet $pkt
    if (@($errs).Count -eq 0) {
      Write-Host "OK  - $($f.Name)" -ForegroundColor Green
    } else {
      Write-Host "BAD - $($f.Name)" -ForegroundColor Red
      foreach ($e in $errs){ Write-Host "  - $e" }
    }
  } catch {
    Write-Host "ERR - $($f.Name): $($_.Exception.Message)" -ForegroundColor Red
  }
}
