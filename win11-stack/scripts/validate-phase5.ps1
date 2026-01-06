param(
  [switch] $SkipBuild,
  [switch] $SkipUiInstall,
  [switch] $SkipSdkInstall
)

$ErrorActionPreference = "Stop"

Write-Host "[phase5] validate" -ForegroundColor Cyan

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
Push-Location $repoRoot
try {
  if (!(Test-Path "win11-stack/scripts/validate-phase4.ps1")) {
    throw "Expected win11-stack/scripts/validate-phase4.ps1 at repo root. Run from repo root."
  }

  # Phase 5 includes Phase 4 gates.
  & "win11-stack/scripts/validate-phase4.ps1" -SkipUiInstall:$SkipUiInstall -SkipSdkInstall:$SkipSdkInstall

  # Validate plugin schema compiles (basic sanity): load via node and ensure it's parseable JSON.
  Write-Host "[phase5] plugin schema parse" -ForegroundColor Cyan
  $schemaPath = "win11-stack/sdk/core/plugin.schema.json"
  if (!(Test-Path $schemaPath)) { throw "Missing: $schemaPath" }

  node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log('[phase5] plugin.schema.json OK')" $schemaPath

  Write-Host "[phase5] naming constants parse" -ForegroundColor Cyan
  $namingPath = "win11-stack/sdk/core/naming.json"
  if (!(Test-Path $namingPath)) { throw "Missing: $namingPath" }
  node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log('[phase5] naming.json OK')" $namingPath

  if (-not $SkipBuild) {
    Write-Host "[phase5] build hello-heartbeat plugin" -ForegroundColor Cyan
    Push-Location "win11-stack/sdk/samples/hello-plugin-dotnet"
    try {
      dotnet build -c Release
      & "./pack.ps1" -Configuration Release -OutputDir "./dist"
      if (!(Test-Path "./dist/hello-heartbeat.splugin")) { throw "Expected dist/hello-heartbeat.splugin" }
    }
    finally {
      Pop-Location
    }

    Write-Host "[phase5] build service" -ForegroundColor Cyan
    dotnet build "win11-stack/backend/Scing.Emulator.Service/Scing.Emulator.Service.csproj" -c Release
  }

  Write-Host "[phase5] OK" -ForegroundColor Green
}
finally {
  Pop-Location
}
