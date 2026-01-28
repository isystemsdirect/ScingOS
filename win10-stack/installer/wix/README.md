# ScingR Installer (WiX) - Scaffold

This folder was generated because the repo checkout did not contain any existing WiX installer sources (no .wxs / .wixproj found).

## What this provides
- A minimal Package.wxs template that is Windows 10 Pro compatible.
- out/ directory for build artifacts.

## What is still needed
1. Identify ScingR deliverable(s) produced by this repo (EXE, service, Node runtime, etc.).
2. Place build outputs into a known folder (recommended: win10-stack/installer/payload/).
3. Update Package.wxs to include:
   - Component(s)
   - File payload
   - Optional Windows Service installation (if ScingR runs as a service)
4. Add a stable UpgradeCode GUID once the product identity is locked.

## Build
After WiX Toolset is installed (candle/light on PATH):
- candle Package.wxs -out out\\Package.wixobj
- light out\\Package.wixobj -out out\\ScingR.msi
