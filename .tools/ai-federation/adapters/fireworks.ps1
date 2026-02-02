param([Parameter(Mandatory=$true)][string]$Prompt)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
throw 'Fireworks adapter is not configured. Provide FIREWORKS_API_KEY and endpoint before enabling.'
