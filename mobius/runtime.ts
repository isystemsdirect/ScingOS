import type { MobiusInputs, MobiusParams, MobiusState } from './types';
import { mobiusGate } from './gate';
import type { NeuralSignal } from './signal';
import { invertSemantics, blendSemantics } from './signal';
import { colorFromPhase, applyIntensity, type RGB } from './palettes';

export type MobiusTelemetry = {
  phase: number;
  invertedLatched: boolean;
  inversionAmplitude: number;
  family: 'LARI' | 'BANE' | 'SCING';
  baseColor: RGB;
  emissiveColor: RGB;
};

export function tickMobius(
  state: MobiusState<NeuralSignal>,
  inputs: MobiusInputs,
  params: MobiusParams,
): { state: MobiusState<NeuralSignal>; telem: MobiusTelemetry } {
  const next = mobiusGate(state, inputs, params, invertSemantics, blendSemantics);

  const family = next.invertedLatched ? 'BANE' : 'LARI';
  const baseColor = colorFromPhase({
    family,
    phase: next.phase,
    invertedLatched: next.invertedLatched,
  });

  // SCING overlay can be computed separately if needed; here we keep it available by rule
  const emissiveColor = applyIntensity(baseColor, next.inversionAmplitude);

  return {
    state: next,
    telem: {
      phase: next.phase,
      invertedLatched: next.invertedLatched,
      inversionAmplitude: next.inversionAmplitude,
      family,
      baseColor,
      emissiveColor,
    },
  };
}
