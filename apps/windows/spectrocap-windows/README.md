# SpectroCAP — Windows Clipboard Host (LAN)

Tiny Windows (WPF) app that listens on HTTP and writes received TEXT into the Windows clipboard.

## Build

From repo root:

```powershell
Set-Location "G:\GIT\isystemsdirect\ScingOS\apps\windows\spectrocap-windows\SpectroCAP.Windows.ClipboardHost"
dotnet build -c Release
```

## Run

```powershell
Start-Process .\bin\Release\net8.0-windows\SpectroCAP.ClipboardHost.exe
```

On first run it creates `%APPDATA%\SpectroCAP\config.json` with a generated token.

## API

- Health: `GET /ping`
- Clipboard push: `POST /clipboard`
  - Header: `X-SpectroCAP-Token: <token>`
  - Body JSON: `{ "text": "...", "type": "text/plain", "source": "SpectroCAP-Android" }`

PowerShell test (same PC):

```powershell
$TOKEN = "PASTE_TOKEN_HERE"
Invoke-RestMethod "http://127.0.0.1:45819/ping" -Method GET
Invoke-RestMethod "http://127.0.0.1:45819/clipboard" -Method POST -Headers @{ "X-SpectroCAP-Token" = $TOKEN } -ContentType "application/json" -Body (@{ text="Hello from LAN"; type="text/plain"; source="windows-test" } | ConvertTo-Json)
```

## LAN binding (URLACL)

The app *tries* to listen on `http://+:45819/` (LAN). If Windows denies it, it falls back to `http://localhost:45819/` and logs a warning.

To enable LAN binding, run **as admin**:

```powershell
netsh http add urlacl url=http://+:45819/ user="DOMAIN\User"
```

(Use the exact user shown in the app log, or your current Windows user.)

## Firewall (inbound)

To allow devices on your LAN to reach the port, add an inbound firewall rule (often requires admin):

```powershell
New-NetFirewallRule -DisplayName "SpectroCAP Clipboard Host (TCP 45819)" `
  -Direction Inbound -Action Allow -Protocol TCP -LocalPort 45819 -Profile Private `
  -Program "G:\GIT\isystemsdirect\ScingOS\apps\windows\spectrocap-windows\SpectroCAP.Windows.ClipboardHost\bin\Release\net8.0-windows\SpectroCAP.ClipboardHost.exe" `
  -ErrorAction SilentlyContinue | Out-Null
```
