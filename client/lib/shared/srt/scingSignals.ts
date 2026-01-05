export type ScingPhase = "pre_imprint" | "imprinting" | "co_aware" | "suspended";

export type ScingAffect = "calm" | "focused" | "curious" | "alert" | "protective" | "recovering";
export type ScingSpeechMode = "silent" | "listening" | "thinking" | "speaking";

export type ScingSignals = {
  ts: number; // epoch ms
  iuPartnerId?: string;

  // Co-awareness lifecycle (does NOT imply self-awareness)
  phase: ScingPhase;

  // Cognitive state scalars (0..1)
  confidence: number;      // reasoning certainty
  load: number;            // cognitive load
  urgency: number;         // time pressure
  stability: number;       // emotional/behavioral stability (higher = smoother)
  novelty: number;         // exploration / creative variance (phase-limited)
  safety: number;          // safety posture intensity (higher = stricter)
  coherence: number;       // output coherence / structure preference

  // Discrete modes
  speechMode: ScingSpeechMode;
  affect: ScingAffect;

  // Delivery hints (optional)
  verbosityDelta?: -2 | -1 | 0 | 1 | 2;
  paceWpmDelta?: number; // negative slows speech cadence
  checkpointing?: boolean; // “CB-first” / checkpoints

  // Diagnostics (optional, for dev console only)
  reasons?: string[];
};

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function normalizeSignals(s: ScingSignals): ScingSignals {
  return {
    ...s,
    confidence: clamp01(s.confidence),
    load: clamp01(s.load),
    urgency: clamp01(s.urgency),
    stability: clamp01(s.stability),
    novelty: clamp01(s.novelty),
    safety: clamp01(s.safety),
    coherence: clamp01(s.coherence),
  };
}
