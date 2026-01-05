# Deployment options

## Runtime (End-User)

Installs:

- Windows Service: Scing Emulator Service
- Native Shell (Tauri v2)
- Static UI assets

Behavior:

- Service starts after install and runs continuously.
- Shell launches on demand (and later can be configured to auto-start on login).

## Developer mode (MSI feature)

Adds:

- SDK contracts (OpenAPI + JSON schema + version source)
- CLI (`scingos`)
- Templates and samples
- Developer Center UI (token-gated)

## Enterprise / IT

- MSI supports silent install and managed distribution.
- Logs and configuration stored in `%ProgramData%\ScingOS\`.
