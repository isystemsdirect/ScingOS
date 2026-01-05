# Influence-to-Actuation: AvatarStateVector → ARGB Lighting (OpenRGB Adapter)

This experiment demonstrates SCINGULAR’s “Influence → Actuation” pathway: a continuously updated `AvatarStateVector` drives avatar visuals and can optionally drive external ARGB lighting in near real time. The result is a coherent feedback loop spanning on-screen presence (the avatar shader) and physical ambient signals (LED devices). The architecture keeps the pipeline stable while adapters remain vendor-swappable.

## 5-step pipeline (fusion → influence → motifs → mapping → actuation)

1) Sensor fusion
Multiple streams (bio/prosody/context telemetry) are merged into a single flux signal that is stable enough for continuous control.

2) State modulation
The fused signal is ingested into a compact `AvatarStateVector` representation that preserves responsiveness while avoiding dead-zones and rigid convergence.

3) Motif shaping
Motif logic biases influence trajectories toward recognizable motifs, with controlled jitter to prevent mechanical repetition.

4) Color mapping
Influence is converted into linear RGB (0–1). Before LED output, values are clamped and gamma-corrected for perceptual brightness.

5) Actuation
A device adapter writes the resulting color to LEDs. The adapter boundary isolates vendor SDKs from the rest of the system.

## Security gating (BANE; fail-closed)

All hardware actuation MUST pass through a capability gate (BANE). The adapter must require explicit capability approval before writing to devices (e.g., `device.rgb.write`). If authorization fails, the system must refuse to actuate.

## Vendor extensibility

The adapter is designed to be vendor-neutral. Implementations can target OpenRGB, Razer, Logitech, or other SDKs behind the same adapter surface, keeping the influence pipeline and visuals unchanged.

## Runtime defaults (OpenRGB adapter)

- Default update cadence: 20Hz (`intervalMs = 50`)
- Loop semantics: backpressure-safe (no async overlap)
- Device selection: optional preferred name, otherwise safe fallback

## Where it lives

- Adapter entrypoint: `src/adapters/openrgb/OpenRGBAdapter.ts` (`runOpenRgbInfluenceLoop`)
- Single state boundary: `src/influence/InfluenceBridge.ts`
