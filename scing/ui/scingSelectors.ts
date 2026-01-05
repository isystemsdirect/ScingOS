import type { ScingState } from './scingState';

export function selectEngineStatus(state: ScingState, engineId: string) {
  return state.engines[engineId];
}

export function selectHUDChannels(state: ScingState) {
  return Object.values(state.hud.channels);
}
