# Event Model

Events use a canonical envelope (schema: `win11-stack/sdk/core/scing.schema.json`).

## Envelope fields

- `version`: populated from `win11-stack/sdk/core/version.json`.
- `timestamp`: ISO-8601 string.
- `correlationId`: UUID.
- `source`: sender identifier (e.g. `sdk.ts`, `hello-panel`).
- `type`: namespaced event type.
- `payload`: arbitrary JSON payload.
- `signature` (optional): reserved for later signing.

## Namespaces

Phase 1 schema constrains `type` to namespaces:

- `system.*`
- `neural.*`
- `avatar.*`
- `srt.*`
- `lari.*`
- `bane.*`
