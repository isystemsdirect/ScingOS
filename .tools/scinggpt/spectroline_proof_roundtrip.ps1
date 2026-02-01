param()

$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$SCINGOS_ROOT  = "G:\GIT\isystemsdirect\ScingOS"
$SCINGGPT_ROOT = "G:\GIT\isystemsdirect\scinggpt-mcp"
$SERVER_JS     = "G:\GIT\isystemsdirect\scinggpt-mcp\dist\server.js"

$SDK_DIR       = "G:\GIT\isystemsdirect\ScingOS\.tmp\scinggpt_connect_evidence\sdk_roundtrip"
$ROUNDTRIP     = "G:\GIT\isystemsdirect\ScingOS\.tmp\scinggpt_connect_evidence\sdk_roundtrip\roundtrip.mjs"

$PROOF_PATH    = "G:\GIT\isystemsdirect\ScingOS\.tmp\_spectro_link_proof.txt"
$PROOF_CONTENT = "PROOF: ScingGPT (SpectroLINE) persistent runner @ " + (Get-Date -Format o)

if (!(Test-Path $SDK_DIR)) { New-Item -ItemType Directory -Force -Path $SDK_DIR | Out-Null }

Push-Location $SDK_DIR
if (!(Test-Path package.json)) { npm init -y | Out-Null }
if (!(Test-Path node_modules\@modelcontextprotocol\sdk)) { npm install @modelcontextprotocol/sdk --save | Out-Null }

if (!(Test-Path $ROUNDTRIP)) { throw "Missing roundtrip.mjs at: $ROUNDTRIP (it should already exist from your successful run)." }

$env:SCINGGPT_ROOT = $SCINGGPT_ROOT
$env:SERVER_JS     = $SERVER_JS
$env:OUT_TOOLS     = Join-Path $SDK_DIR "tools_list.json"
$env:OUT_WRITE     = Join-Path $SDK_DIR "proof_write_result.json"
$env:OUT_READ      = Join-Path $SDK_DIR "proof_read_result.json"
$env:PROOF_PATH    = $PROOF_PATH
$env:PROOF_CONTENT = $PROOF_CONTENT

node $ROUNDTRIP 2>&1 | Tee-Object -FilePath (Join-Path $SDK_DIR "run_log.txt")

if (Test-Path $PROOF_PATH) { Write-Host "PROOF FILE EXISTS " -ForegroundColor Green; Get-Content $PROOF_PATH -Raw } else { Write-Host "PROOF FILE MISSING " -ForegroundColor Red }

Pop-Location
