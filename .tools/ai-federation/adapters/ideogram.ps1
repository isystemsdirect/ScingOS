param(
	[Parameter(Mandatory=$true)][string]$Prompt,
	[string]$Model = "",
	[int]$TimeoutSec = 60,
	[switch]$WantCitations
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "[ideogram] RESERVED / DISABLED — adapter placeholder." -ForegroundColor Yellow
Write-Host "Roles: text-image, ui, typography" -ForegroundColor DarkGray
Write-Host "Required env key(s): IDEOGRAM_API_KEY" -ForegroundColor DarkGray

throw "ideogram is disabled or unconfigured. Add keys, then enable in registry."
