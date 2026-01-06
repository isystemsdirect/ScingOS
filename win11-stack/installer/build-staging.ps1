param(
  [string]$StagingRoot,
  [string]$Configuration = 'Release',
  [string]$LogPath
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if ([string]::IsNullOrWhiteSpace($StagingRoot)) {
  $StagingRoot = (Join-Path $PSScriptRoot 'staging')
}
if ([string]::IsNullOrWhiteSpace($LogPath)) {
  $LogPath = (Join-Path $PSScriptRoot 'staging-build.log')
}

$transcriptStarted = $false
try {
  Start-Transcript -Path $LogPath -Force | Out-Null
  $transcriptStarted = $true
}
catch {
  # Transcript is best-effort; do not fail staging if it can't start.
}

function Ensure-EmptyDir([string]$Path) {
  if (Test-Path $Path) {
    Remove-Item -Recurse -Force $Path
  }
  New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

$runtimeServiceOut = Join-Path $StagingRoot 'runtime\service'
$runtimeUiOut = Join-Path $StagingRoot 'runtime\ui'
$runtimeShellOut = Join-Path $StagingRoot 'runtime\shell'
$devCliOut = Join-Path $StagingRoot 'developer\cli'
$devSdkOut = Join-Path $StagingRoot 'developer\sdk'

Ensure-EmptyDir $StagingRoot
New-Item -ItemType Directory -Force -Path $runtimeServiceOut, $runtimeUiOut, $runtimeShellOut, $devCliOut, $devSdkOut | Out-Null

try {
  Write-Host "[stage] publishing service..."
  $serviceProj = Join-Path $repoRoot 'backend\Scing.Emulator.Service\Scing.Emulator.Service.csproj'
  # Merge stderr->stdout to avoid NativeCommandError terminating wrappers that use ErrorActionPreference=Stop.
  & dotnet publish $serviceProj -c $Configuration -r win-x64 -o $runtimeServiceOut -p:PublishSingleFile=true -p:SelfContained=true -p:PublishTrimmed=false 2>&1 | Out-Host

$serviceExe = Join-Path $runtimeServiceOut 'Scing.Emulator.Service.exe'
if (-not (Test-Path $serviceExe)) {
  throw "Service publish failed: missing $serviceExe"
}

  Write-Host "[stage] building UI..."
  & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot 'scripts\ui-build.ps1') -Clean 2>&1 | Out-Host
  $uiDist = Join-Path $repoRoot 'ui\dist'
  if (-not (Test-Path (Join-Path $uiDist 'index.html'))) {
    throw "UI build failed: missing dist/index.html"
  }
  Copy-Item -Recurse -Force (Join-Path $uiDist '*') $runtimeUiOut

  Write-Host "[stage] building shell..."
  $shellDir = Join-Path $repoRoot 'shell\Scing.Emulator.Shell'
  $prevErrorActionPreference = $ErrorActionPreference
  try {
    # npm/tauri often writes informational progress to stderr; merge streams to avoid NativeCommandError.
    # Temporarily relax error handling here and fail based on $LASTEXITCODE instead.
    $ErrorActionPreference = 'Continue'

    & npm.cmd --prefix $shellDir install 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Shell deps install failed (exit $LASTEXITCODE)."
    }

    & npm.cmd --prefix $shellDir run tauri:build 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Shell build failed (exit $LASTEXITCODE)."
    }
  }
  finally {
    $ErrorActionPreference = $prevErrorActionPreference
  }

$shellTargetDir = Join-Path $shellDir 'src-tauri\target\release'
$shellExe = Join-Path $shellTargetDir 'ScingR.exe'
if (-not (Test-Path $shellExe)) {
  $candidate = Get-ChildItem -Path $shellTargetDir -Filter '*.exe' -File | Select-Object -First 1
  if ($null -eq $candidate) {
    throw "Shell build failed: missing expected ScingR.exe and no .exe found under $shellTargetDir"
  }
  $shellExe = $candidate.FullName
}

Copy-Item -Force $shellExe (Join-Path $runtimeShellOut 'ScingR.exe')
Get-ChildItem -Path $shellTargetDir -File | Where-Object { $_.Extension -in @('.dll', '.pdb') } | ForEach-Object {
  Copy-Item -Force $_.FullName $runtimeShellOut
}

  Write-Host "[stage] publishing CLI..."
  $cliProj = Join-Path $repoRoot 'sdk\cli\ScingOS.Cli\ScingOS.Cli.csproj'
  $cliTmp = Join-Path $StagingRoot 'tmp\cli'
  Ensure-EmptyDir $cliTmp
  & dotnet publish $cliProj -c $Configuration -r win-x64 -o $cliTmp -p:PublishSingleFile=true -p:SelfContained=true -p:PublishTrimmed=false 2>&1 | Out-Host

$cliExe = Join-Path $cliTmp 'ScingOS.Cli.exe'
if (-not (Test-Path $cliExe)) {
  $candidate = Get-ChildItem -Path $cliTmp -Filter '*.exe' -File | Select-Object -First 1
  if ($null -eq $candidate) {
    throw "CLI publish failed: no .exe found under $cliTmp"
  }
  $cliExe = $candidate.FullName
}
Copy-Item -Force $cliExe (Join-Path $devCliOut 'scingos.exe')

  Write-Host "[stage] copying SDK (templates/samples/docs)..."
$sdkSrc = Join-Path $repoRoot 'sdk'
$robocopyLog = Join-Path $StagingRoot 'tmp\robocopy-sdk.log'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $robocopyLog) | Out-Null

$rcArgs = @(
  $sdkSrc,
  $devSdkOut,
  '/MIR',
  '/XD', 'bin', 'obj', 'node_modules', 'dist', '.turbo',
  '/NFL', '/NDL', '/NJH', '/NJS',
  '/R:2', '/W:1'
)

$rc = & robocopy @rcArgs *>> $robocopyLog
if ($LASTEXITCODE -ge 8) {
  throw "SDK copy failed (robocopy exit $LASTEXITCODE). See $robocopyLog"
}

  Write-Host "[stage] OK -> $StagingRoot"
}
finally {
  if ($transcriptStarted) {
    try { Stop-Transcript | Out-Null } catch { }
  }
}
