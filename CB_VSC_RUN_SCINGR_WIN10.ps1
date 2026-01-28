# CB_VSC_RUN_SCINGR_WIN10
# RUN IN: VS Code Terminal (PowerShell)
# CWD: any (this script resolves repo root from its own path)
# GOAL: Launch ScingR link-server + ScingR app in VS Code integrated terminals.
#
# NOTE:
# - VS Code integrated terminals are best driven via VS Code Tasks.
# - This script will guide you to the right task, and provides a Windows Terminal fallback.

$ErrorActionPreference = "Stop"

$repo = $PSScriptRoot
$app = Join-Path $repo "scingr-visual"

if (!(Test-Path $app)) { throw "Missing folder: $app" }
if (!(Test-Path (Join-Path $app "package.json"))) { throw "Missing package.json in: $app" }

Write-Host ""
Write-Host "============================================================"
Write-Host "ScingR launcher"
Write-Host "============================================================"
Write-Host ""
Write-Host "Preferred: VS Code integrated terminals (Tasks)"
Write-Host "  1) In VS Code: Terminal -> Run Task..."
Write-Host "  2) Select: ScingR: Run link + app (integrated)"
Write-Host ""
Write-Host "In the ScingR window: click CONNECT (ws://127.0.0.1:8787)."
Write-Host ""

# Best-effort: open the Task picker.
$code = Get-Command code -ErrorAction SilentlyContinue
if ($null -ne $code) {
	try {
		# Opens the task picker; user chooses "ScingR: Run link + app (integrated)".
		& $code.Path --reuse-window --command workbench.action.tasks.runTask $repo | Out-Null
	} catch {
		# Non-fatal: task picker invocation may fail depending on VS Code version/settings.
	}
}

# Fallback: Windows Terminal split-pane (external window)
$wt = Get-Command wt -ErrorAction SilentlyContinue
if ($null -ne $wt) {
	Write-Host "Fallback available: Windows Terminal split-pane"
	Write-Host "  Running external split terminals via wt..."
	& $wt.Path -w 0 -p "Windows PowerShell" -d $app powershell -NoExit -Command "npm.cmd run link" `
		; split-pane -V -p "Windows PowerShell" -d $app powershell -NoExit -Command "npm.cmd start"
}
