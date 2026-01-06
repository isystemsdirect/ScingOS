param(
  [string] $Configuration = "Release",
  [string] $OutputDir = "./dist"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sampleDir = $PSScriptRoot

$proj = Join-Path $sampleDir "HelloHeartbeatPlugin.csproj"
$bin = Join-Path $sampleDir "bin/$Configuration/net8.0"

Write-Host "[pack] build plugin ($Configuration)" -ForegroundColor Cyan

dotnet build $proj -c $Configuration

if (!(Test-Path $bin)) {
  throw "Expected build output folder not found: $bin"
}

$staging = Join-Path $sampleDir ".pack"
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

$binOut = Join-Path $staging "bin"
New-Item -ItemType Directory -Path $binOut | Out-Null

Copy-Item (Join-Path $bin "HelloHeartbeatPlugin.dll") $binOut -Force

$manifestSrc = Join-Path $sampleDir "manifest.json"
if (!(Test-Path $manifestSrc)) { throw "Missing manifest.json" }
Copy-Item $manifestSrc (Join-Path $staging "manifest.json") -Force

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$outFile = Join-Path $OutputDir "hello-heartbeat.splugin"
if (Test-Path $outFile) { Remove-Item $outFile -Force }

Write-Host "[pack] create $outFile" -ForegroundColor Cyan

# Create a ZIP, then rename to .splugin
$tmpZip = Join-Path $OutputDir "hello-heartbeat.zip"
if (Test-Path $tmpZip) { Remove-Item $tmpZip -Force }
Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $tmpZip -Force
Move-Item $tmpZip $outFile -Force

Write-Host "[pack] OK" -ForegroundColor Green
Write-Host "[pack] output: $outFile" -ForegroundColor Green
