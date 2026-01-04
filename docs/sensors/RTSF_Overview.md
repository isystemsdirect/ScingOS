# Real-Time Sensor Fabric (RTSF) — Overview

## Prime Directive (Non‑Negotiable)
Continuous live sensing must be:

1. **Consented** (explicit opt-in before any capture)
2. **Minimized** (feature-only by default)
3. **User‑owned** (view/export/delete; local-only option)
4. **Auditable** (what read, when, why, by which component)
5. **Reversible** (disable instantly; graceful degradation)

**No raw audio/video cloud storage by default.** Store **derived features + events** only.

## Not Medical (Hard Rule)
RTSF supports **non-clinical** estimation:

- energy / load / focus readiness
- habit patterns and interaction style

RTSF must not diagnose, label, or infer medical/mental health conditions.

## Single Authority
All sensor fusion outputs flow through **Scing neural arbitration**.

- No subsystem may bypass Scing by injecting “final decisions” directly into UI.

## Streams + Bus
RTSF is defined as 4 concurrent streams + 1 fusion bus:

- **Stream A (Mic):** audio frames → VAD events + speech events
- **Stream B (Camera):** video frames → lightweight perception features (motion/lighting/optional face-present)
- **Stream C (Wearables Android):** Health Connect aggregates + Wear OS Health Services live HR (via native bridge)
- **Stream D (Wearables iOS):** HealthKit reads (via native bridge)
- **Bus:** time-aligned, user-scoped **feature-only** event bus

## Web Reality Check (Wearables)
A pure web app cannot access HealthKit / Health Connect.

- Wearables require a **native bridge** (phone app and optional watch companion).
- Web UI consumes live events via SSE/WS from the bridge or backend.

## Feature-Only Processing
### Mic
- Convert to short frames (e.g., 20ms), compute RMS + clipping
- Emit VAD events (speech_start/speech_end)
- Do not persist audio; keep transient buffers only

### Camera
- Compute only lightweight features:
  - motionEnergy (frame diff)
  - lightingLevel (avg luminance)
  - facePresent (optional; local-only; no identity)
- Do not store frames; no face ID

### Wearables
- Normalize metrics into a minimal set (HR/HRV/sleep/activity/workouts)
- Treat iOS near-real-time as *best-effort*, not guaranteed sub-second streaming

## Fusion Window
Fusion runs in sliding windows:

- default window: 2000ms
- default step: 250ms

Each window aggregates available stream features and emits a FeatureVector with:

- explicit sources[]
- computed confidence (lower when streams missing or low-quality)
- no hallucinated values (missing stays missing)

## Derived State
From each fused window, RTSF can compute a conservative derived state:

- energy/load/focus readiness
- confidence
- explicit reasons[]

If evidence is insufficient, the state is **unknown**.
