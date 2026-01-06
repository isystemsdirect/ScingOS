param()

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repoRoot

Write-Host "[phase6] running phase5 gate..."
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot 'win11-stack\scripts\validate-phase5.ps1') | Out-Host

$versionJson = Join-Path $repoRoot 'win11-stack\sdk\core\version.json'
$ver = (Get-Content $versionJson -Raw | ConvertFrom-Json).version
if ([string]::IsNullOrWhiteSpace($ver)) {
  throw "[phase6] missing version in $versionJson"
}

$parts = $ver.Split('.', [System.StringSplitOptions]::RemoveEmptyEntries)
if ($parts.Length -lt 3) {
  $ver = ($parts + @('0','0','0'))[0..2] -join '.'
}

Write-Host "[phase6] staging build outputs..."
$stagingRoot = Join-Path $repoRoot 'win11-stack\installer\staging'
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot 'win11-stack\installer\build-staging.ps1') -StagingRoot $stagingRoot | Out-Host

Write-Host "[phase6] building WiX MSI..."
$wixProj = Join-Path $repoRoot 'win11-stack\installer\wix\ScingR.wixproj'
& dotnet build $wixProj -c Release -p:ProductVersion=$ver -p:StagingRoot=$stagingRoot | Out-Host

$msi = Join-Path $repoRoot "win11-stack\installer\out\ScingR-$ver.msi"
if (-not (Test-Path $msi)) {
  $alt = Get-ChildItem -Path (Join-Path $repoRoot 'win11-stack\installer\out') -Filter 'ScingR-*.msi' -File | Select-Object -First 1
  if ($null -ne $alt) {
    $msi = $alt.FullName
  } else {
    throw "[phase6] MSI build failed: no ScingR-*.msi found under win11-stack/installer/out"
  }
}

Write-Host "[phase6] OK -> $msi"
