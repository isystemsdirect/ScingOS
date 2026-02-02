param(
	[Parameter(Mandatory=$true)][string]$Prompt,
	[string]$Model = "",
	[int]$TimeoutSec = 60,
	[switch]$WantCitations
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "[fireworks] RESERVED / DISABLED — adapter placeholder." -ForegroundColor Yellow
Write-Host "Roles: fast-inference, vision, edge" -ForegroundColor DarkGray
Write-Host "Required env key(s): FIREWORKS_API_KEY" -ForegroundColor DarkGray

throw "fireworks is disabled or unconfigured. Add keys, then enable in registry."
