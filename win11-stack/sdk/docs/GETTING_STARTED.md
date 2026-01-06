# ScingOS Win11 Stack — Getting Started

## Prereqs (Windows 11)

- .NET SDK 8
- Node.js (use `npm.cmd` in PowerShell)
- Rust toolchain (for Tauri)

## Run the stack (service + shell)

1) Validate Phase 4 gates:

- `powershell -NoProfile -ExecutionPolicy Bypass -File win11-stack/scripts/validate-phase4.ps1`

2) Start backend + shell (builds UI first):

- `powershell -NoProfile -ExecutionPolicy Bypass -File win11-stack/scripts/dev-up.ps1`

The shell loads the UI from:

- `http://127.0.0.1:3333/ui`

## Using the TS SDK

See SDK quickstart:

- [SDK_QUICKSTART_TS.md](SDK_QUICKSTART_TS.md)

## Using the .NET SDK + CLI

See:

- [SDK_QUICKSTART_DOTNET.md](SDK_QUICKSTART_DOTNET.md)
