# SpectroLINE Federation Notes Lane

This directory is the **repo-backed transport lane** for coordinated, governed communication between Spectro-based apps.

## Folders
- inbox/   packets arriving into the ecosystem (requests, tasks, intents)
- outbox/  packets leaving the ecosystem (results, acknowledgements, responses)
- state/   durable shared state snapshots (small JSON only)
- logs/    append-only logs (jsonl)

## Rule of engagement (non-negotiable)
1. **Never overwrite** existing packet files in inbox/outbox. Create new files.
2. Use **timestamp + unique id** filenames for ordering and traceability.
3. Treat this lane as **auditable transport**, not a chat log.
4. Keep payloads small; store large artifacts elsewhere and reference them.

## Proof
Run: powershell -ExecutionPolicy Bypass -File .\.tools\scinggpt\spectroline_proof_roundtrip.ps1
"@ | Set-Content -Path G:\GIT\isystemsdirect\ScingOS\.spectroline\README.md -Encoding UTF8; @"
# SpectroLINE Protocol (Repo Lane)

This is a minimal interoperable contract so every Spectro app can send/receive governed packets.

## Packet file naming
YYYYMMDD_HHMMSSZ__<app>__<kind>__<uuid>.json

Example:
20260201_071500Z__spectrocap__intent__8f2a0d9e.json

## Required JSON fields
-  (number): protocol version (start with 1)
- 	s (string): ISO-8601 UTC timestamp
- pp (string): sender app id (e.g., spectrocap, scinggpt)
- kind (string): intent | result | ack | event | state
- id (string): unique id (uuid or equivalent)
- ef (string|null): id of packet being replied to
- 	opic (string): short routing topic (e.g., clipboard, ilesync, eceiver_config)
- payload (object): governed content
- policy (object): must include { "plan_ack": true } when tool execution is involved

## Routing convention
- New requests go to: inbox/
- Responses go to: outbox/ with ef set

## Governance
- Payload must be deterministic and auditable.
- No secrets in packets.
- No destructive ops without an explicit policy plan acknowledgement.

