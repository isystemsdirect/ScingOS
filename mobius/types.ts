export type Orientation = 'normal' | 'inverted';

export type MobiusInputs = {
  rhythm: number; // 0..1
  cognitiveLoad: number; // 0..1
  focus: number; // 0..1
  dt: number; // seconds (>=0)
};

export type MobiusParams = {
  k: number; // traversal gain (suggest 1.0)
  eps: number; // hysteresis half-band (radians) (suggest 0.05*Math.PI)
  aMax: number; // max inversion amplitude (<=1)
  w1: number; // weight cognitiveLoad → amplitude
  w2: number; // weight (1-focus) → amplitude
};

export type MobiusState<TSignal> = {
  signal: TSignal;
  phase: number; // [0, 2π)
  invertedLatched: boolean; // hysteresis latch
  inversionAmplitude: number; // 0..aMax (smoothed band-applied)
};
