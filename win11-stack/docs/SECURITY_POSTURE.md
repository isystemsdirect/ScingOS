# Security posture (baseline)

## Default posture

- Service binds to **localhost only** (`127.0.0.1`) by default.
- Streaming supported via **WebSocket** and **SSE** on localhost.

## Sensitive operations

Token-gated endpoints (baseline):

- Config writes
- Administrative diagnostics (logs tail)
- Future: plugin install/enable/disable, device hooks

Token transport: `X-Scing-Dev-Token` header.

## Future (designed now)

- Capability-based permissions in plugin manifests (filesystem, mic, camera, bluetooth, serial, logs, config).
- Append-only audit log in `%ProgramData%\ScingOS\Audit\` capturing actor, action, plugin, timestamp, correlationId.
- Optional plugin signing and signature verification.
