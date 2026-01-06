param(
  [Parameter(Mandatory = $false)]
  [string]$RepoRoot = ""
)

$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
  Write-Error $Message
  exit 1
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
  $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
}

$versionPath = Join-Path $RepoRoot "sdk\core\version.json"
$openapiPath = Join-Path $RepoRoot "sdk\core\openapi.yaml"
$schemaPath  = Join-Path $RepoRoot "sdk\core\scing.schema.json"
$redoclyConfig = Join-Path $RepoRoot "sdk\core\.redocly.yaml"

if (!(Test-Path $versionPath)) { Fail "Missing version.json: $versionPath" }
if (!(Test-Path $openapiPath)) { Fail "Missing openapi.yaml: $openapiPath" }
if (!(Test-Path $schemaPath))  { Fail "Missing scing.schema.json: $schemaPath" }
if (!(Test-Path $redoclyConfig))  { Fail "Missing .redocly.yaml: $redoclyConfig" }

# ---- Version manifest required keys
$version = Get-Content $versionPath -Raw | ConvertFrom-Json
$required = @('product','channel','version','sdkMin','sdkMax','buildPolicy')
foreach ($k in $required) {
  if (-not ($version.PSObject.Properties.Name -contains $k)) {
    Fail "version.json missing required key '$k'"
  }
  if ([string]::IsNullOrWhiteSpace([string]$version.$k)) {
    Fail "version.json key '$k' is empty"
  }
}

# ---- OpenAPI lint (Redocly)
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Fail "Node required for OpenAPI/schema validation." }

Write-Host "[contracts] Validating OpenAPI (redocly)..." -ForegroundColor Cyan
& npm.cmd exec --yes --package @redocly/cli@1.16.0 -- redocly lint --config $redoclyConfig $openapiPath | Out-String | Write-Host
if ($LASTEXITCODE -ne 0) { Fail "OpenAPI validation failed" }

# ---- Schema compile (AJV)
Write-Host "[contracts] Compiling JSON Schema (ajv)..." -ForegroundColor Cyan
& npm.cmd exec --yes --package ajv-cli@5.0.0 -- ajv compile --spec=draft2020 -s $schemaPath | Out-String | Write-Host
if ($LASTEXITCODE -ne 0) { Fail "Schema compile failed" }

Write-Host "[contracts] OK" -ForegroundColor Green
