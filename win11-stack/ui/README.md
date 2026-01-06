# win11-stack UI

A tiny static status + diagnostics UI for the ScingR Win11 runtime.

- Build output: `dist/`
- Intended hosting: the local runtime service mounts `dist/` at `/ui`.

## Build

From repo root:

- `npm.cmd --prefix win11-stack/ui install`
- `npm.cmd --prefix win11-stack/ui run build`
