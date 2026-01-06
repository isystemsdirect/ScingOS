# SCINGR Windows Uninstall Registration Audit

## Packaging Stack
- Tauri v2 shell
- MSI installer (WiX v4)

## Install Scope Intent
- Per-machine (admin required)

## Registry Hive
- HKLM (HKEY_LOCAL_MACHINE)

## Uninstall Key Name
- "ScingR" or MSI ProductCode GUID

## ARP Registration Expectations
- ScingR must appear in Windows Settings > Apps > Installed apps
- Uninstall must remove all program files, Start Menu shortcuts, and registry keys
- MSI authored with proper ARP properties (DisplayName, Publisher, DisplayVersion, InstallLocation, UninstallString, NoModify, NoRepair)
- UpgradeCode is stable, ProductCode changes per version
- Service install component referenced by main Feature

## Audit Trail
- This file documents the uninstall registration expectations and packaging stack for ScingR MSI installer.
