param([string]$Root)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---------- [0] ROOT + PATHS ----------
# CANONICAL_ROOT_RESOLVER
# ROOT selection order:
# 1) -Root (explicit)
# 2) git rev-parse --show-toplevel (current worktree)
# 3) fallback: current location
if ($null -ne $Root -and -not [string]::IsNullOrWhiteSpace($Root)) {
  try { $ROOT = (Resolve-Path $Root).Path } catch { $ROOT = $Root }
} else {
  try {
    $ROOT = (& git rev-parse --show-toplevel).Trim()
    if ([string]::IsNullOrWhiteSpace($ROOT)) { throw "empty" }
  } catch {
    $ROOT = (Get-Location).Path
  }
}

Set-Location $ROOT

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function TsFile { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }
function New-Id12 { [guid]::NewGuid().ToString("N").Substring(0,12) }

$AI_RUN    = Join-Path $ROOT ".tools\ai-federation\run"
$AI_LANE   = Join-Path $ROOT ".spectroline\ai"
$AI_INBOX  = Join-Path $AI_LANE "inbox"
$AI_OUTBOX = Join-Path $AI_LANE "outbox"
$AI_STATE  = Join-Path $AI_LANE "state"
$AI_LOGS   = Join-Path $AI_LANE "logs"
$AI_TPL    = Join-Path $AI_LANE "templates\ai_query_contradiction_test.intent.json"

$RO_PROXY_DIR = Join-Path $ROOT ".tools\scinggpt-remote"
$RO_PROXY     = Join-Path $RO_PROXY_DIR "scinggpt_proxy.js"
$RO_GATE      = Join-Path $RO_PROXY_DIR "REMOTE_GATE.json"

$ASK = Join-Path $ROOT ".tools\scinggpt\ask_scinggpt.ps1"

Write-Host ("ROOT: " + $ROOT) -ForegroundColor Cyan

# ---------- [1] ASSERT LANES + SCRIPTS EXIST ----------
$must = @(
  (Join-Path $AI_RUN "ai_router.ps1"),
  (Join-Path $AI_RUN "ai_diff.ps1"),
  (Join-Path $AI_RUN "ai_evidence_pack.ps1"),
  (Join-Path $AI_RUN "ai_run_intent.ps1"),
  (Join-Path $AI_RUN "ai_inbox_watcher.ps1"),
  $AI_TPL
)
$missing = @()
foreach ($p in $must) { if (!(Test-Path $p)) { $missing += $p } }
if ($missing.Count -gt 0) {
  Write-Host "`nMISSING REQUIRED FILES:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor Red }
  throw "Fix missing files before continuing."
}
Write-Host "OK: required scripts + template present ✅" -ForegroundColor Green

# ---------- [2] PREVENT "OUTBOX FLOOD" (SINGLE WATCHER + STATE LEDGER) ----------
# A) Stop duplicate watchers (SpectroLINE + AI lane) if multiple are running.
function Stop-WatchersByRegex([string]$regex) {
  $procs = Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
    Where-Object { $_.CommandLine -match $regex }
  foreach ($p in $procs) {
    try {
      Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
      Write-Host ("Stopped watcher PID " + $p.ProcessId + " (" + $regex + ")") -ForegroundColor Yellow
    } catch {}
  }
}
Stop-WatchersByRegex "spectroline_watch\.ps1"
Stop-WatchersByRegex "ai_inbox_watcher\.ps1"

# B) Ensure AI lane directories exist.
New-Item -ItemType Directory -Force -Path $AI_INBOX,$AI_OUTBOX,$AI_STATE,$AI_LOGS | Out-Null

# C) Ensure we have a "seen ledger" file.
$ledger = Join-Path $AI_STATE "seen_ledger.json"
if (!(Test-Path $ledger)) {
  @{ v=1; created=IsoUtc; seen=@{} } | ConvertTo-Json -Depth 50 | Set-Content -Encoding UTF8 -Path $ledger
  Write-Host ("Created AI ledger: " + $ledger) -ForegroundColor Green
} else {
  Write-Host ("Ledger exists: " + $ledger) -ForegroundColor Green
}

# D) OPTIONAL: keep AI outbox/logs/state out of git by default (recommended).
$gi = Join-Path $ROOT ".gitignore"
$giBlock = @"
# --- SPECTROSpectroLINE™ AI lane: runtime artifacts (keep auditable locally, not in git) ---
.spectroline/ai/outbox/
.spectroline/ai/logs/
.spectroline/ai/state/
"@
if (Test-Path $gi) {
  $txt = Get-Content $gi -Raw
  if ($txt -notmatch "SPECTROSpectroLINE.*AI lane") {
    Add-Content -Path $gi -Value "`n$giBlock"
    Write-Host "Updated .gitignore with AI runtime artifact exclusions ✅" -ForegroundColor Green
  } else {
    Write-Host ".gitignore already contains AI runtime artifact exclusions ✅" -ForegroundColor Green
  }
} else {
  $giBlock | Set-Content -Path $gi -Encoding UTF8
  Write-Host "Created .gitignore with AI runtime artifact exclusions ✅" -ForegroundColor Green
}

# ---------- [3] START AI INBOX WATCHER (SINGLE INSTANCE) ----------
Write-Host "`nStarting AI Inbox Watcher..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoProfile","-ExecutionPolicy","Bypass","-File",(Join-Path $AI_RUN "ai_inbox_watcher.ps1")
) | Out-Null
Start-Sleep -Milliseconds 900

# ---------- [4] SEED A FRESH INTENT (CONTRADICTION TEST TEMPLATE) ----------
$tsUtcFile = TsFile
$id = New-Id12
$seed = Join-Path $AI_INBOX ("{0}__ai__intent__{1}.json" -f $tsUtcFile, $id)

$tpl = Get-Content $AI_TPL -Raw | ConvertFrom-Json
$tpl.ts = IsoUtc
$tpl.id = $id
$tpl.ref = $null
$tpl.policy.plan_ack = $true

$tpl | ConvertTo-Json -Depth 50 | Set-Content -Encoding UTF8 -Path $seed
Write-Host ("Seeded intent: " + $seed + " ✅") -ForegroundColor Green

# ---------- [5] RUN "LATEST INTENT ONCE" (FOR IMMEDIATE PROOF) ----------
Write-Host "`nRunning latest intent once..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File (Join-Path $AI_RUN "ai_run_intent.ps1") -IntentPath $seed

# ---------- [6] WAIT + CONFIRM OUTBOX RESULT APPEARS ----------
Start-Sleep -Milliseconds 1200
$outLatest = Get-ChildItem $AI_OUTBOX -File -Filter "*.json" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (!$outLatest) {
  Write-Host "NO OUTBOX RESULT FOUND ❌  (check watcher/router logs)" -ForegroundColor Red
} else {
  Write-Host ("OUTBOX RESULT ✅ -> " + $outLatest.FullName) -ForegroundColor Green
}

# ---------- [7] DIFF + EVIDENCE PACK (LOCK IN PROOF ARTIFACTS) ----------
Write-Host "`nCreating AI diff + evidence pack..." -ForegroundColor Cyan
if ($outLatest) {
  powershell -ExecutionPolicy Bypass -File (Join-Path $AI_RUN "ai_diff.ps1") -ResultJsonPath $outLatest.FullName -OutStateDir $AI_STATE
  powershell -ExecutionPolicy Bypass -File (Join-Path $AI_RUN "ai_evidence_pack.ps1") -IntentJsonPath $seed -ResultJsonPath $outLatest.FullName -OutStateDir $AI_STATE
}

$stateLatest = Get-ChildItem $AI_STATE -File -Filter "*.json" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending | Select-Object -First 6

Write-Host "`nSTATE ARTIFACTS (latest):" -ForegroundColor Cyan
$stateLatest | ForEach-Object { "{0}  {1}" -f $_.LastWriteTime, $_.Name } | Write-Host

# ---------- [8] PERPLEXITY INTEGRATION (PRACTICAL REALITY) ----------
Write-Host "`nPerplexity bridge prep (read-only remote gateway)..." -ForegroundColor Cyan
if (!(Test-Path $RO_PROXY)) { Write-Host ("Missing proxy: " + $RO_PROXY) -ForegroundColor Yellow } else {
  if (!(Test-Path $RO_GATE))  { Write-Host ("Missing gate:  " + $RO_GATE) -ForegroundColor Yellow }
  # Optional token (set your own)
  if (-not $env:REMOTE_TOKEN) { $env:REMOTE_TOKEN = ("tok_" + [guid]::NewGuid().ToString("N")) }
  Write-Host ("REMOTE_TOKEN (save this): " + $env:REMOTE_TOKEN) -ForegroundColor Yellow

  # Start proxy on localhost (HTTP fallback unless certs provided)
  try {
    Start-Process node -ArgumentList @($RO_PROXY) | Out-Null
    Start-Sleep -Milliseconds 900
    Write-Host "Started read-only proxy (local). Next: tunnel it for Perplexity access." -ForegroundColor Green
  } catch {
    Write-Host ("Proxy start failed: " + $_.Exception.Message) -ForegroundColor Red
  }
}

Write-Host @"
--- Cloudflare Tunnel (make Perplexity able to reach it) ---
1) Install cloudflared on this machine if not installed.
2) Run ONE of these:

# HTTP tunnel (simple)
cloudflared tunnel --url http://127.0.0.1:8788

# If your proxy is HTTPS-enabled, tunnel that instead
cloudflared tunnel --url https://localhost:4443

3) In Perplexity, fetch the tunnel URL endpoints and include header:
Authorization: Bearer $env:REMOTE_TOKEN

NOTE: Keep the gate read-only until you explicitly expand allowlist.
"@ -ForegroundColor Cyan

# ---------- [9] OPTIONAL: COMMIT+PUSH (ONLY IF YOU WANT THIS CHECKPOINT IN GIT) ----------
Write-Host "`nOptional checkpoint commit+push via ScingGPT bridge..." -ForegroundColor Cyan
$doCommitPush = $false   # flip to $true if you want it right now
if ($doCommitPush -and (Test-Path $ASK)) {
  $msg = 'Checkpoint: SPECTROSpectroLINE™ AI federation lane (watcher+intent+evidence+RO proxy prep)'
  $prompt = 'OP:COMMITPUSH "' + $msg + '" OP:REMOTE "origin" OP:BRANCH "scpsc-ultra-grade-foundation-clean"'
  powershell -ExecutionPolicy Bypass -File $ASK -Prompt $prompt
  Write-Host "Commit+push requested ✅" -ForegroundColor Green
} elseif (-not (Test-Path $ASK)) {
  Write-Host "ScingGPT ask bridge not found; skipping commit+push." -ForegroundColor Yellow
} else {
  Write-Host "SKIPPED commit+push (doCommitPush=false). Flip it when ready." -ForegroundColor Yellow
}

Write-Host "`nDONE ✅  (End-to-end proof + Perplexity gateway prep complete.)" -ForegroundColor Green
