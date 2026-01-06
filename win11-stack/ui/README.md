# win11-stack UI

A tiny static status + diagnostics UI for the Win11 emulator stack.

- Build output: `dist/`
- Intended hosting: the local emulator service mounts `dist/` at `/ui`.

## Build

From repo root:

- `npm.cmd --prefix win11-stack/ui install`
- `npm.cmd --prefix win11-stack/ui run build`
