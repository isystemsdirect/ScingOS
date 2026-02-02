param([Parameter(Mandatory=$true)][string]$Prompt)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
throw 'Runway adapter is not configured. Provide RUNWAY_API_KEY and endpoint before enabling.'
