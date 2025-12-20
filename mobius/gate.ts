import type { MobiusInputs, MobiusParams, MobiusState } from './types';
import type { SemanticBlend, SemanticDual } from './semantics';

const TAU = Math.PI * 2;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function wrap2Pi(x: number) {
  let y = x % TAU;
  if (y < 0) y += TAU;
  return y;
}

// smoothstep(0, eps, eps - d)  => 1 near boundary, 0 outside band
function bandFactorNearPi(phase: number, eps: number) {
  const d = Math.abs(phase - Math.PI);
  const x = clamp((eps - d) / eps, 0, 1);
  return x * x * (3 - 2 * x);
}

function g(rhythm: number, cognitiveLoad: number, focus: number) {
  // your proposed bounded choice
  return 0.35 + 0.45 * rhythm + 0.25 * (1 - focus) + 0.35 * cognitiveLoad;
}

function computeDelta(
  dt: number,
  k: number,
  rhythm: number,
  cognitiveLoad: number,
  focus: number,
) {
  const raw = k * dt * g(rhythm, cognitiveLoad, focus);
  const dMin = 0.002 * Math.PI * dt;
  const dMax = 0.08 * Math.PI * dt;
  return clamp(raw, dMin, dMax);
}

function computeAmplitude(
  aMax: number,
  w1: number,
  w2: number,
  cognitiveLoad: number,
  focus: number,
) {
  const aRaw = w1 * cognitiveLoad + w2 * (1 - focus);
  return clamp(aRaw, 0, aMax);
}

export function mobiusGate<TSignal>(
  state: MobiusState<TSignal>,
  inputs: MobiusInputs,
  params: MobiusParams,
  dual: SemanticDual<TSignal>,
  blend: SemanticBlend<TSignal>,
): MobiusState<TSignal> {
  const dt = Math.max(0, inputs.dt);

  // 1) deterministic Δ
  const delta = computeDelta(
    dt,
    params.k,
    inputs.rhythm,
    inputs.cognitiveLoad,
    inputs.focus,
  );

  // 2) phase advance + modulo
  const phaseNext = wrap2Pi(state.phase + delta);

  // 3) hysteresis latch around π
  const eps = params.eps;
  const inv = state.invertedLatched;

  let invertedLatchedNext = inv;
  if (!inv) {
    if (phaseNext >= Math.PI + eps) invertedLatchedNext = true;
  } else {
    if (phaseNext <= Math.PI - eps) invertedLatchedNext = false;
  }

  // 4) inversion amplitude clamp
  const aClamped = computeAmplitude(
    params.aMax,
    params.w1,
    params.w2,
    inputs.cognitiveLoad,
    inputs.focus,
  );

  // 5) smooth band factor (no snap at π)
  const sBand = bandFactorNearPi(phaseNext, eps);

  // invFlagSmoothed rises smoothly inside band when we are latched inverted
  const invFlagSmoothed = invertedLatchedNext ? sBand : 0;

  // 6) semantic flow
  // normal: pass-through (a=0)
  // inverted: blend toward dual with bounded amplitude * band factor
  const aApplied =
    aClamped *
    (invertedLatchedNext ? 1 : 0) *
    (invertedLatchedNext ? Math.max(invFlagSmoothed, 0.15) : 0);
  // Note: floor of 0.15 inside inverted prevents “inversion disappears” away from boundary; set to 0 if you want boundary-only.

  const dualSig = dual(state.signal);
  const signalNext = invertedLatchedNext
    ? blend(state.signal, dualSig, aApplied)
    : state.signal;

  return {
    signal: signalNext,
    phase: phaseNext,
    invertedLatched: invertedLatchedNext,
    inversionAmplitude: aApplied,
  };
}
