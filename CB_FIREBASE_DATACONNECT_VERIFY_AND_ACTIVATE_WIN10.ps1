Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = "G:\GIT\isystemsdirect\ScingOS"
$projectId = "studio-3494288633-91d2b"

Write-Host "============================================================"
Write-Host "VERIFY AUTH + ACTIVATE DATA CONNECT"
Write-Host "PROJECT: $projectId"
Write-Host "============================================================"

Set-Location $repoRoot

# Prefer firebase.cmd to avoid execution-policy blocks on firebase.ps1.
$firebaseCmd = (Get-Command firebase.cmd -ErrorAction SilentlyContinue)
if (-not $firebaseCmd) {
  throw "firebase.cmd not found on PATH. Ensure firebase-tools is installed and available to cmd.exe."
}

# 1) Confirm login
$login = (& $firebaseCmd.Source login:list 2>&1 | Out-String)
Write-Host $login
if ($login -match "No authorized accounts") {
  throw "Not logged in. Run: firebase login"
}

# 2) Confirm active project
& $firebaseCmd.Source use $projectId | Out-Host

# 3) Initialize Data Connect if not already done
$dcYaml = Join-Path $repoRoot "dataconnect\dataconnect.yaml"
if (Test-Path $dcYaml) {
  Write-Host "[OK] dataconnect\\dataconnect.yaml present"
} else {
  Write-Host "[WARN] dataconnect\\dataconnect.yaml missing; running firebase init dataconnect..."
  & $firebaseCmd.Source init dataconnect
  if (Test-Path $dcYaml) {
    Write-Host "[OK] dataconnect\\dataconnect.yaml present"
  } else {
    throw "dataconnect\\dataconnect.yaml still missing after init"
  }
}

# 4) Show structure
Write-Host ""
Write-Host "============================================================"
Write-Host "DATACONNECT DIRECTORY STRUCTURE"
Write-Host "============================================================"
Get-ChildItem -Path (Join-Path $repoRoot "dataconnect") -Force | Select-Object Name | Format-Table -AutoSize

Write-Host "============================================================"
Write-Host "DONE - Refresh Firebase Data Connect: Studio panel"
Write-Host "============================================================"

