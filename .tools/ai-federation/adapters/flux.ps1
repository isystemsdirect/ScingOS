param(
	[Parameter(Mandatory=$true)][string]$Prompt,
	[string]$Model = "",
	[int]$TimeoutSec = 60,
	[switch]$WantCitations
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "[flux] RESERVED / DISABLED — adapter placeholder." -ForegroundColor Yellow
Write-Host "Roles: image, photorealism, materials" -ForegroundColor DarkGray
Write-Host "Required env key(s): BFL_API_KEY, FLUX_API_KEY" -ForegroundColor DarkGray

throw "flux is disabled or unconfigured. Add keys, then enable in registry."
