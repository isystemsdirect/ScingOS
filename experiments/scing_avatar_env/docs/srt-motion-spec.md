# SRT Motion Spec (Sandbox)

This document describes how `AvatarStateVector` drives the “Motion Scan” avatar visuals in the sandbox, with deterministic behavior suitable for repeatable testing.

## Scope

- Applies only to the sandbox under `experiments/scing_avatar_env/**`.
- Visuals consume state via the bridge only (no sensors imported in visual code).

## Canonical state: AvatarStateVector

`AvatarStateVector` is the compact control surface exposed to visuals/adapters:

- `arousal`: $[0,1]$ (energy / intensity)
- `valence`: $[-1,1]$ (warm ↔ cool bias; bounded)
- `cognitiveLoad`: $[0,1]$ (tension / damping)
- `rhythm`: $[0,1]$ (flow cadence)
- `entropy`: $[0.02,0.08]$ (baseline noise budget; bridge value is clamped)
- `focus`: $[0,1]$ (coherence / directionality)

Type + clamp utilities: `src/influence/AvatarStateVector.ts`.

## Data flow and responsibilities

- **Sensors (demo-only):** `src/sensors/SensorStub.ts`
  - `sampleStubSensors(time)` returns a deterministic patch.
  - Does **not** set `entropy` (entropy modulation is handled locally at the uniform boundary).

- **Single state boundary:** `src/influence/InfluenceBridge.ts`
  - Stores the canonical `AvatarStateVector`.
  - `setAvatarState(patch)` clamps on write and returns the new state.
  - No smoothing, timers, randomness, or sensor access.

- **Uniform boundary (smoothing + micro-entropy):** `src/visual/useAvatarVisual.ts`
  - Reads state via `getAvatarState()`.
  - Applies continuous smoothing (no tweens/queues) and writes shader uniforms.
  - Computes `entropy` uniform via `src/influence/EntropyIntegrator.ts`.

- **Render-only scene:** `src/visual/Scene3D.tsx`
  - Owns geometry/material setup.
  - Calls `useAvatarVisual(materialRef)`; does not update uniforms directly.

## Determinism rules

- No `Math.random()` or `Date.now()` in the visual loop.
- The demo sensor stub is deterministic in `time`.
- Micro-entropy is deterministic in `time` (see `EntropyIntegrator`).

## How Motion Scan maps state to visuals

- `arousal`: increases emission/intensity and deformation amplitude.
- `valence`: subtle bounded bias shifting the gradient warm/cool.
- `cognitiveLoad`: increases tension (reduces fluidity; biases toward sharper motion).
- `rhythm`: modulates advection/curl cadence.
- `entropy` (uniform): adds small, continuous jitter to prevent mechanical repetition.
- `focus`: increases coherence (reduces chaotic spread).

Shader implementation: `src/visual/FlameMaterial.ts`.

## Running the sandbox

From `experiments/scing_avatar_env`:

- `npm.cmd install`
- `npm.cmd run build`
- `npm.cmd run dev`

Optional actuation (OpenRGB): see `src/adapters/openrgb/OpenRGBAdapter.ts` (`runOpenRgbInfluenceLoop`).
