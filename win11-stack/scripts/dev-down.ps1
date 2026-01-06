$ErrorActionPreference = 'Stop'

Write-Host "[dev-down] stopping dotnet-run service processes..."

$targets = Get-CimInstance Win32_Process -Filter "Name = 'dotnet.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match 'Scing\.Emulator\.Service' }

foreach ($p in $targets) {
  Write-Host "[dev-down] stopping PID=$($p.ProcessId)"
  Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Host "[dev-down] done"
