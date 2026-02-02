param(
  [Parameter(Mandatory=$true)][string]$ResultJsonPath,
  [string]$OutStateDir = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function TsFile { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }
function Clean($s) {
  if ($null -eq $s) { return "" }
  $t = [string]$s
  $t = $t -replace "`r",""
  $t = ($t -split "`n") -join "`n"
  return $t.Trim()
}
function Sentences($s) {
  $t = Clean $s
  if (-not $t) { return @() }
  # Lightweight: split on sentence-ish boundaries (., ?, !, newline)
  $parts = $t -split "(?<=[\.?\!])\s+|`n+"
  $parts = $parts | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_.Length -ge 18 }
  return $parts
}

if (!(Test-Path $ResultJsonPath)) { throw "Missing result file: $ResultJsonPath" }

$packet = Get-Content $ResultJsonPath -Raw | ConvertFrom-Json
$results = @()
try { $results = $packet.payload.results } catch { $results = @() }

$oks = @($results | Where-Object { $_.ok -eq $true })
$errs= @($results | Where-Object { $_.ok -ne $true })

# Build provider sentence sets
$provSent = @{}
foreach ($r in $oks) {
  $prov = [string]$r.provider
  $ans  = [string]$r.answer
  $provSent[$prov] = Sentences $ans
}

# Agreement candidates: sentences repeated across >=2 providers (exact match after normalization)
$all = @()
foreach ($k in $provSent.Keys) {
  foreach ($s in $provSent[$k]) {
    $norm = ($s.ToLowerInvariant() -replace "\s+"," ").Trim()
    if ($norm.Length -ge 25) {
      $all += [pscustomobject]@{ provider=$k; norm=$norm; text=$s }
    }
  }
}

$groups = $all | Group-Object norm
$agreements = @()
foreach ($g in $groups) {
  $prov = @($g.Group | Select-Object -ExpandProperty provider | Sort-Object -Unique)
  if ($prov.Count -ge 2) {
    $agreements += [ordered]@{
      text = ($g.Group | Select-Object -First 1).text
      providers = $prov
      count = $prov.Count
    }
  }
}

# Contradiction heuristics:
# - Detect numeric conflicts: different numbers for same keyword context
# - Detect opposite polarity with "must/should" vs "must not/should not" around same keyword
function ExtractNumbers($s) {
  $t = Clean $s
  if (-not $t) { return @() }
  $m = [regex]::Matches($t, "(?<![A-Za-z])\d+(\.\d+)?(?![A-Za-z])")
  $nums = @()
  foreach ($x in $m) { $nums += $x.Value }
  return $nums | Select-Object -Unique
}

function KeywordContext($s) {
  $t = Clean $s
  $t = $t.ToLowerInvariant()
  $keys = @("mcp","proxy","token","audit","policy","commit","push","repo","packet","watcher","http","https","urlacl","firewall","port","localhost")
  $hit = @()
  foreach ($k in $keys) { if ($t -match [regex]::Escape($k)) { $hit += $k } }
  return ($hit | Select-Object -Unique)
}

$numericClaims = @()
foreach ($r in $oks) {
  $prov = [string]$r.provider
  foreach ($s in $provSent[$prov]) {
    $nums = ExtractNumbers $s
    if ($nums.Count -gt 0) {
      $ctx = KeywordContext $s
      if ($ctx.Count -gt 0) {
        $numericClaims += [pscustomobject]@{
          provider=$prov
          sentence=$s
          numbers=$nums
          ctx=($ctx -join ",")
        }
      }
    }
  }
}

# Group numeric claims by ctx and look for different numbers across providers
$contradictions = @()
$ncg = $numericClaims | Group-Object ctx
foreach ($g in $ncg) {
  if (-not $g.Name) { continue }
  $allNums = @($g.Group | ForEach-Object { $_.numbers } | ForEach-Object { $_ } | Select-Object -Unique)
  if ($allNums.Count -ge 2) {
    # Only flag if multiple providers involved
    $prov = @($g.Group | Select-Object -ExpandProperty provider | Sort-Object -Unique)
    if ($prov.Count -ge 2) {
      $contradictions += [ordered]@{
        kind="numeric_conflict"
        context=$g.Name
        numbers=$allNums
        providers=$prov
        examples=@(
          $g.Group | Select-Object provider,sentence,numbers | Select-Object -First 4
        )
      }
    }
  }
}

# Polarity conflicts (must vs must not / should vs should not)
function Polarity($s) {
  $t = Clean $s
  $t = $t.ToLowerInvariant()
  $pos = ($t -match "\b(must|should|required|always)\b") -and (-not ($t -match "\b(must not|should not|never|prohibited|avoid)\b"))
  $neg = ($t -match "\b(must not|should not|never|prohibited|avoid)\b")
  if ($neg) { return "neg" }
  if ($pos) { return "pos" }
  return "neutral"
}

$polClaims = @()
foreach ($r in $oks) {
  $prov = [string]$r.provider
  foreach ($s in $provSent[$prov]) {
    $p = Polarity $s
    if ($p -ne "neutral") {
      $ctx = KeywordContext $s
      if ($ctx.Count -gt 0) {
        $polClaims += [pscustomobject]@{
          provider=$prov
          sentence=$s
          polarity=$p
          ctx=($ctx -join ",")
        }
      }
    }
  }
}

$pcg = $polClaims | Group-Object ctx
foreach ($g in $pcg) {
  if (-not $g.Name) { continue }
  $pols = @($g.Group | Select-Object -ExpandProperty polarity | Sort-Object -Unique)
  if ($pols.Count -ge 2) {
    $prov = @($g.Group | Select-Object -ExpandProperty provider | Sort-Object -Unique)
    if ($prov.Count -ge 2) {
      $contradictions += [ordered]@{
        kind="polarity_conflict"
        context=$g.Name
        polarities=$pols
        providers=$prov
        examples=@(
          $g.Group | Select-Object provider,polarity,sentence | Select-Object -First 6
        )
      }
    }
  }
}

$outDir = $OutStateDir
if (-not $outDir) {
  # infer .spectroline/ai/state relative to result file location
  $scingos = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $ResultJsonPath))
  $outDir = Join-Path $scingos ".spectroline\ai\state"
}
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$rid = $packet.ref
if (-not $rid) { $rid = "unknown" }
$outFile = Join-Path $outDir ("{0}__ai_diff__{1}.json" -f (TsFile), $rid)

$diff = [ordered]@{
  ts = IsoUtc
  ref = $rid
  providers_ok = @($oks | Select-Object -ExpandProperty provider)
  providers_err = @($errs | Select-Object -ExpandProperty provider)
  agreement_count = $agreements.Count
  agreements = ($agreements | Sort-Object count -Descending | Select-Object -First 20)
  contradiction_count = $contradictions.Count
  contradictions = $contradictions
  note = "Heuristic diff: agreements are exact-normalized repeats; contradictions are numeric/polarity conflicts in shared keyword context."
}

($diff | ConvertTo-Json -Depth 40) | Set-Content -Path $outFile -Encoding UTF8
Write-Host "WROTE: $outFile"