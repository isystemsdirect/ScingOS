# BANE Security Contract

BANE is a security governor for SCINGULAR/LARI operations. It is designed to be conservative, deterministic, and hostile-by-default toward unknown/unauthorized contexts.

## Core Guarantees

- Default deny for unknown or incomplete security context.
- No negotiation: responses are policy-based and do not provide bypass guidance.
- Progressive containment: repeated hostile/unauthorized behavior escalates to quarantine/lockout.
- Evidence preservation: actions are audited with hashes and redacted summaries.

## Escalation Ladder (bane_fog_v1)

- Level 0: allow
- Level 1: sanitize (redaction)
- Level 2: deny + warn (first strike)
- Level 3: deny + quarantine (repeat deny / missing capability)
- Level 4: lockout (repeat denies)
- Level 5: incident posture (critical severity)

## What Is Logged

- `traceId`, timestamps, route, enforcement level
- identity/session identifiers where available (no secrets)
- hashes of request text (not raw text)
- redacted summaries of findings

## What Is Never Logged

- raw tokens / credentials
- raw secrets
- full system prompts or internal policy details
- detailed detector thresholds or bypass instructions

## Operator Capabilities

- `bane:operator` is required for:
  - viewing recent audits
  - unlocking identities
  - forcing lockout

## Response Safety

Public responses are intentionally generic and policy-based. They must never expose detector internals, rule IDs, or implementation details.
