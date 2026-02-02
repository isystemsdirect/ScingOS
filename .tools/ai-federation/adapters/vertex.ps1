param(
  [Parameter(Mandatory=$true)][string]$Prompt
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

throw 'Vertex AI adapter is RESERVED. Enable only after service account + endpoint are configured.'
