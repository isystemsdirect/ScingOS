import { ScingSignals, clamp01, normalizeSignals } from "./scingSignals";
import { SrtControls } from "./srtControls";

function mix(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

export function mapScingToSrt(raw: ScingSignals): SrtControls {
  const s = normalizeSignals(raw);

  // Core principles:
  // - confidence ↑ => smoother, calmer, more coherent motion
  // - load ↑ => slower, shorter, checkpoint-y feel (less motion energy)
  // - urgency ↑ => sharper + brighter + faster pulse
  // - safety ↑ => sharpness ↑, coolness ↑, motion energy constrained
  // - novelty ↑ => shimmer ↑ (but clamp by stability/safety)
  const calmness = clamp01(s.stability * (1 - s.urgency));
  const tension = clamp01(s.urgency * 0.7 + s.load * 0.3);

  const noveltyAllowed = clamp01(s.novelty * (1 - s.safety) * s.stability);

  const modeTag =
    s.speechMode === "listening" ? "listen" :
    s.speechMode === "thinking" ? "think" :
    s.speechMode === "speaking" ? "speak" :
    s.affect === "alert" || s.affect === "protective" ? "alert" :
    "idle";

  const glow = clamp01(
    0.25 +
    0.45 * s.confidence +
    0.25 * s.urgency
  );

  const shimmer = clamp01(
    0.10 +
    0.55 * noveltyAllowed +
    0.15 * (1 - s.coherence)
  );

  const motionEnergy = clamp01(
    0.20 +
    0.45 * (1 - s.load) +
    0.20 * s.urgency -
    0.25 * s.safety
  );

  const fluidity = clamp01(
    0.25 +
    0.55 * s.stability +
    0.20 * s.confidence -
    0.25 * tension
  );

  const sharpness = clamp01(
    0.10 +
    0.55 * s.urgency +
    0.30 * s.safety -
    0.25 * calmness
  );

  // Color bias
  const warmthBase =
    s.affect === "curious" ? 0.65 :
    s.affect === "focused" ? 0.45 :
    s.affect === "calm" ? 0.35 :
    0.30;

  const warmth = clamp01(mix(warmthBase, 0.25, s.safety));
  const coolness = clamp01(mix(0.25, 0.70, s.safety));

  // Timing: pulse follows urgency; breathe follows calmness
  const pulseRate = clamp01(0.20 + 0.65 * s.urgency + 0.15 * noveltyAllowed);
  const breatheRate = clamp01(0.20 + 0.65 * calmness);

  return {
    ts: s.ts,
    glow,
    shimmer,
    motionEnergy,
    fluidity,
    sharpness,
    warmth,
    coolness,
    pulseRate,
    breatheRate,
    modeTag,
  };
}
