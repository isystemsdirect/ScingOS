# CB_SCINGR_SRT_INTEGRATION_WIN10
# RUN IN: VS Code Terminal (PowerShell)
# CWD: any (this script will cd)
# GOAL: Add SRT state engine + visual motifs into ScingR, plus SRT messages over link-server

Set-Location "G:\GIT\isystemsdirect\ScingOS\scingr-visual"
$ErrorActionPreference = "Stop"

# 0) Ensure deps
if (!(Test-Path ".\package.json")) { throw "Missing package.json in scingr-visual" }

# PowerShell note: prefer npm.cmd to avoid execution-policy issues with npm.ps1
npm.cmd install
npm.cmd install ws | Out-Null

Write-Host ""
Write-Host "============================================================"
Write-Host "SCINGR + SRT APPLIED."
Write-Host "RUN (2 terminals):"
Write-Host "  Terminal A:  cd G:\GIT\isystemsdirect\ScingOS\scingr-visual ; npm.cmd run link"
Write-Host "  Terminal B:  cd G:\GIT\isystemsdirect\ScingOS\scingr-visual ; npm.cmd start"
Write-Host ""
Write-Host "In ScingR window:"
Write-Host "  - Click Connect (ws://127.0.0.1:8787)"
Write-Host "  - Watch avatar text + pulse behavior change automatically (SRT packets)."
Write-Host "  - Use SRT buttons to force states locally."
Write-Host "============================================================"
Write-Host ""
