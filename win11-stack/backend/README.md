# Win11 Stack – Backend

This folder will hold Windows-native backend components for the ScingOS Win11 emulator stack.

## Phase 1: Scing.Emulator.Service

- .NET 8 Minimal API intended to be hosted as a Windows Service
- Localhost-only binding (`127.0.0.1:3333` by default)

### Endpoints

- `GET /health`
- `GET /config`
- `POST /config` (token-gated; uses `X-Scing-Admin-Token` if `SCING_EMULATOR_DEV_TOKEN` is set)
- `POST /event` (broadcasts to WS/SSE)
- `GET /ws/neural` (WebSocket)
- `GET /sse/neural` (Server-Sent Events)
- `GET /logs/tail?lines=200` (dev-gated)

### Runtime data

- Logs: `%ProgramData%\\ScingOS\\Logs\\`
- Config: `%ProgramData%\\ScingOS\\Emulator\\config.json`

### Build/run

Requires .NET SDK 8.x.

```powershell
cd win11-stack\backend\Scing.Emulator.Service

dotnet restore
dotnet run

# health
curl http://127.0.0.1:3333/health
```
