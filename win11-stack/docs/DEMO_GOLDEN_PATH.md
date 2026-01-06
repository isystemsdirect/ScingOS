# ScingR — Demo Golden Path (Investor Ready)

Target: < 10 minutes.

## 1) Install ScingR (developer mode)

- Install the MSI in developer mode.
- Silent example:
  - `msiexec /i ScingR.msi /qn INSTALLMODE=developer START_SERVICE=1`

## 2) Launch ScingR (shell)

- Start Menu → ScingR → ScingR
- This opens the shell pointing at `http://127.0.0.1:3333/ui`.

## 3) Run `scingos doctor`

- Open PowerShell:
  - `scingos doctor`

## 4) Pack the hello plugin

- From repo root:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\win11-stack\sdk\samples\hello-plugin-dotnet\pack.ps1`
- Output is a `.splugin` file under the sample directory.

## 5) Install + enable the plugin

- You need an admin token.
- The canonical admin token header is: `X-Scing-Admin-Token`.

Commands:
- `scingos plugin install --file .\win11-stack\sdk\samples\hello-plugin-dotnet\out\hello.splugin --token <ADMIN_TOKEN>`
- `scingos plugin enable --id hello --token <ADMIN_TOKEN>`

## 6) Show the heartbeat in UI

- In the UI plugin manager, verify the plugin is Enabled.
- Confirm the plugin’s heartbeat/output is visible.

## 7) Disable plugin and show it stops

- `scingos plugin disable --id hello --token <ADMIN_TOKEN>`
- Confirm the heartbeat/output stops in the UI.

## 8) Show audit log exists

- Confirm audit log exists under:
  - `%ProgramData%\ScingOS\audit\audit.jsonl`
