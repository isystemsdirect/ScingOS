Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = "G:\GIT\isystemsdirect\ScingOS"
$projectId = "studio-3494288633-91d2b"

Write-Host "============================================================"
Write-Host "FIREBASE: LINK PROJECT + INIT DATA CONNECT"
Write-Host "PROJECT ID: $projectId"
Write-Host "============================================================"

Set-Location $repoRoot

# 1) Verify Firebase CLI
$firebase = (Get-Command firebase -ErrorAction SilentlyContinue)
if (-not $firebase) {
  throw "Firebase CLI not found on PATH. Install: npm i -g firebase-tools"
}

& firebase --version

# 2) Ensure logged in
$loginList = & firebase login:list 2>&1
$loginText = ($loginList | Out-String)
Write-Host $loginText
if ($loginText -match "No authorized accounts") {
  Write-Host "[ACTION REQUIRED] You are not logged in. Run: firebase login"
  Write-Host "Then re-run this script."
  exit 1
}

# 3) Set active project for this repo
& firebase use $projectId

# 4) Initialize Data Connect (interactive)
Write-Host "Launching: firebase init dataconnect"
Write-Host "Accept defaults unless you have a reason not to (directory: dataconnect)."
& firebase init dataconnect

# 5) Verify Studio signifier file exists
$dcYaml = Join-Path $repoRoot "dataconnect\dataconnect.yaml"
if (Test-Path $dcYaml) {
  Write-Host "[OK] dataconnect\\dataconnect.yaml detected"
} else {
  Write-Host "[FATAL] dataconnect\\dataconnect.yaml NOT FOUND"
  exit 1
}

# 6) Quick structure check
Write-Host "============================================================"
Write-Host "DATACONNECT DIRECTORY STRUCTURE"
Write-Host "============================================================"
Get-ChildItem -Path (Join-Path $repoRoot "dataconnect") -Force | Select-Object Name

Write-Host "============================================================"
Write-Host "DONE — Refresh VS Code Firebase Data Connect Studio panel"
Write-Host "============================================================"
