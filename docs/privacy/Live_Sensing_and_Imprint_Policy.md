# Live Sensing and Imprint Policy (RTSF)

## Summary
This policy covers live sensing (mic/camera/wearables) and imprint mapping (baseline + deltas) used to adapt Scing delivery.

This is **health-adjacent** but **not medical**.

## Consent (Mandatory)
No live capture may begin until the user explicitly grants consent per stream:

- Microphone (required for voice)
- Camera (optional; default OFF)
- Wearables (optional; default OFF)
  - per-metric selection (HR, sleep, steps, activity, etc.)

Users must be able to disable any stream instantly.

## Data Minimization
Default behavior:

- **Do not store raw audio/video** in the cloud.
- Process audio/video locally to derive features/events.
- Persist only feature-level events and bounded session metrics.

## Local-Only Mode
A Local-Only Mode must be supported:

- no cloud storage
- on-device computation
- user can export/delete locally

## Wearables (Native Bridge Requirement)
- Android: Health Connect is the primary hub; Wear OS Health Services provides live HR on-watch.
- iOS: HealthKit provides reads; near-real-time via standard HealthKit patterns.

Web-only clients must use a native bridge to access these APIs.

## Auditability
All access to imprint/profile data should be logged:

- who (userId scoped)
- what (metric category)
- when
- why (purpose)
- component

## Non-Clinical Outputs
Allowed:

- energy/load/focus readiness
- habit patterns
- “unknown (insufficient data)”

Prohibited:

- diagnosis
- medical advice
- clinical labeling or mental health claims

## Reversibility
- Disabling a stream immediately stops capture and suppresses future events.
- System must degrade gracefully with explicit “missing stream” confidence reductions.
