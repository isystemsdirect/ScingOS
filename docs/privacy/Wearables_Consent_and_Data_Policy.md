# Wearables Consent and Data Policy (Health‑Adjacent)

## Scope
This policy governs **health-adjacent** metrics used to support Scing’s non-clinical **imprint monitoring** and delivery modulation.

This capability is **not medical** and must not generate diagnoses, medical advice, or clinical labels.

## Default: OFF (Explicit Opt‑In)
Wearables integration is disabled by default.

Enabling wearables requires explicit, informed consent and permission scopes per metric category.

## Data Minimization (Store Only What We Need)
The system should collect a minimal Normalized Metric Set (NMS):

- Heart rate (bpm)
- HRV (ms) if available
- Sleep summary (start/end, duration; stages only if user opts in)
- Steps / activity minutes
- Workout sessions (type, duration)
- Optional (opt-in only): respiration rate, skin temperature

## Local‑First + Minimize Storage
- Provide a **Local‑Only Mode**: store and process on-device; no cloud storage.
- If cloud storage is enabled:
  - Encrypt at rest
  - Scope storage strictly by userId
  - Retain only summaries / aggregates when possible

## No Raw Audio Storage (Personalization)
Wearables personalization and imprint monitoring must not store raw audio. Only metrics, counts, bounded preferences, and aggregate statistics are allowed.

## No Third‑Party Sharing by Default
- No third-party sharing by default.
- Any sharing must be explicit opt-in and auditable.

## User Rights
Users must be able to:

- View what metrics are enabled
- View/export all stored imprint/profile data
- Delete all imprint/profile data
- Disable wearables integration instantly

## Auditability
All access should be auditable:

- What was read
- When it was read
- Why it was read (purpose string)
- Which component accessed it

## Non‑Clinical Language Requirements
Outputs and UI must use non-clinical terms like:

- “energy/load/focus readiness”
- “baseline / deviation”
- “unknown (insufficient data)”

Hard ban clinical labels or mental health diagnosis terms unless under a regulated workflow (out of scope).

## Platforms (Implementation Notes)
- Android: Health Connect as the primary health data hub.
- Wear OS: Health Services for on-watch sensors and efficient live metrics.
- iOS: HealthKit; iPhone as aggregator (Apple Watch feeds Health app; app reads via HealthKit).

A web-only client (Next.js) requires a native bridge (e.g., companion native app or thin native shell) to access HealthKit/Health Connect.
