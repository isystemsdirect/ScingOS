param(
  [Parameter(Mandatory=$true)][string]$Prompt,
  [string]$Model = "sonar-pro",
  [switch]$WantCitations
)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"
if (-not $env:PERPLEXITY_API_KEY) { throw "Missing env: PERPLEXITY_API_KEY" }

$uri = "https://api.perplexity.ai/chat/completions"
$headers = @{
  "Authorization" = "Bearer $($env:PERPLEXITY_API_KEY)"
  "Content-Type"  = "application/json"
}

$sys = "Return a precise answer."
if ($WantCitations) { $sys = "Return a precise answer with citations if available." }

$body = @{
  model = $Model
  messages = @(
    @{ role="system"; content=$sys }
    @{ role="user"; content=$Prompt }
  )
} | ConvertTo-Json -Depth 10

$resp = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -TimeoutSec 90

$out = [ordered]@{
  ok = $true
  provider = "perplexity"
  model = $Model
  answer = $resp.choices[0].message.content
  citations = $resp.citations
  raw = @{ id=$resp.id; created=$resp.created }
}
$out | ConvertTo-Json -Depth 12
