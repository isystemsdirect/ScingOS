param([Parameter(Mandatory=$true)][string]$Prompt)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
throw 'Ideogram adapter is not configured. Provide IDEOGRAM_API_KEY and endpoint before enabling.'
