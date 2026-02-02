param(
	[Parameter(Mandatory=$true)][string]$Prompt,
	[string]$Model = "",
	[int]$TimeoutSec = 60,
	[switch]$WantCitations
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "[runway] RESERVED / DISABLED — adapter placeholder." -ForegroundColor Yellow
Write-Host "Roles: video, motion, cinematic" -ForegroundColor DarkGray
Write-Host "Required env key(s): RUNWAY_API_KEY" -ForegroundColor DarkGray

throw "runway is disabled or unconfigured. Add keys, then enable in registry."
