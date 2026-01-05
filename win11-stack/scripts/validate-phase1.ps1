param(
  [Parameter(Mandatory = $false)]
  [string]$RepoRoot = ""
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  Write-Error $Message
  exit 1
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $RepoRoot = (Resolve-Path (Join-Path $scriptDir "..\.." )).Path
}

$versionPath = Join-Path $RepoRoot "win11-stack\sdk\core\version.json"
$openapiPath = Join-Path $RepoRoot "win11-stack\sdk\core\openapi.yaml"
$schemaPath  = Join-Path $RepoRoot "win11-stack\sdk\core\scing.schema.json"
$programPath = Join-Path $RepoRoot "win11-stack\backend\Scing.Emulator.Service\Program.cs"
$csprojPath  = Join-Path $RepoRoot "win11-stack\backend\Scing.Emulator.Service\Scing.Emulator.Service.csproj"

if (!(Test-Path $versionPath)) { Fail "Missing version.json: $versionPath" }
if (!(Test-Path $openapiPath)) { Fail "Missing openapi.yaml: $openapiPath" }
if (!(Test-Path $schemaPath))  { Fail "Missing scing.schema.json: $schemaPath" }
if (!(Test-Path $programPath)) { Fail "Missing service Program.cs: $programPath" }
if (!(Test-Path $csprojPath))  { Fail "Missing service csproj: $csprojPath" }

# ---- Version manifest required keys
$version = Get-Content $versionPath -Raw | ConvertFrom-Json
$required = @("product","channel","version","sdkMin","sdkMax","buildPolicy")
foreach ($k in $required) {
  if (-not ($version.PSObject.Properties.Name -contains $k)) {
    Fail "version.json missing required key '$k'"
  }
  if ([string]::IsNullOrWhiteSpace([string]$version.$k)) {
    Fail "version.json key '$k' is empty"
  }
}

# ---- OpenAPI lint (requires Node + npm)
$node = Get-Command node -ErrorAction SilentlyContinue
$npm  = Get-Command npm  -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
  Fail "Node+npm required for OpenAPI/schema validation. Install Node 20+ LTS."
}

Write-Host "Validating OpenAPI (redocly; phase1 config)..." -ForegroundColor Cyan
$redoclyConfig = Join-Path $RepoRoot "win11-stack\sdk\core\.redocly.yaml"
if (!(Test-Path $redoclyConfig)) { Fail "Missing Redocly config: $redoclyConfig" }
& npm exec --yes --package @redocly/cli@1.16.0 -- redocly lint --config $redoclyConfig $openapiPath | Out-String | Write-Host
if ($LASTEXITCODE -ne 0) { Fail "OpenAPI validation failed" }

$openapiText = Get-Content $openapiPath -Raw

# ---- Required endpoints must exist in OpenAPI
$openapiRequiredPaths = @("/health","/version","/compat","/ws/neural","/sse/neural","/event")
foreach ($p in $openapiRequiredPaths) {
  if ($openapiText -notmatch [regex]::Escape($p)) {
    Fail "openapi.yaml missing required path: $p"
  }
}

# ---- Schema compile (AJV)
Write-Host "Compiling JSON Schema (ajv)..." -ForegroundColor Cyan
& npm exec --yes --package ajv-cli@5.0.0 -- ajv compile --spec=draft2020 -s $schemaPath | Out-String | Write-Host
if ($LASTEXITCODE -ne 0) { Fail "Schema compile failed" }

# ---- Enforce OpenAPI info.version == version.json version
$match = [regex]::Match($openapiText, "(?m)^\s*version:\s*([0-9]+\.[0-9]+\.[0-9]+)\s*$")
if (-not $match.Success) {
  Fail "openapi.yaml missing info.version" 
}
$openapiVersion = $match.Groups[1].Value
if ($openapiVersion -ne $version.version) {
  Fail "Version mismatch: openapi.yaml info.version=$openapiVersion but version.json version=$($version.version)"
}

# ---- Service must reference version.json (copy + runtime read)
$csprojText = Get-Content $csprojPath -Raw
if ($csprojText -notmatch "version\.json") {
  Fail "Service csproj does not include version.json for output copying" 
}

$programText = Get-Content $programPath -Raw
if ($programText -notmatch "version\.json") {
  Fail "Service Program.cs does not read version.json" 
}

Write-Host "Phase 1 validation passed." -ForegroundColor Green
