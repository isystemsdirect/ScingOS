import type { UserStateEstimate } from '../imprint/state';

export type ModulationOverlay = {
  // Delivery shaping only. These are session overlays, not permanent preference edits.
  verbosityDelta?: -2 | -1 | 0 | 1 | 2;
  paceDeltaWpm?: number; // negative = slower
  requireCheckpoints?: boolean;
  preferCbFirst?: boolean;
  assumptionRateLimit?: 'tight' | 'normal';
  spokenChunkMaxCharsDelta?: number; // negative = shorter spoken chunks
  reasons: string[];
};

function clampInt(x: number, min: number, max: number): number {
  if (!Number.isFinite(x)) return min;
  if (x < min) return min;
  if (x > max) return max;
  return Math.trunc(x);
}

export function computeModulationPolicy(params: {
  state: UserStateEstimate;
  confidenceGate?: number;
}): ModulationOverlay | null {
  const gate = typeof params.confidenceGate === 'number' ? params.confidenceGate : 0.7;
  const { state } = params;

  if (state.confidence < gate) return null;

  // Safe, non-manipulative modulation rules.
  if (state.load === 'high') {
    return {
      verbosityDelta: -1,
      paceDeltaWpm: -10,
      requireCheckpoints: true,
      spokenChunkMaxCharsDelta: -120,
      assumptionRateLimit: 'tight',
      reasons: [...state.reasons, 'policy: load=high -> shorter turns + checkpoints'],
    };
  }

  if (state.energy === 'low') {
    return {
      verbosityDelta: -1,
      preferCbFirst: true,
      requireCheckpoints: true,
      paceDeltaWpm: -5,
      spokenChunkMaxCharsDelta: -80,
      reasons: [...state.reasons, 'policy: energy=low -> CB-first + next actions'],
    };
  }

  if (state.energy === 'high') {
    const rawPaceDelta = state.load === 'low' ? 7 : 5;
    return {
      verbosityDelta: 0,
      paceDeltaWpm: clampInt(rawPaceDelta, 0, 10),
      requireCheckpoints: false,
      reasons: [...state.reasons, 'policy: energy=high -> normal delivery'],
    };
  }

  return {
    verbosityDelta: 0,
    paceDeltaWpm: 0,
    requireCheckpoints: false,
    preferCbFirst: false,
    assumptionRateLimit: 'normal',
    spokenChunkMaxCharsDelta: 0,
    reasons: [...state.reasons, 'policy: no overlay'],
  };
}
