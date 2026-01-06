# ScingR — Enterprise Install (MSI)

ScingR ships as a single Windows 11 MSI with two feature modes:
- `runtime` (default): runtime service + shell + UI assets
- `developer`: runtime + CLI + SDK templates/samples/docs

## Silent install (enterprise)

Supported MSI properties:
- `INSTALLMODE=runtime|developer`
- `SCING_PORT=3333` (sets machine env var `ScingEmulator__Port`)
- `START_SERVICE=1` (start the Windows Service after install)
- `PRESERVE_DATA=0|1` (whether to preserve `%ProgramData%\ScingOS\` on uninstall)

Examples:

Runtime-only:
- `msiexec /i ScingR.msi /qn INSTALLMODE=runtime START_SERVICE=1 SCING_PORT=3333`

Developer install:
- `msiexec /i ScingR.msi /qn INSTALLMODE=developer START_SERVICE=1 SCING_PORT=3333`

Uninstall and remove data:
- `msiexec /x ScingR.msi /qn PRESERVE_DATA=0`

## Service details

The installer registers a Windows Service:
- ServiceName: `ScingEmulatorService`
- DisplayName: `ScingR Runtime Service`
- StartType: Automatic

## Notes

- UI assets are installed and served by the service using the machine env var `SCING_EMULATOR_UI_DIR`.
- The CLI is installed (developer mode) and added to the machine `PATH` via the developer feature.
