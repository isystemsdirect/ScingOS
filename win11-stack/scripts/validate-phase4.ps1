param(
  [switch]$SkipUiInstall,
  [switch]$SkipSdkInstall
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Write-Host "[phase4] validating contracts..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot 'validate-contracts.ps1') -RepoRoot $repoRoot
if ($LASTEXITCODE -ne 0) { throw 'contracts validation failed' }

Write-Host "[phase4] validating phase3 build (service/ui/shell)..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot 'validate-phase3.ps1') -SkipUiInstall:$SkipUiInstall
if ($LASTEXITCODE -ne 0) { throw 'phase3 validation failed' }

$dotnetSdk = Join-Path $repoRoot 'sdk/dotnet/ScingOS.Sdk/ScingOS.Sdk.csproj'
$dotnetCli = Join-Path $repoRoot 'sdk/cli/ScingOS.Cli/ScingOS.Cli.csproj'

Write-Host "[phase4] dotnet build SDK..." -ForegroundColor Cyan
& dotnet build $dotnetSdk -c Release
if ($LASTEXITCODE -ne 0) { throw 'dotnet build ScingOS.Sdk failed' }

Write-Host "[phase4] dotnet build CLI..." -ForegroundColor Cyan
& dotnet build $dotnetCli -c Release
if ($LASTEXITCODE -ne 0) { throw 'dotnet build ScingOS.Cli failed' }

$tsSdkDir = Join-Path $repoRoot 'sdk/ts/packages/scingos-sdk'
$tsReactDir = Join-Path $repoRoot 'sdk/ts/packages/scingos-sdk-react'

Write-Host "[phase4] build TS SDK..." -ForegroundColor Cyan
if (-not $SkipSdkInstall) {
  & npm.cmd --prefix $tsSdkDir install
  if ($LASTEXITCODE -ne 0) { throw 'npm install scingos-sdk failed' }
}
& npm.cmd --prefix $tsSdkDir run build
if ($LASTEXITCODE -ne 0) { throw 'npm build scingos-sdk failed' }

Write-Host "[phase4] build React SDK..." -ForegroundColor Cyan
if (-not $SkipSdkInstall) {
  & npm.cmd --prefix $tsReactDir install
  if ($LASTEXITCODE -ne 0) { throw 'npm install scingos-sdk-react failed' }
}
& npm.cmd --prefix $tsReactDir run build
if ($LASTEXITCODE -ne 0) { throw 'npm build scingos-sdk-react failed' }

Write-Host "[phase4] OK" -ForegroundColor Green
