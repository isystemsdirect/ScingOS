import type { ColorFlux } from "./colorFlux.types";

export type SrtControls = {
  ts: number;

  // Visual intensity scalars (0..1)
  glow: number;
  shimmer: number;
  motionEnergy: number;   // how much it moves
  fluidity: number;       // how smooth vs jittery
  sharpness: number;      // edges / spikes / “alertness”
  warmth: number;         // warm spectrum bias
  coolness: number;       // cool spectrum bias

  // Animation timing
  pulseRate: number;      // 0..1 normalized (map to seconds in renderer)
  breatheRate: number;    // 0..1 normalized

  // State tags for renderer (optional)
  modeTag: "idle" | "listen" | "think" | "speak" | "alert";

  // Color is “what”, scalars are “how”
  colorFlux?: ColorFlux;
};
