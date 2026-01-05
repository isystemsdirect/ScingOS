# ScingOS Win11 Stack (Emulator + Developer Platform)

## What it is

A Windows 11–native, installable emulator runtime and developer platform:

- **Runtime (End-User mode)**: a Windows Service that exposes a localhost API + event streaming, plus a native shell UI.
- **Developer mode**: adds the ScingOS SDK (contracts + clients), CLI, templates, and samples.

## Why it matters

- **Local-first, secure-by-default**: binds to `127.0.0.1` by default; sensitive actions are token-gated.
- **Enterprise behavior**: Windows Service enables always-on operation, predictable lifecycle, and IT-friendly deployment.
- **Platform moat**: SDK + plugin runtime enables third-party and internal teams to build engines, sensors, and UI panels against stable contracts.

## Golden path demo (10 minutes)

1. Install MSI with **Developer SDK** feature.
2. Launch shell; verify **Connected**.
3. Run `scingos doctor` to validate service status and versions.
4. Create a plugin via template, pack, install, enable.
5. Observe live events in the shell and review plugin logs/audit entries.

## Versioning discipline

- Single version source: `win11-stack/sdk/core/version.json`
- SemVer policy:
  - Service major == SDK major
  - SDK minor <= service minor (additive compatibility)
- Runtime endpoints:
  - `GET /version`
  - `GET /compat`
