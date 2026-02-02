param(
	[Parameter(Mandatory=$true)][string]$Prompt,
	[string]$Model = "gpt-4.1-mini",
	[int]$TimeoutSec = 90,
	[switch]$WantCitations
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $env:OPENAI_API_KEY) { throw "Missing env: OPENAI_API_KEY" }

$uri = "https://api.openai.com/v1/chat/completions"
$headers = @{
	"Authorization" = "Bearer $($env:OPENAI_API_KEY)"
	"Content-Type"  = "application/json"
}

$system = "You are a computation and reasoning engine. Be precise, concise, deterministic."
$body = @{
	model = $Model
	messages = @(
		@{ role = "system"; content = $system }
		@{ role = "user";   content = $Prompt }
	)
	temperature = 0.2
} | ConvertTo-Json -Depth 10

try {
	$resp = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -TimeoutSec $TimeoutSec
	if (-not $resp.choices -or $resp.choices.Count -eq 0) { throw "OpenAI returned no choices" }

	$out = [ordered]@{
		ok = $true
		provider = "openai"
		model = $Model
		answer = $resp.choices[0].message.content
		citations = $null
		raw = @{ id = $resp.id; created = $resp.created; usage = $resp.usage }
	}
	$out | ConvertTo-Json -Depth 12
} catch {
	$err = $_.Exception.Message
	$out = [ordered]@{
		ok = $false
		provider = "openai"
		model = $Model
		error = $err
	}
	$out | ConvertTo-Json -Depth 6
	exit 1
}
