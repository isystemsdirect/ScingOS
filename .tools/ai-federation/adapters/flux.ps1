param([Parameter(Mandatory=$true)][string]$Prompt)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
throw 'FLUX adapter is not configured. Provide FLUX_API_KEY and endpoint before enabling.'
