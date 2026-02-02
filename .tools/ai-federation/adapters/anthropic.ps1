param(
	[Parameter(Mandatory=$true)][string]$Prompt,
	[string]$Model = "claude-3-haiku-20240307",
	[int]$TimeoutSec = 90,
	[switch]$WantCitations
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $env:ANTHROPIC_API_KEY) { throw "Missing env: ANTHROPIC_API_KEY" }

$uri = "https://api.anthropic.com/v1/messages"
$headers = @{
	"x-api-key" = $env:ANTHROPIC_API_KEY
	"content-type" = "application/json"
	"anthropic-version" = "2023-06-01"
}

$system = "You are a computation and reasoning engine. Be precise, concise, deterministic."
$body = @{
	model = $Model
	max_tokens = 500
	system = $system
	messages = @(@{ role = "user"; content = $Prompt })
} | ConvertTo-Json -Depth 10

try {
	$resp = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -TimeoutSec $TimeoutSec
	# Anthropic returns content blocks; extract first text block
	$text = $null
	try {
		$blk = $resp.content | Where-Object { $_.type -eq "text" } | Select-Object -First 1
		if ($blk) { $text = $blk.text }
	} catch {}
	if (-not $text) { throw "Anthropic returned no text content" }

	$out = [ordered]@{
		ok = $true
		provider = "anthropic"
		model = $Model
		answer = $text
		citations = $null
		raw = @{ id = $resp.id; stop_reason = $resp.stop_reason; usage = $resp.usage }
	}
	$out | ConvertTo-Json -Depth 12
} catch {
	$err = $_.Exception.Message
	$out = [ordered]@{
		ok = $false
		provider = "anthropic"
		model = $Model
		error = $err
	}
	$out | ConvertTo-Json -Depth 6
	exit 1
}
